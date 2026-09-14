import { reply, fail } from '../http.js';
export function registerTeamActivity({db,auth},route) {
 route('GET','/api/team/:id/activity-feed',async(req,res)=>{
  const user=await auth.userAccess(req,req.params.id,{staff:true});
  const kind=req.query.kind||'ALL',page=Number(req.query.page||1),search=String(req.query.search||'').trim(),from=req.query.from||null,to=req.query.to||null;
  if(!['ALL','VISIT','ALERT','NOTE','ACTION'].includes(kind)||!Number.isInteger(page)||page<1||page>10000||search.length>200)fail(400,'Invalid feed filter');
  for(const d of [from,to])if(d&&(!/^\d{4}-\d{2}-\d{2}$/.test(d)||isNaN(Date.parse(d))||new Date(d).toISOString().slice(0,10)!==d))fail(400,'Use valid YYYY-MM-DD dates');
  if(from&&to&&from>to)fail(400,'End date must not precede start date');
  const union=`SELECT v.id,'VISIT'::text kind,v.title,v.notes body,v.status,(v.visit_date+v.start_time) AT TIME ZONE 'Europe/London' occurred_at,v.client_id AS "clientId",false AS "teamEntry",c.first_name||' '||c.last_name AS "clientName",
   (extract(epoch from(v.end_time-v.start_time))/60)::int AS "plannedMinutes",
   CASE WHEN v.actual_start IS NOT NULL THEN round(extract(epoch from(COALESCE(v.actual_end,CURRENT_TIMESTAMP)-v.actual_start))/60)::int END AS "actualMinutes",
   (SELECT count(*)::int FROM node_client_entries e WHERE e.visit_id=v.id AND e.kind='ALERT' AND e.status='OPEN') alerts,
   (SELECT count(*)::int FROM node_client_entries e WHERE e.visit_id=v.id AND e.kind='OBSERVATION') observations,
   (SELECT count(*)::int FROM node_client_entries e WHERE e.visit_id=v.id AND e.kind='ACTIVITY' AND e.status='COMPLETED') activities
   FROM node_roster_visits v JOIN users c ON c.id=v.client_id WHERE v.agency_id=$1 AND v.staff_id=$2 AND c.deleted_at IS NULL
   UNION ALL SELECT e.id,e.kind,e.title,e.body,e.status,e.created_at,e.client_id,false,c.first_name||' '||c.last_name,NULL,NULL,0,0,0
   FROM node_client_entries e JOIN node_roster_visits v ON v.id=e.visit_id JOIN users c ON c.id=e.client_id
   WHERE e.agency_id=$1 AND v.agency_id=$1 AND v.staff_id=$2 AND c.deleted_at IS NULL AND e.kind IN ('ALERT','NOTE','ACTION')
   UNION ALL SELECT f.id,CASE WHEN f.kind='CONCERN' THEN 'ALERT' ELSE f.kind END,CASE WHEN f.kind='CONCERN' THEN 'Staff concern' ELSE 'Staff '||lower(f.kind) END,f.body,f.status,f.created_at,NULL,true,NULL,NULL,NULL,0,0,0
   FROM node_team_feed f WHERE f.agency_id=$1 AND f.user_id=$2`;
  // A caregiver must also retain client care-team access, as required by visit detail routes.
  const filtered=`WITH combined AS (${union}),feed AS (SELECT * FROM combined WHERE
   ($3::date IS NULL OR (occurred_at AT TIME ZONE 'Europe/London')::date >= $3) AND ($4::date IS NULL OR (occurred_at AT TIME ZONE 'Europe/London')::date <= $4)
   AND (title ILIKE $5 OR body ILIKE $5 OR "clientName" ILIKE $5)
   AND ($6::boolean=false OR "teamEntry" OR EXISTS(SELECT 1 FROM client_care_team ct WHERE ct.client_id="clientId" AND ct.carer_id=$2 AND ct.view_access=true AND COALESCE(ct.revoke_viewaccess,false)=false AND COALESCE(ct.decline_carer,false)=false AND ct.deleted_at IS NULL)))`;
  const params=[req.user.agencyId,user.id,from,to,'%'+search+'%',req.user.role==='CAREGIVER'];
  const counts=(await db.query(`${filtered} SELECT kind,count(*)::int count FROM feed GROUP BY kind`,params)).rows;
  const items=(await db.query(`${filtered} SELECT * FROM feed WHERE ($7='ALL' OR kind=$7) ORDER BY occurred_at DESC,id LIMIT 30 OFFSET $8`,[...params,kind,(page-1)*30])).rows;
  return reply(res,{client:auth.publicUser(user),items,counts:Object.fromEntries(counts.map(x=>[x.kind,x.count])),page,canManage:req.user.role!=='CAREGIVER',timezone:'Europe/London'});
 });
 route('GET','/api/team/:id/activity-entry/:entryId',async(req,res)=>{
  await auth.userAccess(req,req.params.id,{staff:true});
  const entry=(await db.query(`SELECT f.*,a.first_name||' '||a.last_name author,CASE WHEN f.kind='CONCERN' THEN 'Staff concern' ELSE 'Staff '||lower(f.kind) END title FROM node_team_feed f JOIN users a ON a.id=f.created_by WHERE f.id=$1 AND f.user_id=$2 AND f.agency_id=$3`,[req.params.entryId,req.params.id,req.user.agencyId])).rows[0];
  if(!entry)fail(404,'Entry not found');return reply(res,{entry,canManage:req.user.role!=='CAREGIVER'});
 });
}
