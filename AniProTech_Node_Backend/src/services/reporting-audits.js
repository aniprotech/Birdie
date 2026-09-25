import { fail, reply } from "../http.js";
import { dateRange } from "./activity.js";

const dateValue = (value) => value ? new Date(value).toISOString() : null;
const minutesLate = (actual, planned) => actual && planned ? Math.max(0, Math.floor((new Date(actual) - new Date(planned)) / 60000)) : 0;

export function classifyVisitTiming(row, now = new Date(), graceMinutes = 5) {
  const start = new Date(row.scheduledStart), end = new Date(row.scheduledEnd);
  const checkIn = row.actualStart ? new Date(row.actualStart) : null;
  const checkOut = row.actualEnd ? new Date(row.actualEnd) : null;
  const afterStart = now > new Date(start.getTime() + graceMinutes * 60000);
  const afterEnd = now > new Date(end.getTime() + graceMinutes * 60000);
  const lateIn = checkIn ? minutesLate(checkIn, start) > graceMinutes : false;
  const lateOut = checkOut ? minutesLate(checkOut, end) > graceMinutes : false;
  const missingIn = !checkIn && afterStart;
  const missingOut = !checkOut && (row.status === "COMPLETED" || (checkIn && afterEnd));
  return {
    ...row,
    scheduledStart: dateValue(start), scheduledEnd: dateValue(end),
    actualStart: dateValue(checkIn), actualEnd: dateValue(checkOut),
    checkInLateMinutes: lateIn ? minutesLate(checkIn, start) : 0,
    checkOutLateMinutes: lateOut ? minutesLate(checkOut, end) : 0,
    lateCheckIn: lateIn, lateCheckOut: lateOut, missingCheckIn: missingIn, missingCheckOut: missingOut,
  };
}

export function registerReportingAudits({ db, auth }, route) {
  route("GET", "/api/reports/audits", async (req, res) => {
    auth.admin(req);
    const { from, to } = dateRange(req.query);
    const graceMinutes = Number(req.query.graceMinutes ?? 5);
    if (!Number.isInteger(graceMinutes) || graceMinutes < 0 || graceMinutes > 60) fail(400, "Choose a late-visit grace period from 0 to 60 minutes");
    const args = [req.user.agencyId, from, to];
    const [visits, cases, mobileDoses, historicalDoses, alerts] = await Promise.all([
      db.query(`SELECT v.id,v.visit_date::text AS date,v.title,v.status,v.client_id AS "clientId",v.staff_id AS "staffId",
        c.first_name||' '||c.last_name AS "clientName",s.first_name||' '||s.last_name AS "staffName",
        (v.visit_date + v.start_time) AT TIME ZONE 'Europe/London' AS "scheduledStart",
        (v.visit_date + v.end_time) AT TIME ZONE 'Europe/London' AS "scheduledEnd",
        v.actual_start AS "actualStart",v.actual_end AS "actualEnd"
        FROM node_roster_visits v JOIN users c ON c.id=v.client_id LEFT JOIN users s ON s.id=v.staff_id
        WHERE v.agency_id=$1 AND v.visit_date BETWEEN $2 AND $3 AND v.status IN ('SCHEDULED','IN_PROGRESS','COMPLETED')
        ORDER BY v.visit_date,v.start_time,v.id LIMIT 5001`, args),
      db.query(`SELECT q.id,q.client_id AS "clientId",q.title,q.severity,q.status,q.due_at AS "dueAt",
        q.created_at AS "createdAt",q.closed_at AS "closedAt",c.first_name||' '||c.last_name AS "clientName",
        o.first_name||' '||o.last_name AS "ownerName",
        (SELECT count(*)::int FROM node_quality_actions a WHERE a.case_id=q.id AND a.status<>'VOID') AS "actions",
        (SELECT count(*)::int FROM node_quality_actions a WHERE a.case_id=q.id AND a.status='DONE') AS "completedActions"
        FROM node_quality_cases q LEFT JOIN users c ON c.id=q.client_id LEFT JOIN users o ON o.id=q.owner_id
        WHERE q.agency_id=$1 AND q.kind='SAFEGUARDING' AND (q.created_at AT TIME ZONE 'Europe/London')::date BETWEEN $2 AND $3
        ORDER BY q.created_at DESC,q.id LIMIT 5001`, args),
      db.query(`SELECT a.id,a.client_id AS "clientId",a.visit_id AS "visitId",a.outcome,a.slot,a.reason,a.note,
        a.occurred_at AS "occurredAt",m.medication_name AS medication,c.first_name||' '||c.last_name AS "clientName",
        u.first_name||' '||u.last_name AS "actorName",'VISIT' AS source,
        (SELECT count(*)::int FROM node_medication_administration_corrections x WHERE x.administration_id=a.id) AS corrections
        FROM node_medication_administrations a JOIN users c ON c.id=a.client_id
        JOIN client_medications_scheduling m ON m.id=a.medication_id LEFT JOIN users u ON u.id=a.actor_id
        WHERE a.agency_id=$1 AND (a.occurred_at AT TIME ZONE 'Europe/London')::date BETWEEN $2 AND $3
        ORDER BY a.occurred_at DESC,a.id LIMIT 5001`, args),
      db.query(`SELECT a.id,m.user_id AS "clientId",NULL::uuid AS "visitId",a.outcome,a.slot,
        a.reason::text AS reason,a.note,a.date::timestamp AT TIME ZONE 'Europe/London' AS "occurredAt",
        m.medication_name AS medication,c.first_name||' '||c.last_name AS "clientName",
        u.first_name||' '||u.last_name AS "actorName",'HISTORICAL' AS source,0::int AS corrections
        FROM client_medications_administration a JOIN client_medications_scheduling m ON m.id=a.medication_id
        JOIN users c ON c.id=m.user_id AND c.agency_id=$1 LEFT JOIN users u ON u.id=a.updated_by
        WHERE a.date BETWEEN $2 AND $3 ORDER BY a.date DESC,a.id LIMIT 5001`, args),
      db.query(`SELECT e.id,e.client_id AS "clientId",e.visit_id AS "visitId",e.title,e.status,e.category,
        e.created_at AS "createdAt",c.first_name||' '||c.last_name AS "clientName"
        FROM node_client_entries e JOIN users c ON c.id=e.client_id
        WHERE e.agency_id=$1 AND e.kind='ALERT' AND e.category IN ('MEDICATION','MEDICATION_STOCK','COMPLIANCE')
        AND (e.created_at AT TIME ZONE 'Europe/London')::date BETWEEN $2 AND $3
        ORDER BY e.created_at DESC,e.id LIMIT 5001`, args),
    ]);
    const now = new Date();
    const timing = visits.rows.slice(0, 5000).map((row) => classifyVisitTiming(row, now, graceMinutes));
    const late = timing.filter((v) => v.lateCheckIn || v.lateCheckOut || v.missingCheckIn || v.missingCheckOut);
    const administrations = [...mobileDoses.rows.slice(0, 5000), ...historicalDoses.rows.slice(0, 5000)]
      .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
    return reply(res, {
      from, to, timezone: "Europe/London", graceMinutes, generatedAt: now.toISOString(),
      lateVisits: { rows: late, checked: timing.length, lateCheckIns: late.filter((v) => v.lateCheckIn).length,
        lateCheckOuts: late.filter((v) => v.lateCheckOut).length, missingCheckIns: late.filter((v) => v.missingCheckIn).length,
        missingCheckOuts: late.filter((v) => v.missingCheckOut).length, truncated: visits.rows.length > 5000 },
      safeguarding: { rows: cases.rows.slice(0, 5000), truncated: cases.rows.length > 5000 },
      medication: { rows: administrations, alerts: alerts.rows.slice(0, 5000),
        truncated: mobileDoses.rows.length > 5000 || historicalDoses.rows.length > 5000 || alerts.rows.length > 5000 },
    });
  });
}
