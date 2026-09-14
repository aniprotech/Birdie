import { visitEvent } from "../client-feed-schema.js";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { reply, fail } from "../http.js";
import { registerPlanning } from './roster-planning.js';

const dayMs = 86400000;
const dateOnly = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !isNaN(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
const input = z.object({
  clientId: z.uuid(),
  staffId: z.uuid().nullable(),
  date: z.string().refine(dateOnly),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  title: z.string().trim().min(1).max(160),
  notes: z.string().max(4000).default(""),
  status: z.enum(["DRAFT", "SCHEDULED"]),
  repeatWeeks: z.number().int().min(1).max(12).default(1),
  revision: z.number().int().positive().optional(),
});
export function occursOn(row, day) {
  if (
    row.deletedAt ||
    day < row.startDate ||
    (row.isEnds && row.endDate && day > row.endDate) ||
    row.deletedDate?.includes(day)
  )
    return false;
  const offset = Math.round(
    (Date.parse(day) - Date.parse(row.startDate)) / dayMs,
  );
  const weekday = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ][new Date(day).getUTCDay()];
  if (row.frequency === "DAILY") return true;
  if (row.frequency === "WEEKLY") return row.selectedDays?.includes(weekday);
  if (row.frequency === "CUSTOM") {
    const every = Number(row.repeatEvery);
    if (!Number.isInteger(every) || every < 1) return false;
    if (row.repeatUnit === "DAYS") return offset % every === 0;
    // Weekly recurrence is anchored to the Monday of the starting week.
    const startWeekday = (new Date(row.startDate).getUTCDay() + 6) % 7;
    return (
      Math.floor((offset + startWeekday) / 7) % every === 0 &&
      row.selectedDays?.includes(weekday)
    );
  }
  return day === row.startDate;
}
const select = `SELECT v.id,v.client_id AS "clientId",v.staff_id AS "staffId",v.visit_date::text AS date,
  to_char(v.start_time,'HH24:MI') AS "startTime",to_char(v.end_time,'HH24:MI') AS "endTime",
  v.title,v.notes,v.status,v.revision,c.first_name || ' ' || c.last_name AS "clientName",
  s.first_name || ' ' || s.last_name AS "staffName" FROM node_roster_visits v
  JOIN users c ON c.id=v.client_id LEFT JOIN users s ON s.id=v.staff_id`;

export function registerRoster(ctx, route) {
  const { db, repo, auth } = ctx;
  async function lock(req) {
    if (!req.user.agencyId) fail(403, "An organisation is required");
    await db.query(
      "SELECT id FROM users WHERE agency_id=$1 ORDER BY id FOR UPDATE",
      [req.user.agencyId],
    );
  }
  async function get(req, id) {
    const row = (
      await db.query(select + " WHERE v.id=$1 AND v.agency_id=$2", [
        id,
        req.user.agencyId,
      ])
    ).rows[0];
    if (!row || (req.user.role === "CAREGIVER" && row.staffId !== req.user.id))
      fail(404, "Visit not found");
    return row;
  }
  async function check(req, v, id = null) {
    if (v.endTime <= v.startTime)
      fail(400, "End time must be after start time on the same day");
    const date = new Date(v.date),
      month = date.getUTCMonth();
    const clockChange =
      [2, 9].includes(month) &&
      date.getUTCDay() === 0 &&
      new Date(date.getTime() + 7 * dayMs).getUTCMonth() !== month;
    if (clockChange && v.startTime < "02:00" && v.endTime > "01:00")
      fail(
        400,
        "Visits across the London clock-change hour need to be split outside 01:00–02:00",
      );
    const client = await auth.userAccess(req, v.clientId, { write: true });
    if (client.role !== "USER" || !client.isActive || client.deletedAt)
      fail(400, "Choose an active client");
    const inactivity = await repo.find("ClientInactivityEntity", {
      user: v.clientId,
    });
    if (
      inactivity.some(
        (i) =>
          !i.deletedAt &&
          i.startDate &&
          i.startDate + "T" + (i.startTime || "00:00:00") <
            v.date + "T" + v.endTime + ":00" &&
          (i.type === "PERMANENT" ||
            !i.endDate ||
            i.endDate + "T" + (i.endTime || "23:59:59") >
              v.date + "T" + v.startTime + ":00"),
      )
    )
      fail(409, "The client is inactive during this visit");
    if (v.status === "SCHEDULED" && !v.staffId)
      fail(400, "Assign a staff member before scheduling");
    if (v.staffId) {
      const staff = await auth.userAccess(req, v.staffId, {
        staff: true,
        write: true,
      });
      if (!staff.isActive || staff.deletedAt)
        fail(400, "Choose an active staff member");
      const absences = await repo.find("TeamAbsenceEntity", {
        user: v.staffId,
      });
      const start = v.date + "T" + v.startTime + ":00",
        end = v.date + "T" + v.endTime + ":00";
      if (
        absences.some(
          (a) =>
            !a.deletedAt &&
            a.startDate + "T" + (a.startTime || "00:00:00") < end &&
            (a.endDate || a.startDate) + "T" + (a.endTime || "23:59:59") >
              start,
        )
      )
        fail(409, "Staff member is absent during this visit");
      const availability = (
        await repo.find("TeamAvailabilityEntity", { user: v.staffId })
      ).filter((a) => !a.deletedAt);
      if (
        availability.length &&
        !availability.some(
          (a) =>
            occursOn(a, v.date) &&
            a.startTime.slice(0, 5) <= v.startTime &&
            a.endTime.slice(0, 5) >= v.endTime,
        )
      )
        fail(409, "Visit is outside this staff member’s recorded availability");
    }
    const overlap = await db.query(
      `SELECT id FROM node_roster_visits WHERE agency_id=$1 AND visit_date=$2
      AND status<>'CANCELLED' AND ($3::uuid IS NULL OR id<>$3) AND start_time<$5::time AND end_time>$4::time
      AND (client_id=$6 OR ($7::uuid IS NOT NULL AND staff_id=$7)) LIMIT 1`,
      [
        req.user.agencyId,
        v.date,
        id,
        v.startTime,
        v.endTime,
        v.clientId,
        v.staffId,
      ],
    );
    if (overlap.rows.length)
      fail(409, "This client or staff member already has an overlapping visit");
  }
  registerPlanning({...ctx,check,lock,get,select,input},route);
  route("GET", "/api/roster/options", async (req, res) => {
    const people = await repo.find("UserEntity", {
      agencyId: req.user.agencyId,
    });
    const active = people.filter((u) => u.isActive && !u.deletedAt);
    const safe = (u) => ({
      id: u.id,
      name: [u.firstName, u.lastName].filter(Boolean).join(" "),
    });
    const caregiver = req.user.role === "CAREGIVER";
    return reply(res, {
      timezone: "Europe/London",
      canManage: !caregiver,
      clients: caregiver
        ? []
        : active.filter((u) => u.role === "USER").map(safe),
      staff: active
        .filter(
          (u) => u.role !== "USER" && (!caregiver || u.id === req.user.id),
        )
        .map(safe),
    });
  });
  route("GET", "/api/roster/visits", async (req, res) => {
    const { from, to } = req.query;
    if (
      !dateOnly(from) ||
      !dateOnly(to) ||
      to < from ||
      (Date.parse(to) - Date.parse(from)) / dayMs > 62
    )
      fail(400, "Choose a date range of up to 63 days");
    const rows = (
      await db.query(
        select +
          ` WHERE v.agency_id=$1 AND v.visit_date BETWEEN $2 AND $3
      AND ($4::uuid IS NULL OR v.staff_id=$4) ORDER BY v.visit_date,v.start_time,v.id`,
        [
          req.user.agencyId,
          from,
          to,
          req.user.role === "CAREGIVER" ? req.user.id : null,
        ],
      )
    ).rows;
    return reply(res, { visits: rows, timezone: "Europe/London" });
  });
  route("POST", "/api/roster/visits", async (req, res) => {
    auth.admin(req);
    const parsed = input.safeParse(req.body);
    if (!parsed.success)
      fail(400, "Enter a valid client, date, times, title and status");
    const v = parsed.data;
    await lock(req);
    const visits = [];
    for (let week = 0; week < v.repeatWeeks; week++) {
      const visit = {
        ...v,
        date: new Date(Date.parse(v.date) + week * 7 * dayMs)
          .toISOString()
          .slice(0, 10),
      };
      await check(req, visit);
      const id = randomUUID();
      await db.query(
        `INSERT INTO node_roster_visits(id,agency_id,client_id,staff_id,visit_date,start_time,end_time,title,notes,status,created_by,updated_by)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11)`,
        [
          id,
          req.user.agencyId,
          v.clientId,
          v.staffId,
          visit.date,
          v.startTime,
          v.endTime,
          v.title,
          v.notes,
          v.status,
          req.user.id,
        ],
      );
      await visitEvent(db, id, req.user.id, "Visit schedule created");
      visits.push(await get(req, id));
    }
    return reply(res, { visits }, "Visits created", 201);
  });
  route("PUT", "/api/roster/visits/:id", async (req, res) => {
    auth.admin(req);
    await lock(req);
    const old = await get(req, req.params.id);
    const parsed = input.safeParse(req.body);
    if (!parsed.success) fail(400, "Enter valid visit details");
    const v = parsed.data;
    if (v.revision !== old.revision)
      fail(409, "This visit changed. Refresh before saving");
    if (!["DRAFT", "SCHEDULED"].includes(old.status))
      fail(409, "Only draft or scheduled visits can be edited");
    if (v.repeatWeeks !== 1) fail(400, "Edit one visit at a time");
    await check(req, v, old.id);
    await db.query(
      `UPDATE node_roster_visits SET client_id=$2,staff_id=$3,visit_date=$4,start_time=$5,end_time=$6,title=$7,notes=$8,status=$9,
      revision=revision+1,updated_by=$10,updated_at=CURRENT_TIMESTAMP WHERE id=$1`,
      [
        old.id,
        v.clientId,
        v.staffId,
        v.date,
        v.startTime,
        v.endTime,
        v.title,
        v.notes,
        v.status,
        req.user.id,
      ],
    );
    await visitEvent(db, old.id, req.user.id, "Visit schedule or assigned carer updated");
    return reply(res, await get(req, old.id), "Visit updated");
  });
  route("POST", "/api/roster/visits/:id/status", async (req, res) => {
    await lock(req);
    const old = await get(req, req.params.id),
      next = req.body.status;
    if (req.body.revision !== old.revision)
      fail(409, "This visit changed. Refresh before updating");
    const transitions = {
      DRAFT: ["CANCELLED"],
      SCHEDULED: ["IN_PROGRESS", "CANCELLED"],
      IN_PROGRESS: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    };
    if (!transitions[old.status].includes(next))
      fail(400, "This status change is not allowed");
    if (req.user.role === "CAREGIVER" && next === "CANCELLED")
      fail(403, "Only an administrator can cancel visits");
    await db.query(
      "UPDATE node_roster_visits SET status=$2,revision=revision+1,updated_by=$3,updated_at=CURRENT_TIMESTAMP WHERE id=$1",
      [old.id, next, req.user.id],
    );
    if (next === "IN_PROGRESS") await db.query("UPDATE node_roster_visits SET actual_start=COALESCE(actual_start,CURRENT_TIMESTAMP) WHERE id=$1", [old.id]);
    if (next === "COMPLETED") await db.query("UPDATE node_roster_visits SET actual_end=COALESCE(actual_end,CURRENT_TIMESTAMP) WHERE id=$1", [old.id]);
    await visitEvent(db, old.id, req.user.id, `Visit status changed from ${old.status} to ${next}`);
    return reply(res, await get(req, old.id), "Visit status updated");
  });
}
