import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import request from 'supertest';
import {openDatabase,initializeSchema} from '../src/db.js';
import {createApp} from '../src/app.js';
test('Organisation care log',async t=>{
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
  await db.query("UPDATE node_roster_visits SET status='COMPLETED',actual_start='2026-09-08T06:00:00Z',actual_end='2026-09-08T07:00:00Z' WHERE id=$1",[visit.id]);
  const log='/api/care-log?from=2026-09-07&to=2026-09-13';
  await t.test('Visit summaries, counts and filters',async()=>{
   const r=await call('get',log);assert.equal(r.status,200);const d=data(r);assert.equal(d.items.length,1);assert.equal(d.counts.COMPLETED,1);assert.equal(d.items[0].actualMinutes,60);assert.equal(d.items[0].activities,1);assert.equal(d.items[0].alerts,1);
   for(const extra of ['&status=IN_PROGRESS','&client='+other.id,'&search=absent','&activity=inactive','&group=unknown'])assert.equal(data(await call('get',log+extra)).items.length,0);
   assert.equal(data(await call('get',log+'&carer='+carer.id)).items.length,1);
  });
  await t.test('Permissions and input validation',async()=>{
   assert.equal((await call('get',log,undefined,ct)).status,403);
   assert.equal(data(await call('get',log,undefined,ot)).items.length,0);
   for(const extra of ['&status=DRAFT','&page=-1','&activity=bad'])assert.equal((await call('get',log+extra)).status,400);
   assert.equal((await call('get','/api/care-log?from=2026-02-30&to=2026-03-01')).status,400);
  });
 }finally{await db.close();}
});
