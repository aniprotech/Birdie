import { reply, fail } from '../http.js';
import { dateRange } from './activity.js';

export function registerCareLog({db,auth},route) {
  route('GET','/api/care-log',async(req,res)=>{
    auth.admin(req);
    const {from,to}=dateRange(req.query,30);
    const q=req.query, page=Number(q.page||1), status=q.status||'ALL';
    if(!Number.isSafeInteger(page)||page<1||page>100000) fail(400,'Invalid page');
    if(!['ALL','IN_PROGRESS','COMPLETED'].includes(status)) fail(400,'Invalid visit status');
    if(q.activity&&!['all','active','inactive'].includes(q.activity)) fail(400,'Invalid client activity');
    const args=[req.user.agencyId,from,to,String(q.client||''),String(q.carer||''),String(q.group||''),String(q.activity||'all'),String(q.search||'').slice(0,100)];
    const source=`FROM node_roster_visits v JOIN users c ON c.id=v.client_id LEFT JOIN users s ON s.id=v.staff_id
      WHERE v.agency_id=$1 AND c.agency_id=$1 AND c.deleted_at IS NULL
      AND v.visit_date BETWEEN $2::date AND $3::date AND v.status IN ('IN_PROGRESS','COMPLETED')
      AND ($4='' OR c.id::text=$4) AND ($5='' OR s.id::text=$5)
      AND ($6='' OR EXISTS(SELECT 1 FROM node_team_groups g WHERE g.user_id=v.staff_id AND g.groups ? $6))
      AND ($7='all' OR c.is_active=($7='active'))
      AND ($8='' OR c.first_name||' '||c.last_name ILIKE '%'||$8||'%' OR s.first_name||' '||s.last_name ILIKE '%'||$8||'%')`;
    const counts=(await db.query(`SELECT v.status,count(*)::int count ${source} GROUP BY v.status`,args)).rows;
    const items=(await db.query(`SELECT v.id,v.client_id AS "clientId",v.status,v.visit_date::text date,
      to_char(v.start_time,'HH24:MI') AS "startTime",to_char(v.end_time,'HH24:MI') AS "endTime",
      c.first_name||' '||c.last_name AS "clientName",COALESCE(s.first_name||' '||s.last_name,'Unassigned') AS "staffName",
      v.actual_start AS "actualStart",v.actual_end AS "actualEnd",
      round(extract(epoch FROM(v.end_time-v.start_time))/60)::int AS "plannedMinutes",
      CASE WHEN v.actual_end IS NOT NULL THEN round(extract(epoch FROM(v.actual_end-v.actual_start))/60)::int END AS "actualMinutes",
      (SELECT count(*)::int FROM node_client_entries e WHERE e.visit_id=v.id AND e.kind='ALERT' AND e.status='OPEN') alerts,
      (SELECT count(*)::int FROM node_client_entries e WHERE e.visit_id=v.id AND e.category='COMPLIANCE' AND e.status='OPEN') overrides,
      (SELECT count(*)::int FROM node_client_entries e WHERE e.visit_id=v.id AND e.kind='OBSERVATION') observations,
      (SELECT count(*)::int FROM node_client_entries e WHERE e.visit_id=v.id AND e.kind='ACTIVITY' AND e.status='COMPLETED') activities
      ${source} AND ($9='ALL' OR v.status=$9) ORDER BY v.visit_date DESC,v.start_time DESC,v.id LIMIT 31 OFFSET $10`,[...args,status,(page-1)*30])).rows;
    const people=(await db.query(`SELECT id,first_name||' '||last_name AS name,role FROM users WHERE agency_id=$1 AND deleted_at IS NULL AND role IN ('USER','CAREGIVER') ORDER BY first_name,last_name`,[req.user.agencyId])).rows;
    const groups=(await db.query(`SELECT DISTINCT jsonb_array_elements_text(g.groups) AS name FROM node_team_groups g JOIN users u ON u.id=g.user_id WHERE u.agency_id=$1 AND u.deleted_at IS NULL ORDER BY name`,[req.user.agencyId])).rows.map(g=>g.name);
    return reply(res,{items:items.slice(0,30),hasMore:items.length>30,counts:Object.fromEntries(counts.map(x=>[x.status,x.count])),people,groups,page,timezone:'Europe/London'});
  });
}
