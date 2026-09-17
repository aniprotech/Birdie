import { reply } from "../http.js";
import { dateRange } from "./activity.js";
export function registerReporting({ db, auth }, route) {
  const periodStats=async(agency,from,to)=>(await db.query(`SELECT count(*) FILTER(WHERE status<>'CANCELLED')::int visits,count(*) FILTER(WHERE status='COMPLETED')::int completed,COALESCE(sum(EXTRACT(EPOCH FROM(actual_end-actual_start))/60) FILTER(WHERE status='COMPLETED' AND actual_start IS NOT NULL AND actual_end IS NOT NULL),0)::int AS "actualMinutes" FROM node_roster_visits WHERE agency_id=$1 AND visit_date BETWEEN $2 AND $3`,[agency,from,to])).rows[0];
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
  route("GET","/api/reports/compare",async(req,res)=>{auth.admin(req);const a=dateRange({from:req.query.fromA,to:req.query.toA}),b=dateRange({from:req.query.fromB,to:req.query.toB});const [current,previous]=await Promise.all([periodStats(req.user.agencyId,a.from,a.to),periodStats(req.user.agencyId,b.from,b.to)]);const delta=(x,y)=>Number(x)-Number(y);return reply(res,{current:{...a,...current},comparison:{...b,...previous},change:{visits:delta(current.visits,previous.visits),completed:delta(current.completed,previous.completed),actualMinutes:delta(current.actualMinutes,previous.actualMinutes)},definitions:{visits:"All non-cancelled scheduled visits",completed:"Visits in Completed status",actualMinutes:"Elapsed verified check-in to check-out time for completed visits"},asOf:new Date().toISOString()})});
  route("GET","/api/reports/reconciliation",async(req,res)=>{auth.admin(req);const {from,to}=dateRange(req.query),agency=req.user.agencyId;const rows=(await db.query(`SELECT v.id,v.visit_date::text date,v.title,v.status,v.actual_start AS "actualStart",v.actual_end AS "actualEnd",bool_or(l.kind='INVOICE' AND l.released=false) invoiced,bool_or(l.kind='PAYRUN' AND l.released=false) paid FROM node_roster_visits v LEFT JOIN node_finance_lines l ON l.visit_id=v.id WHERE v.agency_id=$1 AND v.visit_date BETWEEN $2 AND $3 AND v.status='COMPLETED' GROUP BY v.id ORDER BY v.visit_date,v.id`,[agency,from,to])).rows;const issues=rows.flatMap(v=>[...(!v.actualStart||!v.actualEnd?[{visitId:v.id,date:v.date,title:v.title,kind:"MISSING_ACTUALS"}]:[]),...(!v.invoiced?[{visitId:v.id,date:v.date,title:v.title,kind:"NOT_INVOICED"}]:[]),...(!v.paid?[{visitId:v.id,date:v.date,title:v.title,kind:"NOT_IN_PAYRUN"}]:[])]);return reply(res,{from,to,completedVisits:rows.length,balancedVisits:rows.filter(v=>v.actualStart&&v.actualEnd&&v.invoiced&&v.paid).length,issues,asOf:new Date().toISOString(),note:"Reconciliation checks document inclusion and actual times; it does not confirm bank settlement."})});
}
