import { reply } from "../http.js";
import { dateRange } from "./activity.js";
export function registerReporting({ db, auth }, route) {
  route("GET", "/api/reports/summary", async (req, res) => {
    auth.admin(req);
    const { from, to } = dateRange(req.query);
    const args = [req.user.agencyId, from, to];
    const byStatus = (
      await db.query(
        `SELECT status,count(*)::int AS visits,COALESCE(sum(EXTRACT(EPOCH FROM(end_time-start_time))/60),0)::int AS minutes
      FROM node_roster_visits WHERE agency_id=$1 AND visit_date BETWEEN $2 AND $3 GROUP BY status ORDER BY status`,
        args,
      )
    ).rows;
    const staff = (
      await db.query(
        `SELECT u.id,u.first_name||' '||u.last_name AS name,count(*)::int AS visits,
      count(*) FILTER(WHERE v.status='COMPLETED')::int AS completed,
      COALESCE(sum(EXTRACT(EPOCH FROM(v.end_time-v.start_time))/60) FILTER(WHERE v.status='COMPLETED'),0)::int AS "completedMinutes"
      FROM node_roster_visits v JOIN users u ON u.id=v.staff_id WHERE v.agency_id=$1 AND v.visit_date BETWEEN $2 AND $3 AND v.status<>'CANCELLED'
      GROUP BY u.id ORDER BY name`,
        args,
      )
    ).rows;
    const daily = (
      await db.query(
        `SELECT visit_date::text AS date,count(*)::int AS visits,count(*) FILTER(WHERE status='COMPLETED')::int AS completed
      FROM node_roster_visits WHERE agency_id=$1 AND visit_date BETWEEN $2 AND $3 AND status<>'CANCELLED' GROUP BY visit_date ORDER BY visit_date`,
        args,
      )
    ).rows;
    const money = (
      await db.query(
        `SELECT kind,status,count(*)::int AS documents,COALESCE(sum(total_pence),0)::bigint::text AS "totalPence"
      FROM node_finance_documents WHERE agency_id=$1 AND from_date<=$3 AND to_date>=$2 GROUP BY kind,status ORDER BY kind,status`,
        args,
      )
    ).rows;
    const people = (
      await db.query(
        `SELECT count(*) FILTER(WHERE role='USER' AND is_active AND deleted_at IS NULL)::int AS clients,
      count(*) FILTER(WHERE role<>'USER' AND is_active AND deleted_at IS NULL)::int AS staff FROM users WHERE agency_id=$1`,
        [req.user.agencyId],
      )
    ).rows[0];
    return reply(res, {
      from,
      to,
      byStatus,
      staff,
      daily,
      money,
      people,
      timezone: "Europe/London",
      currency: "GBP",
    });
  });
}
