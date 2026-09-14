import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import request from 'supertest';
import {openDatabase,initializeSchema} from '../src/db.js';
import {createApp} from '../src/app.js';
test('Weekly client visit schedule',async t=>{
 const db=await openDatabase({driver:'pglite',dataDir:':memory:'});await initializeSchema(db);let mail;
 const app=createApp({db,config:{production:false,jwtSecret:'visit-schedule-test-secret-long-enough',frontendUrl:'http://localhost:5173',corsOrigins:[],uploadDir:'./test-uploads'},mail:{send:async m=>mail=m}});
 const {repo,auth}=app.locals.ctx,agency=randomUUID();
 const person=(name,role,agencyId=agency)=>repo.save('UserEntity',{firstName:name,lastName:'Test',email:name+'@schedule.test',isActive:true,role,agencyId});
 const admin=await person('admin','ADMIN'),carer=await person('carer','CAREGIVER'),outsider=await person('outside','ADMIN',randomUUID()),client=await person('client','USER'),other=await person('other','USER');
 await repo.save('ClientCareTeamEntity',{client:client.id,carer:carer.id,viewAccess:true});
 const login=async u=>{await auth.requestLink(u.email);const [email,password]=Buffer.from(new URL(mail.text.match(/http[^\s]+/)[0]).searchParams.get('token'),'base64url').toString().split(':');return (await auth.exchange(email,password)).accessToken;};
 const at=await login(admin),ct=await login(carer),ot=await login(outsider);
 const call=(method,path,body,token=at)=>request(app)[method](path).set('Authorization','Bearer '+token).send(body),data=r=>r.body.results.data;
 const path=`/api/clients/${client.id}/visit-schedule?from=2026-09-07&to=2026-09-13`;
 try{
  const created=await call('post','/api/roster/visits',{clientId:client.id,staffId:carer.id,date:'2026-09-08',startTime:'07:00',endTime:'08:00',title:'Morning',status:'SCHEDULED'});assert.equal(created.status,201);const visit=data(created).visits[0];
  await call('post','/api/roster/visits',{clientId:client.id,staffId:null,date:'2026-09-09',startTime:'16:00',endTime:'16:30',title:'Draft',status:'DRAFT'});
  for(const [kind,status] of [['ACTIVITY','COMPLETED'],['ACTIVITY','PENDING'],['ALERT','OPEN']])assert.equal((await call('post',`/api/clients/${client.id}/entries`,{visitId:visit.id,kind,status,title:kind+' example'})).status,201);
  await t.test('Visit metrics count recorded activities and open alerts',async()=>{const r=await call('get',path);assert.equal(r.status,200);assert.equal(data(r).visits.length,2);const v=data(r).visits.find(v=>v.id===visit.id);assert.equal(v.taskTotal,2);assert.equal(v.taskDone,1);assert.equal(v.alerts,1);assert.equal(v.plannedMinutes,60);assert.equal(v.actualMinutes,null);});
  await t.test('Client and agency guards restrict carers to their visits',async()=>{assert.equal((await call('get',path,undefined,ot)).status,404);assert.equal((await call('get',path.replace(client.id,other.id),undefined,ct)).status,403);const r=await call('get',path,undefined,ct);assert.equal(r.status,200);assert.equal(data(r).visits.length,1);assert.equal(data(r).canManage,false);});
  await t.test('Due task dates respect weekdays and end dates',async()=>{const task=(await repo.find('ClientTaskEntity'))[0];const r=await call('post','/api/client-task-plan/create',{userId:client.id,taskId:task.id,frequency:'WEEKLY',selectedDays:['MONDAY','FRIDAY'],isAnyTime:false,sessions:['MORNING'],startDate:'2026-09-07',endDate:'2026-09-10',details:'Client only'});assert.equal(r.status,201);const result=data(await call('get',path));assert.equal(result.plannedTasks.length,1);assert.equal(result.plannedTasks[0].date,'2026-09-07');assert.deepEqual(result.plannedTasks[0].sessions,['MORNING']);});
  await t.test('Impossible and excessive date ranges are rejected',async()=>{for(const suffix of ['from=2026-02-30&to=2026-03-01','from=2026-09-08&to=2026-09-01','from=2026-01-01&to=2026-12-31'])assert.equal((await call('get',`/api/clients/${client.id}/visit-schedule?${suffix}`)).status,400);});
 }finally{await db.close();}
});
