import {reply,fail} from '../http.js';
export function registerTimeOff({db,repo,auth},route){
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
}
