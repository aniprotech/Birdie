import { randomUUID } from "node:crypto";
import { z } from "zod";
import { reply, fail } from "../http.js";
import { visitEvent } from "../client-feed-schema.js";

const entryInput = z.object({
  kind: z.enum(["NOTE", "ALERT", "ACTION", "ACTIVITY", "OBSERVATION"]),
  visitId: z.uuid().nullable().default(null),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(20000).default(""),
  category: z.string().trim().max(100).default(""),
  status: z
    .enum([
      "OPEN",
      "RESOLVED",
      "PENDING",
      "COMPLETED",
      "NOT_COMPLETED",
      "RECORDED",
    ])
    .default("OPEN"),
  revision: z.number().int().positive().optional(),
});
const statuses = {
  NOTE: ["RECORDED"],
  OBSERVATION: ["RECORDED"],
  ALERT: ["OPEN", "RESOLVED"],
  ACTION: ["OPEN", "RESOLVED"],
  ACTIVITY: ["PENDING", "COMPLETED", "NOT_COMPLETED"],
};
const entrySelect = `SELECT e.*,a.first_name||' '||a.last_name AS author FROM node_client_entries e JOIN users a ON a.id=e.created_by`;
const visitSelect = `SELECT v.*,v.visit_date::text AS date,to_char(v.start_time,'HH24:MI') AS "startTime",to_char(v.end_time,'HH24:MI') AS "endTime",
  c.first_name||' '||c.last_name AS "clientName",s.first_name||' '||s.last_name AS "staffName",s.primary_phone AS "staffPhone"
  FROM node_roster_visits v JOIN users c ON c.id=v.client_id LEFT JOIN users s ON s.id=v.staff_id`;
export function registerClientFeed({ db, repo, auth }, route) {
  async function client(req) {
    const user = await auth.userAccess(req, req.params.id);
    if (user.role !== "USER" || user.deletedAt) fail(404, "Client not found");
    return user;
  }
  async function visit(req, id, locking = false) {
    const row = (
      await db.query(
        visitSelect +
          " WHERE v.id=$1 AND v.client_id=$2 AND v.agency_id=$3" +
          (locking ? " FOR UPDATE OF v" : ""),
        [id, req.params.id, req.user.agencyId],
      )
    ).rows[0];
    if (!row || (req.user.role === "CAREGIVER" && row.staff_id !== req.user.id))
      fail(404, "Visit not found");
    return row;
  }
  async function entry(req, locking = false) {
    const row = (
      await db.query(
        entrySelect +
          " WHERE e.id=$1 AND e.client_id=$2 AND e.agency_id=$3" +
          (locking ? " FOR UPDATE OF e" : ""),
        [req.params.entryId, req.params.id, req.user.agencyId],
      )
    ).rows[0];
    if (!row) fail(404, "Entry not found");
    if (row.visit_id) await visit(req, row.visit_id);
    return row;
  }
  async function history(row, actor) {
    await db.query(
      "INSERT INTO node_client_entry_history(id,entry_id,revision,snapshot,actor_id) VALUES($1,$2,$3,$4,$5)",
      [randomUUID(), row.id, row.revision, JSON.stringify(row), actor],
    );
  }
  route("GET", "/api/clients/:id/feed", async (req, res) => {
    const c = await client(req);
    const kind = req.query.kind || "ALL",
      page = Number(req.query.page || 1),
      search = String(req.query.search || "").trim();
    if (
      !["ALL", "VISIT", "NOTE", "ALERT", "ACTION"].includes(kind) ||
      !Number.isInteger(page) ||
      page < 1 ||
      search.length > 200
    )
      fail(400, "Invalid feed filter");
    const from = req.query.from || null,
      to = req.query.to || null;
    for (const date of [from, to])
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))
        fail(400, "Use YYYY-MM-DD dates");
    if (from && to && from > to)
      fail(400, "End date must not precede start date");
    const staff = req.user.role === "CAREGIVER" ? req.user.id : null;
    const params = [
      c.id,
      req.user.agencyId,
      staff,
      from,
      to,
      "%" + search + "%",
    ];
    const union = `SELECT v.id,'VISIT' AS kind,v.title,v.notes AS body,v.status,
      (v.visit_date+v.start_time) AT TIME ZONE 'Europe/London' AS occurred_at,
      v.visit_date::text AS date,to_char(v.start_time,'HH24:MI') AS "startTime",to_char(v.end_time,'HH24:MI') AS "endTime",
      (extract(epoch from (v.end_time-v.start_time))/60)::int AS "plannedMinutes",
      CASE WHEN v.actual_start IS NOT NULL AND v.actual_end IS NOT NULL THEN round(extract(epoch from(v.actual_end-v.actual_start))/60)::int END AS "actualMinutes",
      (SELECT count(*)::int FROM node_client_entries e WHERE e.visit_id=v.id AND e.kind='ALERT' AND e.status='OPEN') AS alerts,
      (SELECT count(*)::int FROM node_client_entries e WHERE e.visit_id=v.id AND e.kind='OBSERVATION') AS observations,
      (SELECT count(*)::int FROM node_client_entries e WHERE e.visit_id=v.id AND e.kind='ACTIVITY' AND e.status='COMPLETED') AS activities
      FROM node_roster_visits v WHERE v.client_id=$1 AND v.agency_id=$2 AND ($3::uuid IS NULL OR v.staff_id=$3)
      AND ($4::date IS NULL OR v.visit_date>=$4) AND ($5::date IS NULL OR v.visit_date<=$5) AND (v.title ILIKE $6 OR v.notes ILIKE $6)
      UNION ALL SELECT e.id,e.kind,e.title,e.body,e.status,e.created_at,NULL,NULL,NULL,NULL,NULL,0,0,0
      FROM node_client_entries e WHERE e.client_id=$1 AND e.agency_id=$2 AND e.kind IN ('NOTE','ALERT','ACTION')
      AND ($3::uuid IS NULL OR e.visit_id IS NULL OR EXISTS(SELECT 1 FROM node_roster_visits v WHERE v.id=e.visit_id AND v.staff_id=$3))
      AND ($4::date IS NULL OR (e.created_at AT TIME ZONE 'Europe/London')::date>=$4)
      AND ($5::date IS NULL OR (e.created_at AT TIME ZONE 'Europe/London')::date<=$5) AND (e.title ILIKE $6 OR e.body ILIKE $6)`;
    const counts = (
      await db.query(
        `WITH feed AS (${union}) SELECT kind,count(*)::int AS count FROM feed GROUP BY kind`,
        params,
      )
    ).rows;
    const items = (
      await db.query(
        `WITH feed AS (${union}) SELECT * FROM feed WHERE ($7='ALL' OR kind=$7) ORDER BY occurred_at DESC,id LIMIT 30 OFFSET $8`,
        [...params, kind, (page - 1) * 30],
      )
    ).rows;
    return reply(res, {
      client: auth.publicUser(c),
      items,
      counts: Object.fromEntries(counts.map((r) => [r.kind, r.count])),
      page,
      canManage: req.user.role !== "CAREGIVER",
      timezone: "Europe/London",
    });
  });
  route("GET", "/api/clients/:id/visits/:visitId", async (req, res) => {
    await client(req);
    const v = await visit(req, req.params.visitId);
    const entries = (
      await db.query(
        entrySelect + " WHERE e.visit_id=$1 ORDER BY e.created_at,e.id",
        [v.id],
      )
    ).rows;
    const events = (
      await db.query(
        `SELECT e.*,u.first_name||' '||u.last_name AS author FROM node_visit_events e JOIN users u ON u.id=e.actor_id WHERE e.visit_id=$1 ORDER BY e.created_at,e.id`,
        [v.id],
      )
    ).rows;
    const [attendance,locationTrail,attachments]=await Promise.all([
      db.query("SELECT event,latitude,longitude,accuracy,distance_metres AS \"distanceMetres\",within_radius AS \"withinRadius\",source,created_at AS \"createdAt\" FROM node_visit_attendance WHERE visit_id=$1 ORDER BY created_at,id",[v.id]),
      db.query("SELECT latitude,longitude,accuracy,distance_metres AS \"distanceMetres\",within_radius AS \"withinRadius\",recorded_at AS \"recordedAt\" FROM node_visit_locations WHERE visit_id=$1 ORDER BY recorded_at,id",[v.id]),
      db.query("SELECT id,file_url AS url,file_name AS name,caption,latitude,longitude,accuracy,captured_at AS \"capturedAt\",created_at AS \"createdAt\" FROM node_visit_attachments WHERE visit_id=$1 ORDER BY created_at,id",[v.id]),
    ]);
    const addresses = await repo.find("UserPrimaryAddressEntity", {
      user: req.params.id,
    });
    const careTeam = (
      await repo.find("ClientCareTeamEntity", { client: req.params.id })
    ).filter((x) => !x.deletedAt && !x.declineCarer && !x.revokeViewaccess);
    const carers = [];
    for (const link of careTeam) {
      const u = await repo.get("UserEntity", link.carer);
      if (u?.agencyId === req.user.agencyId && u.isActive && !u.deletedAt)
        carers.push({
          ...auth.publicUser(u),
          preferred: !!link.preferredCarer,
        });
    }
    return reply(res, {
      visit: v,
      entries,
      events,
      attendance:attendance.rows,
      locationTrail:locationTrail.rows,
      attachments:attachments.rows,
      addresses,
      careTeam: carers,
      canManage: req.user.role !== "CAREGIVER",
      timezone: "Europe/London",
    });
  });
  route("GET", "/api/clients/:id/entries/:entryId", async (req, res) => {
    await client(req);
    const e = await entry(req);
    const versions = (
      await db.query(
        `SELECT h.revision,h.snapshot,h.created_at,u.first_name||' '||u.last_name AS author FROM node_client_entry_history h JOIN users u ON u.id=h.actor_id WHERE h.entry_id=$1 ORDER BY h.revision DESC`,
        [e.id],
      )
    ).rows;
    return reply(res, {
      entry: e,
      history: versions,
      canEdit: req.user.role !== "CAREGIVER" || e.created_by === req.user.id,
    });
  });
  async function saveEntry(req, res, editing) {
    await client(req);
    const parsed = entryInput.safeParse(req.body);
    if (!parsed.success)
      fail(
        400,
        "Enter a title and valid entry details (notes up to 20,000 characters)",
      );
    const b = parsed.data;
    if (!statuses[b.kind].includes(b.status))
      fail(400, "Invalid status for this entry type");
    if (["ACTIVITY", "OBSERVATION"].includes(b.kind) && !b.visitId)
      fail(400, "Select a visit for activities and observations");
    if (b.visitId) await visit(req, b.visitId, true);
    let row;
    if (editing) {
      const old = await entry(req, true);
      if (req.user.role === "CAREGIVER" && old.created_by !== req.user.id)
        fail(403, "Only the author or an administrator can edit this entry");
      if (old.kind !== b.kind || old.visit_id !== b.visitId)
        fail(400, "Entry type and visit cannot be changed");
      if (b.revision !== old.revision)
        fail(409, "This entry changed. Refresh before saving");
      row = (
        await db.query(
          `UPDATE node_client_entries SET title=$2,body=$3,category=$4,status=$5,revision=revision+1,updated_by=$6,updated_at=CURRENT_TIMESTAMP WHERE id=$1 RETURNING *`,
          [old.id, b.title, b.body, b.category, b.status, req.user.id],
        )
      ).rows[0];
    } else {
      row = (
        await db.query(
          `INSERT INTO node_client_entries(id,agency_id,client_id,visit_id,kind,title,body,category,status,created_by,updated_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10) RETURNING *`,
          [
            randomUUID(),
            req.user.agencyId,
            req.params.id,
            b.visitId,
            b.kind,
            b.title,
            b.body,
            b.category,
            b.status,
            req.user.id,
          ],
        )
      ).rows[0];
    }
    await history(row, req.user.id);
    if (b.visitId)
      await visitEvent(
        db,
        b.visitId,
        req.user.id,
        `${b.kind.toLowerCase()} ${editing ? "updated" : "added"}: ${b.title} (${b.status.toLowerCase().replaceAll("_", " ")})`,
      );
    return reply(res, row, "Entry saved", editing ? 200 : 201);
  }
  route("POST", "/api/clients/:id/entries", (req, res) =>
    saveEntry(req, res, false),
  );
  route("PUT", "/api/clients/:id/entries/:entryId", (req, res) =>
    saveEntry(req, res, true),
  );
  route("PUT", "/api/clients/:id/visits/:visitId/actuals", async (req, res) => {
    auth.admin(req);
    await client(req);
    const v = await visit(req, req.params.visitId, true);
    const b = req.body,
      start = new Date(b.start),
      end = b.end ? new Date(b.end) : null;
    if (b.revision !== v.revision)
      fail(409, "This visit changed. Refresh before saving");
    if (!["IN_PROGRESS", "COMPLETED"].includes(v.status))
      fail(400, "Record actual times after a visit has started");
    if (
      !b.start ||
      isNaN(start) ||
      (end && isNaN(end)) ||
      (end && end <= start) ||
      start > Date.now() ||
      (end && end > Date.now()) ||
      (v.status === "COMPLETED" && !end)
    )
      fail(
        400,
        "Enter valid past check-in and check-out times, with check-out after check-in",
      );
    if (
      typeof b.reason !== "string" ||
      b.reason.trim().length < 5 ||
      b.reason.length > 1000
    )
      fail(400, "Explain the manual time correction");
    await db.query(
      "UPDATE node_roster_visits SET actual_start=$2,actual_end=$3,revision=revision+1,updated_by=$4,updated_at=CURRENT_TIMESTAMP WHERE id=$1",
      [v.id, start.toISOString(), end?.toISOString() || null, req.user.id],
    );
    await visitEvent(
      db,
      v.id,
      req.user.id,
      `Manual attendance correction: ${v.actual_start || "unrecorded"} / ${v.actual_end || "unrecorded"} → ${start.toISOString()} / ${end?.toISOString() || "in progress"}. Reason: ${b.reason.trim()}`,
    );
    return reply(res, {}, "Actual times saved");
  });
}
