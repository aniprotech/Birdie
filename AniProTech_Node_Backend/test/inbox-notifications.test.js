import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import request from 'supertest';
import {openDatabase,initializeSchema} from '../src/db.js';
import {createApp} from '../src/app.js';
import {createInboxNotifications,classifyNotification} from '../src/inbox-notifications.js';
import {createNotificationTransport} from '../src/notification-transport.js';
test('Durable email notifications',async t=>{
 const db=await openDatabase({driver:'pglite',dataDir:':memory:'});await initializeSchema(db);
 const mail=[],config={production:false,inboxNotificationsEnabled:true,mailMode:'smtp',jwtSecret:'notification-tests-only-secret-32-characters',frontendUrl:'https://app.example.test',corsOrigins:[],uploadDir:'./test-uploads'};
 const app=createApp({db,config,mail:{send:async m=>{mail.push(m);return {accepted:[m.to],messageId:'accepted'};}}}),ctx=app.locals.ctx,agency=randomUUID();
 const person=(name,role,agencyId=agency)=>ctx.repo.save('UserEntity',{firstName:name,lastName:'Fixture',email:name+'@notifications.test',role,agencyId,isActive:true});
 const admin=await person('admin','ADMIN'),other=await person('other','ADMIN',randomUUID()),client=await person('client','USER'),carer=await person('carer','CAREGIVER');
 const pref={folder:'ALERT:OPEN',sort:'NEWEST',showPreviews:true,deliveryEnabled:true,notifications:{'Medication not taken':{email:true,sms:true}}};
 for(const user of [admin,other,carer])await db.query(`INSERT INTO node_inbox_preferences(user_id,agency_id,preferences,notifications_since) VALUES($1,$2,$3,CURRENT_TIMESTAMP-INTERVAL '1 hour')`,[user.id,user.agencyId,JSON.stringify(pref)]);
 async function login(u){await ctx.auth.requestLink(u.email);const link=mail.at(-1).text.match(/http[^\s]+/)[0];const [email,password]=Buffer.from(new URL(link).searchParams.get('token'),'base64url').toString().split(':');return(await ctx.auth.exchange(email,password)).accessToken;}
 const token=await login(admin),otherToken=await login(other),call=(method,path,body,auth=token)=>request(app)[method](path).set('Authorization','Bearer '+auth).send(body);
 const sends=[];let failure=null;const transport={ready:{email:true,sms:false},send:async(...args)=>{sends.push(args);if(failure)throw failure;return{id:'mock-'+sends.length,status:'ACCEPTED'};}};
 const worker=createInboxNotifications(ctx,transport),create=async(title='Medication not taken')=>{const r=await call('post','/api/inbox/items',{kind:'ALERT',clientId:client.id,title,body:'PRIVATE clinical content'});assert.equal(r.status,201,r.body.message);return r.body.results.data;};
 const jobs=async()=> (await db.query('SELECT * FROM node_notification_deliveries ORDER BY created_at,id')).rows;
 try{
  await t.test('Committed alerts queue once; recipients are scoped; email contains no clinical details',async()=>{
   await create();await worker.tick();assert.equal(sends.length,1);assert.equal(sends[0][0],'email');assert.equal(sends[0][1],admin.email);assert.ok(sends[0][2].includes('/admin/inbox?item='));assert.ok(!sends[0][2].includes('PRIVATE'));assert.ok(!sends[0][2].includes('Medication'));assert.equal((await jobs())[0].status,'ACCEPTED');await worker.tick();assert.equal(sends.length,1);
   const id=randomUUID();await assert.rejects(db.transaction(async()=>{await db.query(`INSERT INTO node_client_entries(id,agency_id,client_id,kind,title,body,status,created_by,updated_by) VALUES($1,$2,$3,'ALERT','Medication not taken','','OPEN',$4,$4)`,[id,agency,client.id,admin.id]);throw Error('rollback');}));assert.equal((await db.query('SELECT * FROM node_notification_events WHERE entry_id=$1',[id])).rows.length,0);
  });
  await t.test('Known temporary rejection retries with backoff and survives worker recreation',async()=>{
   failure=Object.assign(Error('not accepted'),{code:'SMTP_REJECTED',retryable:true});await create();await worker.tick();let j=(await jobs()).find(x=>x.status==='PENDING');assert.equal(j.attempts,1);const count=sends.length;await worker.tick();assert.equal(sends.length,count);
   failure=null;await db.query(`UPDATE node_notification_deliveries SET next_attempt_at=CURRENT_TIMESTAMP-INTERVAL '1 minute' WHERE id=$1`,[j.id]);await createInboxNotifications(ctx,transport).tick();j=(await jobs()).find(x=>x.id===j.id);assert.equal(j.status,'ACCEPTED');assert.equal(j.attempts,2);
  });
  await t.test('Unknown acknowledgement and interrupted sending cannot be retried blindly',async()=>{
   failure=Object.assign(Error('unknown'),{code:'SMTP_OUTCOME_UNKNOWN',retryable:false});await create();await worker.tick();const j=(await jobs()).find(x=>x.status==='UNKNOWN');assert.ok(j);const count=sends.length;await worker.tick();assert.equal(sends.length,count);assert.equal((await call('post','/api/inbox/notifications/'+j.id+'/retry',{})).status,409);
   await db.query(`UPDATE node_notification_deliveries SET status='PROCESSING',lease_until=CURRENT_TIMESTAMP-INTERVAL '1 minute' WHERE id=$1`,[j.id]);await worker.tick();assert.equal((await jobs()).find(x=>x.id===j.id).status,'UNKNOWN');assert.equal(sends.length,count);failure=null;
  });
  await t.test('Resolution and withdrawal cancel queued retries',async()=>{
   failure=Object.assign(Error('temporary'),{code:'SMTP_REJECTED',retryable:true});const e=await create();await worker.tick();const j=(await jobs()).find(x=>x.status==='PENDING');await call('put','/api/inbox/items/'+e.id,{revision:e.revision,state:'RESOLVED'});await db.query('UPDATE node_notification_deliveries SET next_attempt_at=CURRENT_TIMESTAMP WHERE id=$1',[j.id]);const count=sends.length;await worker.tick();assert.equal(sends.length,count);assert.equal((await jobs()).find(x=>x.id===j.id).status,'CANCELLED');
   await create();await worker.tick();const pending=(await jobs()).find(x=>x.status==='PENDING');await db.query(`UPDATE node_inbox_preferences SET preferences=jsonb_set(preferences,'{deliveryEnabled}','false') WHERE user_id=$1`,[admin.id]);await db.query('UPDATE node_notification_deliveries SET next_attempt_at=CURRENT_TIMESTAMP WHERE id=$1',[pending.id]);const count2=sends.length;await worker.tick();assert.equal(sends.length,count2);assert.equal((await jobs()).find(x=>x.id===pending.id).status,'CANCELLED');failure=null;
  });
  await t.test('Historical alerts are not delivered on new opt-in; history is private',async()=>{
   await create();await db.query(`UPDATE node_inbox_preferences SET preferences=$2,notifications_since=CURRENT_TIMESTAMP+INTERVAL '1 minute' WHERE user_id=$1`,[admin.id,JSON.stringify(pref)]);const count=sends.length;await worker.tick();assert.equal(sends.length,count);
   let r=await call('get','/api/inbox/notifications');assert.equal(r.status,200);assert.ok(r.body.results.data.deliveries.length);assert.equal(r.body.results.data.channels.sms,false);r=await call('get','/api/inbox/notifications',undefined,otherToken);assert.equal(r.body.results.data.deliveries.length,0);
   const j=(await jobs())[0];assert.equal((await call('post','/api/inbox/notifications/'+j.id+'/retry',{},otherToken)).status,404);
  });
  await t.test('Legacy and explicit categories map predictably',async()=>{
   assert.equal(classifyNotification({title:'Forced check-out'}),'Forced check-in or check-out');assert.equal(classifyNotification({category:'Incident',severity:'HIGH'}),'Severe');assert.equal(classifyNotification({title:'A custom alert'}),'Other alerts');
  });
 }finally{await db.close();}
});
test('SMTP adapter records acceptance and conservatively classifies failures',async()=>{
 const config={mailMode:'smtp'};let result=await createNotificationTransport(config,{send:async()=>({accepted:['person@example.test'],messageId:'message'})}).send('email','person@example.test','Generic link','id');assert.equal(result.status,'ACCEPTED');
 for(const [error,code,retryable] of [[{code:'EAUTH'},'SMTP_REJECTED',false],[{responseCode:451},'SMTP_REJECTED',true],[{code:'ETIMEDOUT',command:'DATA'},'SMTP_OUTCOME_UNKNOWN',false]])await assert.rejects(createNotificationTransport(config,{send:async()=>{throw error;}}).send('email','person@example.test','Generic link','id'),e=>e.code===code&&e.retryable===retryable);
 await assert.rejects(createNotificationTransport(config,{}).send('sms','+441234567890','test','id'),/CHANNEL_NOT_CONFIGURED/);
});
