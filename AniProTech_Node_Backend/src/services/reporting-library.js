import { reply } from "../http.js";
import { dateRange } from "./activity.js";

const number = (value) => Number(value || 0);
const iso = (value) => value ? new Date(value).toISOString() : null;

export function registerReportingLibrary({ db, auth }, route) {
  route("GET", "/api/reports/library", async (req, res) => {
    auth.admin(req);
    const { from, to } = dateRange(req.query);
    const args = [req.user.agencyId, from, to];
    const [visits, entries, attendance, medications, alerts] = await Promise.all([
      db.query(`SELECT v.id,v.client_id AS "clientId",v.staff_id AS "staffId",v.visit_date::text AS date,
        v.title,v.status,concat_ws(' ',c.first_name,c.last_name) AS "clientName",
        concat_ws(' ',s.first_name,s.last_name) AS "staffName",
        (v.visit_date+v.start_time) AT TIME ZONE 'Europe/London' AS "scheduledStart",
        (v.visit_date+v.end_time) AT TIME ZONE 'Europe/London' AS "scheduledEnd",
        v.actual_start AS "actualStart",v.actual_end AS "actualEnd",
        round(extract(epoch FROM(v.end_time-v.start_time))/60)::int AS "plannedMinutes"
        FROM node_roster_visits v JOIN users c ON c.id=v.client_id LEFT JOIN users s ON s.id=v.staff_id
        WHERE v.agency_id=$1 AND v.visit_date BETWEEN $2 AND $3 AND v.status<>'CANCELLED'
        ORDER BY v.visit_date DESC,v.start_time DESC,v.id LIMIT 10001`, args),
      db.query(`SELECT e.visit_id AS "visitId",
        count(*) FILTER(WHERE e.kind='ACTIVITY')::int AS activities,
        count(*) FILTER(WHERE e.kind='ACTIVITY' AND e.status='COMPLETED')::int AS "completedActivities",
        count(*) FILTER(WHERE e.kind='OBSERVATION')::int AS observations,
        count(*) FILTER(WHERE e.kind='NOTE')::int AS notes
        FROM node_client_entries e JOIN node_roster_visits v ON v.id=e.visit_id
        WHERE e.agency_id=$1 AND v.agency_id=$1 AND v.visit_date BETWEEN $2 AND $3
        GROUP BY e.visit_id`, args),
      db.query(`SELECT a.visit_id AS "visitId",
        count(*) FILTER(WHERE a.event='CHECK_IN')::int AS "checkInEvents",
        count(*) FILTER(WHERE a.event='CHECK_OUT')::int AS "checkOutEvents",
        count(*) FILTER(WHERE a.within_radius=true)::int AS "verifiedEvents",
        count(*) FILTER(WHERE a.within_radius=false)::int AS "outsideEvents",
        count(*) FILTER(WHERE a.within_radius IS NULL)::int AS "unverifiedEvents"
        FROM node_visit_attendance a JOIN node_roster_visits v ON v.id=a.visit_id
        WHERE v.agency_id=$1 AND v.visit_date BETWEEN $2 AND $3 GROUP BY a.visit_id`, args),
      db.query(`SELECT m.visit_id AS "visitId",count(*)::int AS administrations,
        count(*) FILTER(WHERE m.outcome IN ('ADMINISTERED','PRN_ADMINISTERED'))::int AS administered,
        count(*) FILTER(WHERE m.outcome NOT IN ('ADMINISTERED','PRN_ADMINISTERED'))::int AS exceptions
        FROM node_medication_administrations m JOIN node_roster_visits v ON v.id=m.visit_id
        WHERE m.agency_id=$1 AND v.agency_id=$1 AND v.visit_date BETWEEN $2 AND $3 GROUP BY m.visit_id`, args),
      db.query(`SELECT e.id,e.client_id AS "clientId",e.visit_id AS "visitId",e.title,e.category,e.status,
        e.created_at AS "createdAt",e.updated_at AS "updatedAt",concat_ws(' ',c.first_name,c.last_name) AS "clientName"
        FROM node_client_entries e JOIN users c ON c.id=e.client_id
        WHERE e.agency_id=$1 AND e.kind='ALERT' AND (e.created_at AT TIME ZONE 'Europe/London')::date BETWEEN $2 AND $3
        ORDER BY e.created_at DESC,e.id LIMIT 10001`, args),
    ]);
    const byVisit = (rows) => new Map(rows.map((row) => [row.visitId, row]));
    const entryMap = byVisit(entries.rows), attendanceMap = byVisit(attendance.rows), medicationMap = byVisit(medications.rows);
    const rows = visits.rows.slice(0, 10000).map((visit) => {
      const entry = entryMap.get(visit.id) || {}, attend = attendanceMap.get(visit.id) || {}, med = medicationMap.get(visit.id) || {};
      const actualMinutes = visit.actualStart && visit.actualEnd
        ? Math.max(0, Math.round((new Date(visit.actualEnd) - new Date(visit.actualStart)) / 60000)) : null;
      return {
        ...visit, scheduledStart: iso(visit.scheduledStart), scheduledEnd: iso(visit.scheduledEnd),
        actualStart: iso(visit.actualStart), actualEnd: iso(visit.actualEnd), actualMinutes,
        activities: number(entry.activities), completedActivities: number(entry.completedActivities),
        observations: number(entry.observations), notes: number(entry.notes),
        checkInEvents: number(attend.checkInEvents), checkOutEvents: number(attend.checkOutEvents),
        verifiedEvents: number(attend.verifiedEvents), outsideEvents: number(attend.outsideEvents),
        unverifiedEvents: number(attend.unverifiedEvents),
        administrations: number(med.administrations), administered: number(med.administered),
        medicationExceptions: number(med.exceptions),
      };
    });
    return reply(res, {
      from, to, timezone: "Europe/London", generatedAt: new Date().toISOString(),
      visits: rows, alerts: alerts.rows.slice(0, 10000).map((a) => ({ ...a, createdAt: iso(a.createdAt), updatedAt: iso(a.updatedAt) })),
      truncated: visits.rows.length > 10000 || alerts.rows.length > 10000,
      definitions: {
        reportedVisit: "A visit marked Completed in Caremonitor",
        fulfilledVisit: "A completed visit with recorded duration at least 75% of planned duration",
        onTimeVisit: "A completed visit with a recorded check-in no later than the selected grace period after planned start",
        recordedCareActivity: "A visit-linked activity marked Completed; not a count of all planned task occurrences",
        medicationAdministration: "A recorded visit eMAR outcome; not a count of expected doses",
        secureAttendance: "A check-in or check-out event with a recorded within-radius result; unknown-location events are excluded from the success rate",
      },
    });
  });
}
