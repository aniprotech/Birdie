import { randomUUID } from "node:crypto";
import { z } from "zod";
import { reply, fail, uuid } from "../http.js";
import { notificationKeys } from "../inbox-notifications.js";
import { visitEvent } from "../client-feed-schema.js";
const date = z
  .string()
  .refine(
    (v) =>
      /^\d{4}-\d{2}-\d{2}$/.test(v) &&
      !isNaN(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v,
  );
const patch = z
  .object({
    state: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(),
    severity: z
      .enum(["UNDEFINED", "LOW", "MEDIUM", "HIGH", "CRITICAL"])
      .optional(),
    assignedTo: z.uuid().nullable().optional(),
    dueDate: date.nullable().optional(),
    archived: z.boolean().optional(),
  })
  .strict();
const state = `CASE WHEN e.status='RESOLVED' THEN 'RESOLVED' WHEN m.entry_revision=e.revision THEN COALESCE(m.state,'OPEN') ELSE 'OPEN' END`;
const archived = `(COALESCE(m.archived,false) AND e.status='RESOLVED')`;
const select = `SELECT e.id,e.kind,e.title,e.body,e.category,e.revision,e.client_id AS "clientId",e.visit_id AS "visitId",e.created_by AS "createdBy",v.staff_id AS "carerId",e.created_at AS "createdAt",e.updated_at AS "updatedAt",c.first_name||' '||c.last_name AS "clientName",${state} AS state,COALESCE(m.severity,'UNDEFINED') AS severity,m.assigned_to AS "assignedTo",m.due_date::text AS "dueDate",${archived} AS archived,u.first_name||' '||u.last_name AS "assigneeName",(SELECT count(*)::int FROM node_inbox_comments cm WHERE cm.entry_id=e.id) AS "commentCount" FROM node_client_entries e JOIN users c ON c.id=e.client_id LEFT JOIN node_inbox_details m ON m.entry_id=e.id LEFT JOIN users u ON u.id=m.assigned_to LEFT JOIN node_roster_visits v ON v.id=e.visit_id`;
export function registerInboxAlerts({ db, repo, auth, notifications }, route) {
  const defaults = {
    folder: "ALERT:OPEN",
    sort: "NEWEST",
    showPreviews: true,
    deliveryEnabled: false,
  };
  const preferences = z
    .object({
      folder: z.enum([
        "ALERT:OPEN",
        "ALERT:ALL",
        "ALERT:IN_PROGRESS",
        "ACTION:ALL",
        "ACTION:MINE",
        "ACTION:TODAY",
      ]),
      sort: z.enum(["NEWEST", "OLDEST", "SEVERITY", "DUE"]),
      showPreviews: z.boolean(),
      deliveryEnabled: z.boolean().optional(),
      notifications: z
        .partialRecord(
          z.enum(notificationKeys),
          z.object({ email: z.boolean(), sms: z.boolean() }).strict(),
        )
        .optional(),
    })
    .strict();
  route("GET", "/api/inbox/preferences", async (req, res) => {
    const row = (
      await db.query(
        "SELECT preferences,revision FROM node_inbox_preferences WHERE user_id=$1 AND agency_id=$2",
        [req.user.id, req.user.agencyId],
      )
    ).rows[0];
    return reply(res, row || { preferences: defaults, revision: 0 });
  });
  route("PUT", "/api/inbox/preferences", async (req, res) => {
    const p = preferences.safeParse(req.body.preferences),
      revision = req.body.revision;
    if (!p.success || !Number.isInteger(revision) || revision < 0)
      fail(400, "Choose valid Inbox preferences");
    if (
      p.data.deliveryEnabled &&
      (!notifications.ready().enabled || !notifications.ready().email)
    )
      fail(409, "Email transport is not available");
    const r = await db.query(
      `INSERT INTO node_inbox_preferences(user_id,agency_id,preferences,revision) SELECT $1,$2,$3,1 WHERE $4::int=0 OR EXISTS(SELECT 1 FROM node_inbox_preferences WHERE user_id=$1 AND agency_id=$2) ON CONFLICT(user_id) DO UPDATE SET preferences=$3,revision=node_inbox_preferences.revision+1,notifications_since=CASE WHEN node_inbox_preferences.preferences->'notifications' IS DISTINCT FROM $3::jsonb->'notifications' OR node_inbox_preferences.preferences->'deliveryEnabled' IS DISTINCT FROM $3::jsonb->'deliveryEnabled' THEN CURRENT_TIMESTAMP ELSE node_inbox_preferences.notifications_since END WHERE node_inbox_preferences.agency_id=$2 AND node_inbox_preferences.revision=$4 RETURNING preferences,revision`,
      [req.user.id, req.user.agencyId, JSON.stringify(p.data), revision],
    );
    if (!r.rows.length)
      fail(409, "Settings changed in another session. Reload before saving");
    return reply(res, r.rows[0], "Inbox preferences saved");
  });
  async function scope(req) {
    if (req.user.role !== "CAREGIVER") return { sql: "", ids: [] };
    const links = (
      await repo.find("ClientCareTeamEntity", { carer: req.user.id })
    ).filter(
      (l) =>
        !l.deletedAt && l.viewAccess && !l.revokeViewaccess && !l.declineCarer,
    );
    return {
      sql: " AND e.client_id=ANY($3::uuid[]) AND (m.assigned_to=$2 OR e.created_by=$2) AND (e.visit_id IS NULL OR v.staff_id=$2)",
      ids: links.map((l) => l.client),
    };
  }
  async function queryScope(req) {
    const s = await scope(req);
    return {
      sql:
        select +
        ` WHERE e.agency_id=$1 AND $2::uuid IS NOT NULL AND e.kind IN ('ALERT','ACTION') AND c.deleted_at IS NULL` +
        s.sql,
      params: s.sql
        ? [req.user.agencyId, req.user.id, s.ids]
        : [req.user.agencyId, req.user.id],
    };
  }
  async function get(req, id, lock = false) {
    uuid(id);
    if (lock)
      await db.query(
        "SELECT id FROM node_client_entries WHERE id=$1 AND agency_id=$2 FOR UPDATE",
        [id, req.user.agencyId],
      );
    const q = await queryScope(req);
    q.params.push(id);
    const row = (
      await db.query(q.sql + ` AND e.id=$${q.params.length}`, q.params)
    ).rows[0];
    if (!row) fail(404, "Inbox item not found");
    return row;
  }
  const event = (req, id, description) =>
    db.query(
      "INSERT INTO node_inbox_events(id,entry_id,actor_id,description) VALUES($1,$2,$3,$4)",
      [randomUUID(), id, req.user.id, description],
    );
  async function save(req, old, changes) {
    const p = patch.safeParse(changes);
    if (!p.success || !Object.keys(p.data).length)
      fail(400, "Choose valid changes");
    const values = p.data;
    if (
      req.user.role === "CAREGIVER" &&
      (old.assignedTo !== req.user.id ||
        Object.keys(values).some((k) => k !== "state"))
    )
      fail(403, "Only your assigned item status can be changed");
    const next = { ...old, ...values };
    if (next.archived && next.state !== "RESOLVED")
      fail(400, "Resolve the item before archiving");
    if (next.assignedTo) {
      const u = await repo.get("UserEntity", next.assignedTo, {
        collections: false,
      });
      if (
        !u ||
        u.agencyId !== req.user.agencyId ||
        u.role === "USER" ||
        !u.isActive ||
        u.deletedAt
      )
        fail(400, "Choose an active team member");
      if (u.role === "CAREGIVER") {
        const link = await repo.one("ClientCareTeamEntity", {
          client: old.clientId,
          carer: u.id,
        });
        if (
          !link ||
          !link.viewAccess ||
          link.deletedAt ||
          link.revokeViewaccess ||
          link.declineCarer
        )
          fail(400, "The assigned carer needs access to this client");
        if (old.visitId) {
          const visit = (
            await db.query(
              "SELECT staff_id FROM node_roster_visits WHERE id=$1",
              [old.visitId],
            )
          ).rows[0];
          if (visit.staff_id !== u.id)
            fail(400, "Choose the visit carer or an administrator");
        }
      }
    }
    const changed = Object.keys(values).filter((k) => old[k] !== next[k]);
    if (!changed.length) return old;
    const record = (
      await db.query(
        "UPDATE node_client_entries SET status=$2,revision=revision+1,updated_by=$3,updated_at=CURRENT_TIMESTAMP WHERE id=$1 RETURNING *",
        [old.id, next.state === "RESOLVED" ? "RESOLVED" : "OPEN", req.user.id],
      )
    ).rows[0];
    await db.query(
      "INSERT INTO node_client_entry_history(id,entry_id,revision,snapshot,actor_id) VALUES($1,$2,$3,$4,$5)",
      [
        randomUUID(),
        old.id,
        record.revision,
        JSON.stringify(record),
        req.user.id,
      ],
    );
    await db.query(
      `INSERT INTO node_inbox_details(entry_id,state,severity,assigned_to,due_date,archived,entry_revision) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(entry_id) DO UPDATE SET state=$2,severity=$3,assigned_to=$4,due_date=$5,archived=$6,entry_revision=$7`,
      [
        old.id,
        next.state,
        next.severity,
        next.assignedTo,
        next.dueDate,
        next.archived,
        record.revision,
      ],
    );
    const descriptions = [];
    for (const k of changed) {
      let value = next[k];
      if (k === "assignedTo") {
        const person = value
          ? await repo.get("UserEntity", value, { collections: false })
          : null;
        value = person
          ? `${person.firstName} ${person.lastName}`
          : "Unassigned";
      }
      if (k === "state")
        value = {
          OPEN: "Action needed",
          IN_PROGRESS: "In progress",
          RESOLVED: "Resolved",
        }[value];
      if (k === "severity")
        value = value.charAt(0) + value.slice(1).toLowerCase();
      descriptions.push(
        k === "archived"
          ? value
            ? "Item archived"
            : "Item restored"
          : `${{ state: "Status", severity: "Severity", assignedTo: "Assigned to", dueDate: "Due date" }[k]}: ${value ?? "None"}`,
      );
    }
    await event(req, old.id, descriptions.join("; "));
    if (old.visitId)
      await visitEvent(
        db,
        old.visitId,
        req.user.id,
        `Inbox ${old.kind.toLowerCase()} updated: ${old.title} (${next.state})`,
      );
    return get(req, old.id);
  }
  route("GET", "/api/inbox/items/options", async (req, res) => {
    const users = (
      await repo.find(
        "UserEntity",
        { agencyId: req.user.agencyId },
        { collections: false },
      )
    ).filter((u) => u.isActive && !u.deletedAt);
    return reply(res, {
      groups: [
        ...new Set(
          (
            await db.query(
              "SELECT g.groups FROM node_team_groups g JOIN users u ON u.id=g.user_id WHERE u.agency_id=$1 AND u.deleted_at IS NULL",
              [req.user.agencyId],
            )
          ).rows.flatMap((r) => r.groups),
        ),
      ].sort(),
      canManage: req.user.role !== "CAREGIVER",
      userId: req.user.id,
      clients:
        req.user.role === "CAREGIVER"
          ? []
          : users
              .filter((u) => u.role === "USER")
              .map((u) => ({ id: u.id, name: u.firstName + " " + u.lastName })),
      people: users
        .filter(
          (u) =>
            u.role !== "USER" &&
            (req.user.role !== "CAREGIVER" || u.id === req.user.id),
        )
        .map((u) => ({ id: u.id, name: u.firstName + " " + u.lastName })),
    });
  });
  route("GET", "/api/inbox/items", async (req, res) => {
    const advanced = z
      .object({
        recordKind: z.enum(["ALERT", "ACTION", "ALL"]).optional(),
        actionStates: z.string().max(100).optional(),
        clientId: z.uuid().optional(),
        carerId: z.uuid().optional(),
        group: z.string().max(100).optional(),
        states: z.string().max(100).optional(),
        levels: z.string().max(100).optional(),
        types: z.string().max(2000).optional(),
        assignedTo: z.union([z.uuid(), z.literal("UNASSIGNED")]).optional(),
        createdBy: z.uuid().optional(),
        from: date.optional(),
        to: date.optional(),
        dueFrom: date.optional(),
        dueTo: date.optional(),
        overdue: z.enum(["true", "false"]).optional(),
        hasVisit: z.enum(["ANY", "LINKED", "UNLINKED"]).optional(),
        sort: z.enum(["NEWEST", "OLDEST", "SEVERITY", "DUE"]).optional(),
      })
      .safeParse(
        Object.fromEntries(
          [
            "recordKind",
            "actionStates",
            "clientId",
            "carerId",
            "group",
            "states",
            "levels",
            "types",
            "assignedTo",
            "createdBy",
            "from",
            "to",
            "dueFrom",
            "dueTo",
            "overdue",
            "hasVisit",
            "sort",
          ]
            .filter((k) => req.query[k] !== undefined && req.query[k] !== "")
            .map((k) => [k, req.query[k]]),
        ),
      );
    if (!advanced.success) fail(400, "Invalid additional filters");
    const extra = advanced.data;
    if (
      (extra.from && extra.to && extra.from > extra.to) ||
      (extra.dueFrom && extra.dueTo && extra.dueFrom > extra.dueTo)
    )
      fail(400, "Start date must be on or before end date");
    const kind = extra.recordKind || req.query.kind || "ALERT",
      filter = req.query.filter || "OPEN",
      page = Number(req.query.page || 1),
      search = String(req.query.search || "")
        .trim()
        .toLowerCase(),
      severity = req.query.severity || "";
    if (
      !["ALERT", "ACTION", "ALL"].includes(kind) ||
      ![
        "ALL",
        "OPEN",
        "IN_PROGRESS",
        "RESOLVED",
        "UNASSIGNED",
        "MINE",
        "TODAY",
        "WEEK",
        "ARCHIVED",
      ].includes(filter) ||
      !Number.isInteger(page) ||
      page < 1 ||
      page > 100000 ||
      search.length > 200 ||
      (severity &&
        !["UNDEFINED", "LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(severity))
    )
      fail(400, "Invalid inbox filters");
    const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/London",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()),
      sunday = new Date(
        Date.parse(today) +
          (6 - ((new Date(today).getUTCDay() + 6) % 7)) * 86400000,
      )
        .toISOString()
        .slice(0, 10);
    const q = await queryScope(req),
      params = [...q.params, today, sunday],
      todayParam = "$" + (q.params.length + 1),
      endParam = "$" + (q.params.length + 2);
    const rules = {
      ALL: "NOT archived",
      OPEN: "NOT archived AND state='OPEN'",
      IN_PROGRESS: "NOT archived AND state='IN_PROGRESS'",
      RESOLVED: "NOT archived AND state='RESOLVED'",
      ARCHIVED: "archived",
      UNASSIGNED:
        "NOT archived AND state<>'RESOLVED' AND \"assignedTo\" IS NULL",
      MINE: "NOT archived AND state<>'RESOLVED' AND \"assignedTo\"=$2",
      TODAY: `NOT archived AND state<>'RESOLVED' AND "dueDate"=${todayParam}`,
      WEEK: `NOT archived AND state<>'RESOLVED' AND "dueDate">=${todayParam} AND "dueDate"<=${endParam}`,
    };
    const cte = `WITH work AS (${q.sql}) `;
    const summary = (
      await db.query(
        cte +
          "SELECT kind," +
          Object.entries(rules)
            .map(
              ([key, rule]) =>
                `count(*) FILTER (WHERE ${rule})::int AS "${key}"`,
            )
            .join(",") +
          " FROM work GROUP BY kind",
        params,
      )
    ).rows;
    const counts = {};
    for (const k of ["ALERT", "ACTION"])
      counts[k] =
        summary.find((r) => r.kind === k) ||
        Object.fromEntries(Object.keys(rules).map((f) => [f, 0]));
    params.push(kind, severity, search);
    const n = params.length,
      condition = `(kind=$${n - 2} OR $${n - 2}='ALL') AND (${extra.recordKind || extra.states ? "true" : rules[filter]}) AND ($${n - 1}='' OR severity=$${n - 1}) AND ($${n}='' OR position($${n} in lower(title||' '||body||' '||"clientName"))>0)`;
    // All parameter positions stay typed, including dates when the selected filter does not use them.
    let base =
      cte +
      `SELECT * FROM work WHERE ${todayParam}::text IS NOT NULL AND ${endParam}::text IS NOT NULL AND ` +
      condition;
    const addCondition = (sql, value) => {
      params.push(value);
      base += " AND " + sql.replaceAll("?", "$" + params.length);
    };
    if (extra.recordKind) {
      for (const [type, selected] of [
        ["ALERT", extra.states],
        ["ACTION", extra.actionStates],
      ]) {
        const values = selected
          ? selected.split("|")
          : ["OPEN", "IN_PROGRESS", "RESOLVED"];
        if (
          values.some(
            (v) => !["OPEN", "IN_PROGRESS", "RESOLVED", "ARCHIVED"].includes(v),
          )
        )
          fail(400, "Invalid statuses");
        addCondition(
          `(kind<>'${type}' OR (CASE WHEN archived THEN 'ARCHIVED' ELSE state END)=ANY(?::text[]))`,
          values,
        );
      }
    } else if (extra.states) {
      const values = extra.states.split("|");
      if (
        values.some(
          (v) => !["OPEN", "IN_PROGRESS", "RESOLVED", "ARCHIVED"].includes(v),
        )
      )
        fail(400, "Invalid statuses");
      addCondition(
        "(CASE WHEN archived THEN 'ARCHIVED' ELSE state END)=ANY(?::text[])",
        values,
      );
    }
    if (extra.levels) {
      const values = extra.levels.split("|");
      if (
        values.some(
          (v) =>
            !["UNDEFINED", "LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(v),
        )
      )
        fail(400, "Invalid severities");
      addCondition(
        extra.recordKind
          ? "(kind='ACTION' OR severity=ANY(?::text[]))"
          : "severity=ANY(?::text[])",
        values,
      );
    }
    if (extra.types)
      addCondition(
        (extra.recordKind ? "(kind='ACTION' OR " : "(") +
          "lower(replace(title,'-',' '))=ANY(?::text[]) OR lower(category)=ANY(?::text[]))",
        extra.types.split("|").map((v) => v.toLowerCase().replaceAll("-", " ")),
      );
    if (extra.carerId) addCondition('"carerId"=?::uuid', extra.carerId);
    if (extra.group)
      addCondition(
        'EXISTS(SELECT 1 FROM node_team_groups g WHERE g.user_id=work."carerId" AND g.groups @> ?::jsonb)',
        JSON.stringify([extra.group]),
      );
    if (extra.clientId) addCondition('"clientId"=?::uuid', extra.clientId);
    if (extra.createdBy) addCondition('"createdBy"=?::uuid', extra.createdBy);
    if (extra.assignedTo === "UNASSIGNED") base += ' AND "assignedTo" IS NULL';
    else if (extra.assignedTo)
      addCondition('"assignedTo"=?::uuid', extra.assignedTo);
    if (extra.from)
      addCondition(
        "( \"createdAt\" AT TIME ZONE 'Europe/London')::date>=?::date",
        extra.from,
      );
    if (extra.to)
      addCondition(
        "( \"createdAt\" AT TIME ZONE 'Europe/London')::date<=?::date",
        extra.to,
      );
    if (extra.dueFrom) addCondition('"dueDate">=?', extra.dueFrom);
    if (extra.dueTo) addCondition('"dueDate"<=?', extra.dueTo);
    if (extra.overdue === "true") {
      base += " AND state<>'RESOLVED'";
      addCondition('"dueDate"<?', today);
    }
    if (extra.hasVisit === "LINKED") base += ' AND "visitId" IS NOT NULL';
    if (extra.hasVisit === "UNLINKED") base += ' AND "visitId" IS NULL';
    const order = {
      NEWEST: '"createdAt" DESC,id',
      OLDEST: '"createdAt" ASC,id',
      SEVERITY: `CASE severity WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 3 ELSE 4 END,"createdAt" DESC,id`,
      DUE: '"dueDate" ASC NULLS LAST,"createdAt" DESC,id',
    }[extra.sort || "NEWEST"];
    const total = (
      await db.query(
        "SELECT count(*)::int total FROM (" + base + ") filtered",
        params,
      )
    ).rows[0].total;
    const items = (
      await db.query(
        base + ` ORDER BY ${order} LIMIT 30 OFFSET $${params.length + 1}`,
        [...params, (page - 1) * 30],
      )
    ).rows;
    return reply(res, {
      items,
      total,
      pages: Math.max(1, Math.ceil(total / 30)),
      counts,
      today,
    });
  });
  route("POST", "/api/inbox/items", async (req, res) => {
    auth.admin(req);
    const p = z
      .object({
        kind: z.enum(["ALERT", "ACTION"]),
        clientId: z.uuid(),
        visitId: z.uuid().nullable().default(null),
        title: z.string().trim().min(1).max(200),
        body: z.string().trim().min(1).max(20000),
        severity: z
          .enum(["UNDEFINED", "LOW", "MEDIUM", "HIGH", "CRITICAL"])
          .default("UNDEFINED"),
        assignedTo: z.uuid().nullable().default(null),
        dueDate: date.nullable().default(null),
      })
      .safeParse(req.body);
    if (!p.success) fail(400, "Enter a client, title and incident details");
    const b = p.data,
      c = await auth.userAccess(req, b.clientId, { write: true });
    if (c.role !== "USER" || !c.isActive || c.deletedAt)
      fail(400, "Choose an active client");
    if (b.visitId) {
      const v = (
        await db.query(
          "SELECT id FROM node_roster_visits WHERE id=$1 AND agency_id=$2 AND client_id=$3",
          [b.visitId, req.user.agencyId, b.clientId],
        )
      ).rows[0];
      if (!v) fail(400, "Visit does not belong to this client");
    }
    const id = randomUUID(),
      record = (
        await db.query(
          "INSERT INTO node_client_entries(id,agency_id,client_id,visit_id,kind,title,body,status,created_by,updated_by) VALUES($1,$2,$3,$4,$5,$6,$7,'OPEN',$8,$8) RETURNING *",
          [
            id,
            req.user.agencyId,
            b.clientId,
            b.visitId,
            b.kind,
            b.title,
            b.body,
            req.user.id,
          ],
        )
      ).rows[0];
    await db.query(
      "INSERT INTO node_client_entry_history(id,entry_id,revision,snapshot,actor_id) VALUES($1,$2,1,$3,$4)",
      [randomUUID(), id, JSON.stringify(record), req.user.id],
    );
    await event(req, id, `${b.kind === "ALERT" ? "Alert" : "Action"} created`);
    await save(req, await get(req, id), {
      severity: b.severity,
      assignedTo: b.assignedTo,
      dueDate: b.dueDate,
    });
    if (b.visitId)
      await visitEvent(
        db,
        b.visitId,
        req.user.id,
        `Inbox ${b.kind.toLowerCase()} added: ${b.title}`,
      );
    return reply(res, await get(req, id), "Item created", 201);
  });
  route("POST", "/api/inbox/items/bulk", async (req, res) => {
    auth.admin(req);
    const p = z
      .object({
        items: z
          .array(
            z.object({ id: z.uuid(), revision: z.number().int().positive() }),
          )
          .min(1)
          .max(50),
        changes: patch,
      })
      .safeParse(req.body);
    if (
      !p.success ||
      new Set(p.data.items.map((x) => x.id)).size !== p.data.items.length
    )
      fail(400, "Select up to 50 different items");
    for (const item of [...p.data.items].sort((a, b) =>
      a.id.localeCompare(b.id),
    )) {
      const old = await get(req, item.id, true);
      if (old.revision !== item.revision)
        fail(409, "An item changed. Refresh before applying bulk changes");
      await save(req, old, p.data.changes);
    }
    return reply(res, { count: p.data.items.length }, "Bulk changes saved");
  });
  route("GET", "/api/inbox/items/:id", async (req, res) => {
    const item = await get(req, req.params.id);
    const comments = (
      await db.query(
        "SELECT c.id,c.body,c.created_at AS \"createdAt\",u.first_name||' '||u.last_name AS author FROM node_inbox_comments c JOIN users u ON u.id=c.actor_id WHERE c.entry_id=$1 ORDER BY c.created_at,c.id",
        [item.id],
      )
    ).rows;
    const events = (
      await db.query(
        "SELECT e.id,e.description,e.created_at AS \"createdAt\",u.first_name||' '||u.last_name AS author FROM node_inbox_events e JOIN users u ON u.id=e.actor_id WHERE entry_id=$1 ORDER BY e.created_at,e.id",
        [item.id],
      )
    ).rows;
    const history = (
      await db.query(
        "SELECT h.id,h.revision,h.snapshot,h.created_at AS \"createdAt\",u.first_name||' '||u.last_name AS author FROM node_client_entry_history h JOIN users u ON u.id=h.actor_id WHERE entry_id=$1 ORDER BY h.revision",
        [item.id],
      )
    ).rows;
    return reply(res, {
      item,
      comments,
      events,
      history,
      canEdit: req.user.role !== "CAREGIVER" || item.assignedTo === req.user.id,
    });
  });
  route("PUT", "/api/inbox/items/:id", async (req, res) => {
    const { revision, ...changes } = req.body,
      old = await get(req, req.params.id, true);
    if (revision !== old.revision)
      fail(409, "This item changed. Refresh before saving");
    return reply(res, await save(req, old, changes), "Changes saved");
  });
  route("POST", "/api/inbox/items/:id/comments", async (req, res) => {
    const item = await get(req, req.params.id),
      body = z.string().trim().min(1).max(6000).safeParse(req.body.body);
    if (!body.success) fail(400, "Enter a comment of 1Ã¢â‚¬â€œ6000 characters");
    await db.query(
      "INSERT INTO node_inbox_comments(id,entry_id,actor_id,body) VALUES($1,$2,$3,$4)",
      [randomUUID(), item.id, req.user.id, body.data],
    );
    await event(req, item.id, "Comment added");
    return reply(res, {}, "Comment saved", 201);
  });
}
