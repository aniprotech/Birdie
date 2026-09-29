import { randomUUID } from 'node:crypto';
import {reply,fail} from '../http.js';
import {enums} from '../db.js';
export function registerTimeOff({db,repo,auth,push},route){
 const fields=`id,staff_id AS "staffId",start_date::text AS "startDate",end_date::text AS "endDate",to_char(start_time,'HH24:MI') AS "startTime",to_char(end_time,'HH24:MI') AS "endTime",type,reason,status,decision_note AS "decisionNote",created_at AS "createdAt"`;
 route('GET','/api/mobile/me/time-off-requests',async(req,res)=>{
  const rows=(await db.query(`SELECT ${fields} FROM node_time_off_requests WHERE agency_id=$1 AND staff_id=$2 ORDER BY created_at DESC LIMIT 100`,[req.user.agencyId,req.user.id])).rows;
  return reply(res,rows);
 });
 route('POST','/api/mobile/me/time-off-requests',async(req,res)=>{
  if(req.user.role!=='CAREGIVER')fail(403,'Caregiver access required');
  const {startDate,endDate=startDate,startTime='00:00',endTime='23:59',type='OTHERS',reason=''}=req.body||{};
  for(const date of [startDate,endDate])if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)fail(400,'Enter valid absence dates');
  if(endDate<startDate||Date.parse(endDate)-Date.parse(startDate)>90*86400000)fail(400,'Choose a range of up to 90 days');
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)||startDate===endDate&&endTime<=startTime)fail(400,'Enter valid absence times');
  if(!enums.TeamAbsenceType.includes(type))fail(400,'Choose a valid absence type');
  if(typeof reason!=='string'||reason.length>4000)fail(400,'Reason must be no more than 4,000 characters');
  const id=randomUUID();
  await db.query(`INSERT INTO node_time_off_requests(id,agency_id,staff_id,start_date,end_date,start_time,end_time,type,reason) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,[id,req.user.agencyId,req.user.id,startDate,endDate,startTime,endTime,type,reason.trim()]);
  return reply(res,{id,status:'PENDING'},'Request submitted',201);
 });
 route('GET','/api/team/time-off-requests',async(req,res)=>{
  auth.admin(req);
  const rows=(await db.query(`SELECT r.id,r.staff_id AS "staffId",r.start_date::text AS "startDate",r.end_date::text AS "endDate",to_char(r.start_time,'HH24:MI') AS "startTime",to_char(r.end_time,'HH24:MI') AS "endTime",r.type,r.reason,r.status,r.decision_note AS "decisionNote",r.created_at AS "createdAt",u.first_name||' '||u.last_name AS "staffName" FROM node_time_off_requests r JOIN users u ON u.id=r.staff_id WHERE r.agency_id=$1 ORDER BY CASE WHEN r.status='PENDING' THEN 0 ELSE 1 END,r.created_at DESC LIMIT 200`,[req.user.agencyId])).rows;
  return reply(res,rows);
 });
 route('POST','/api/team/time-off-requests/:id/decision',async(req,res)=>{
  auth.admin(req);
  if(!['APPROVED','DECLINED'].includes(req.body?.decision))fail(400,'Choose approve or decline');
  if(typeof(req.body?.note??'')!=='string'||(req.body.note||'').length>4000)fail(400,'Decision note must be no more than 4,000 characters');
  return db.transaction(async()=>{
   const row=(await db.query('SELECT *,start_date::text AS "startDate",end_date::text AS "endDate",to_char(start_time,\'HH24:MI\') AS "startTime",to_char(end_time,\'HH24:MI\') AS "endTime" FROM node_time_off_requests WHERE id=$1 AND agency_id=$2 FOR UPDATE',[req.params.id,req.user.agencyId])).rows[0];
   if(!row)fail(404,'Request not found');
   if(row.status!=='PENDING')fail(409,'Request has already been decided');
   let absenceId=null;
   if(req.body.decision==='APPROVED'){
    await db.query('SELECT id FROM users WHERE agency_id=$1 ORDER BY id FOR UPDATE',[req.user.agencyId]);
    const startDate=row.startDate,endDate=row.endDate,startTime=row.startTime,endTime=row.endTime;
    const booked=(await db.query(`SELECT id FROM node_roster_visits WHERE agency_id=$1 AND staff_id=$2 AND status IN ('DRAFT','SCHEDULED','IN_PROGRESS') AND visit_date + start_time < $4::timestamp AND visit_date + end_time > $3::timestamp LIMIT 1`,[req.user.agencyId,row.staff_id,startDate+'T'+startTime,endDate+'T'+endTime])).rows;
    if(booked.length)fail(409,'Reassign or cancel conflicting visits before approving this request');
    const existing=await repo.find('TeamAbsenceEntity',{user:row.staff_id});
    if(existing.some(a=>!a.deletedAt&&a.startDate+'T'+a.startTime<endDate+'T'+endTime&&(a.endDate||a.startDate)+'T'+a.endTime>startDate+'T'+startTime))fail(409,'Time off already exists during these dates and times');
    const absence=await repo.save('TeamAbsenceEntity',{user:row.staff_id,startDate,endDate,startTime,endTime,type:row.type,reason:row.reason,createdBy:req.user.id,updatedBy:req.user.id});
    absenceId=absence.id;
   }
   await db.query('UPDATE node_time_off_requests SET status=$2,decided_by=$3,decision_note=$4,absence_id=$5,updated_at=CURRENT_TIMESTAMP WHERE id=$1',[row.id,req.body.decision,req.user.id,req.body.note||'',absenceId]);
   req.afterCommit.push(()=>push.sendToUsers(req.user.agencyId,[row.staff_id],"Your time off request has been reviewed. Open Caremonitor to see the decision."));
   return reply(res,{id:row.id,status:req.body.decision,absenceId});
  });
 });
 route('GET','/api/team/:id/time-off',async(req,res)=>{
  const staff=await auth.userAccess(req,req.params.id,{staff:true});
  const year=Number(req.query.year||new Date().getUTCFullYear());if(!Number.isInteger(year)||year<1990||year>2200)fail(400,'Choose a valid year');
  const settings=(await db.query('SELECT start_month AS month,start_day AS day FROM node_holiday_year WHERE agency_id=$1',[req.user.agencyId])).rows[0]||null;
  const suffix=`-${String(settings?.month||1).padStart(2,'0')}-${String(settings?.day||1).padStart(2,'0')}`;
  const start=`${year}${suffix}`,end=new Date(Date.parse(`${year+1}${suffix}`)-86400000).toISOString().slice(0,10);
  const now=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date()).replace(' ','T');
  const entries=(await repo.find('TeamAbsenceEntity',{user:staff.id})).filter(x=>x.startDate<=end&&(x.endDate||x.startDate)>=start).map(x=>({id:x.id,startDate:x.startDate,endDate:x.endDate||x.startDate,startTime:x.startTime,endTime:x.endTime,type:x.type,reason:x.reason,cancelledAt:x.deletedAt||null,status:x.deletedAt?'CANCELLED':`${x.endDate||x.startDate}T${x.endTime||'23:59:59'}`<now?'TAKEN':'UPCOMING'})).sort((a,b)=>a.startDate.localeCompare(b.startDate)||a.startTime.localeCompare(b.startTime));
  return reply(res,{staff:auth.publicUser(staff),settings,year,start,end,entries,canManage:['ADMIN','SUPERADMIN'].includes(req.user.role),timezone:'Europe/London'});
 });
 route('PUT','/api/team/holiday-year',async(req,res)=>{
  auth.admin(req);const {month,day}=req.body;
  if(!Number.isInteger(month)||!Number.isInteger(day)||month<1||month>12||day<1||day>new Date(Date.UTC(2025,month,0)).getUTCDate())fail(400,'Choose a valid annual start date (excluding 29 February)');
  await db.query(`INSERT INTO node_holiday_year(agency_id,start_month,start_day,updated_by) VALUES($1,$2,$3,$4) ON CONFLICT(agency_id) DO UPDATE SET start_month=$2,start_day=$3,updated_by=$4,updated_at=CURRENT_TIMESTAMP`,[req.user.agencyId,month,day,req.user.id]);return reply(res,{month,day},'Holiday year saved for the agency');
 });
 const availabilityFields = `r.id,r.staff_id AS "staffId",r.start_date::text AS "startDate",r.end_date::text AS "endDate",to_char(r.start_time,'HH24:MI') AS "startTime",to_char(r.end_time,'HH24:MI') AS "endTime",r.reason,r.status,r.decision_note AS "decisionNote",r.created_at AS "createdAt"`;
 route('GET','/api/mobile/me/availability-requests',async(req,res)=>{
  if(req.user.role!=='CAREGIVER')fail(403,'Caregiver access required');
  const rows=(await db.query(`SELECT ${availabilityFields} FROM node_availability_requests r WHERE r.agency_id=$1 AND r.staff_id=$2 ORDER BY r.created_at DESC LIMIT 100`,[req.user.agencyId,req.user.id])).rows;
  return reply(res,rows);
 });
 route('POST','/api/mobile/me/availability-requests',async(req,res)=>{
  if(req.user.role!=='CAREGIVER')fail(403,'Caregiver access required');
  const {startDate,endDate=startDate,startTime,endTime,reason=''}=req.body||{};
  for(const date of [startDate,endDate])if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)fail(400,'Enter valid availability dates');
  if(endDate<startDate||Date.parse(endDate)-Date.parse(startDate)>90*86400000)fail(400,'Choose a range of up to 90 days');
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)||endTime<=startTime)fail(400,'Enter valid availability hours');
  if(typeof reason!=='string'||reason.length>1000)fail(400,'Reason must be no more than 1,000 characters');
  const duplicate=(await db.query(`SELECT id FROM node_availability_requests WHERE agency_id=$1 AND staff_id=$2 AND status='PENDING' AND start_date=$3 AND end_date=$4 AND start_time=$5 AND end_time=$6 LIMIT 1`,[req.user.agencyId,req.user.id,startDate,endDate,startTime,endTime])).rows[0];
  if(duplicate)fail(409,'This availability request is already pending');
  const id=randomUUID();
  await db.query(`INSERT INTO node_availability_requests(id,agency_id,staff_id,start_date,end_date,start_time,end_time,reason) VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,[id,req.user.agencyId,req.user.id,startDate,endDate,startTime,endTime,reason.trim()]);
  return reply(res,{id,status:'PENDING'},'Availability request submitted',201);
 });
 route('GET','/api/team/availability-requests',async(req,res)=>{
  auth.admin(req);
  const rows=(await db.query(`SELECT ${availabilityFields},u.first_name||' '||u.last_name AS "staffName" FROM node_availability_requests r JOIN users u ON u.id=r.staff_id WHERE r.agency_id=$1 ORDER BY CASE WHEN r.status='PENDING' THEN 0 ELSE 1 END,r.created_at DESC LIMIT 200`,[req.user.agencyId])).rows;
  return reply(res,rows);
 });
 route('POST','/api/team/availability-requests/:id/decision',async(req,res)=>{
  auth.admin(req);
  if(!['APPROVED','DECLINED'].includes(req.body?.decision))fail(400,'Choose approve or decline');
  if(typeof(req.body?.note??'')!=='string'||(req.body.note||'').length>1000)fail(400,'Decision note must be no more than 1,000 characters');
  return db.transaction(async()=>{
  const row=(await db.query('SELECT *,start_date::text AS "startDate",end_date::text AS "endDate",to_char(start_time,\'HH24:MI\') AS "startTime",to_char(end_time,\'HH24:MI\') AS "endTime" FROM node_availability_requests WHERE id=$1 AND agency_id=$2 FOR UPDATE',[req.params.id,req.user.agencyId])).rows[0];
  if(!row)fail(404,'Request not found');
  if(row.status!=='PENDING')fail(409,'Request has already been decided');
  let availabilityId=null;
  if(req.body.decision==='APPROVED'){
   const staff=await repo.get('UserEntity',row.staff_id);
   if(!staff||staff.agencyId!==req.user.agencyId||!staff.isActive||staff.deletedAt)fail(409,'Caregiver is no longer active');
   const saved=await repo.save('TeamAvailabilityEntity',{user:row.staff_id,frequency:'DAILY',startDate:row.startDate,endDate:row.endDate,isEnds:true,startTime:row.startTime,endTime:row.endTime,createdBy:req.user.id,updatedBy:req.user.id});
   availabilityId=saved.id;
  }
  await db.query('UPDATE node_availability_requests SET status=$2,decided_by=$3,decision_note=$4,availability_id=$5,updated_at=CURRENT_TIMESTAMP WHERE id=$1',[row.id,req.body.decision,req.user.id,req.body.note||'',availabilityId]);
  req.afterCommit.push(()=>push.sendToUsers(req.user.agencyId,[row.staff_id],"Your availability request has been reviewed. Open Caremonitor to see the decision."));
  return reply(res,{id:row.id,status:req.body.decision,availabilityId});
  });
 });
}
