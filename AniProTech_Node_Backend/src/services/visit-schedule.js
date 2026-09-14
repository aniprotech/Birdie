import { reply, fail } from "../http.js";
import { occursOn } from "./roster.js";
const validDate = (v) =>
  typeof v === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  !isNaN(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
export function registerVisitSchedule({ db, repo, auth }, route) {
  route("GET", "/api/clients/:id/visit-schedule", async (req, res) => {
    const client = await auth.userAccess(req, req.params.id);
    if (client.role !== "USER" || client.deletedAt)
      fail(404, "Client not found");
    const { from, to } = req.query;
    if (
      !validDate(from) ||
      !validDate(to) ||
      to < from ||
      Date.parse(to) - Date.parse(from) > 30 * 86400000
    )
      fail(400, "Choose valid dates spanning up to 31 days");
    const visits = (
      await db.query(
        `SELECT v.id,v.client_id AS "clientId",v.staff_id AS "staffId",v.visit_date::text AS date,
    to_char(v.start_time,'HH24:MI') AS "startTime",to_char(v.end_time,'HH24:MI') AS "endTime",v.title,v.notes,v.status,v.revision,
    s.first_name||' '||s.last_name AS "staffName",v.actual_start AS "actualStart",v.actual_end AS "actualEnd",
    (extract(epoch FROM(v.end_time-v.start_time))/60)::int AS "plannedMinutes",
    CASE WHEN v.actual_start IS NOT NULL AND v.actual_end IS NOT NULL THEN round(extract(epoch FROM(v.actual_end-v.actual_start))/60)::int END AS "actualMinutes",
    (SELECT count(*)::int FROM node_client_entries e WHERE e.visit_id=v.id AND e.kind='ACTIVITY') AS "taskTotal",
    (SELECT count(*)::int FROM node_client_entries e WHERE e.visit_id=v.id AND e.kind='ACTIVITY' AND e.status='COMPLETED') AS "taskDone",
    (SELECT count(*)::int FROM node_client_entries e WHERE e.visit_id=v.id AND e.kind='ALERT' AND e.status='OPEN') AS alerts,
    (v.status='SCHEDULED' AND (v.visit_date+v.start_time) AT TIME ZONE 'Europe/London' < CURRENT_TIMESTAMP) AS overdue
    FROM node_roster_visits v LEFT JOIN users s ON s.id=v.staff_id
    WHERE v.client_id=$1 AND v.agency_id=$2 AND v.visit_date BETWEEN $3 AND $4 AND ($5::uuid IS NULL OR v.staff_id=$5)
    ORDER BY v.visit_date,v.start_time,v.id`,
        [
          client.id,
          req.user.agencyId,
          from,
          to,
          req.user.role === "CAREGIVER" ? req.user.id : null,
        ],
      )
    ).rows;
    const plans = await repo.find("ClientTaskPlanEntity", { user: client.id });
    const tasks = await Promise.all(
      plans.map(async (p) => ({
        ...p,
        name:
          p.taskNameSnapshot ||
          (await repo.get("ClientTaskEntity", p.task))?.name ||
          "Task",
      })),
    );
    const plannedTasks = [];
    for (let d = Date.parse(from); d <= Date.parse(to); d += 86400000) {
      const date = new Date(d).toISOString().slice(0, 10);
      for (const p of tasks)
        if (occursOn({ ...p, isEnds: !!p.endDate }, date))
          plannedTasks.push({
            id: p.id,
            date,
            name: p.name,
            details: p.details || "",
            essential: !!p.isEssential,
            sessions: p.isAnyTime ? ["ANYTIME"] : p.sessions || [],
            timesPerDay: p.isAnyTime
              ? p.timesPerDay || 1
              : p.sessions?.length || 1,
          });
    }
    return reply(res, {
      visits,
      plannedTasks,
      timezone: "Europe/London",
      canManage: req.user.role !== "CAREGIVER",
    });
  });
}
