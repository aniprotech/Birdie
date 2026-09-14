import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import request from 'supertest';
import {openDatabase,initializeSchema} from '../src/db.js';
import {createApp} from '../src/app.js';
test('Read-only shared client portal',async t=>{
 const db=await openDatabase({driver:'pglite',dataDir:':memory:'});await initializeSchema(db);const sent=[];
 const app=createApp({db,config:{production:false,jwtSecret:'portal-test-only-32-character-secret',frontendUrl:'http://127.0.0.1:5173',corsOrigins:[],uploadDir:'./test-uploads'},mail:{send:async m=>sent.push(m)}});
 const {repo,auth}=app.locals.ctx,agency=randomUUID();
 const person=(name,role,agencyId=agency)=>repo.save('UserEntity',{firstName:name,lastName:'Test',email:name+'@portal.example',role,agencyId,isActive:true,highlights:'Test biography'});
 const admin=await person('admin','ADMIN'),carer=await person('carer','CAREGIVER'),outsider=await person('outside','ADMIN',randomUUID()),client=await person('client','USER'),other=await person('other','USER');
 const login=async u=>{await auth.requestLink(u.email);const [email,password]=Buffer.from(new URL(sent.at(-1).text.match(/http[^\s]+/)[0]).searchParams.get('token'),'base64url').toString().split(':');return (await auth.exchange(email,password)).accessToken;};
 const at=await login(admin),ct=await login(carer),ot=await login(outsider);
 const call=(method,path,body,token=at)=>request(app)[method](path).set('Authorization','Bearer '+token).send(body),data=r=>r.body.results.data;
 const generate=(revision,scopes=['BASIC'])=>call('post','/api/client-share-access/generate',{clientId:client.id,revision,scopes,days:7,acknowledged:true});
 const exchange=(g,code=g.accessCode)=>request(app).post('/api/portal/exchange').send({shareId:g.shareId,code,name:'Test Viewer',email:'viewer@portal.example'});
 let grant,session,oldMagic;
 try{
  await repo.save('ClientInformationEntity',{user:client.id,medicalHistory:['Example medical history'],allergiesIntolerances:'Example allergy'});
  await repo.save('UserPrimaryAddressEntity',{user:client.id,addressLine1:'Test address',accessDetails:'PRIVATE DOOR CODE',secureCheckin:'true'});
  await call('post',`/api/clients/${client.id}/entries`,{kind:'NOTE',status:'RECORDED',title:'Shared note',body:'Client care note'});
  await call('post',`/api/clients/${client.id}/entries`,{kind:'ALERT',status:'OPEN',title:'Internal alert',body:'Private office action'});
  await call('post',`/api/clients/${other.id}/entries`,{kind:'NOTE',status:'RECORDED',title:'Other client note',body:'Must not be returned'});
  await t.test('Only agency admins can enable sharing, with explicit sections and consent',async()=>{
   assert.equal((await call('get',`/api/client-share-access/${client.id}`,undefined,ct)).status,403);
   assert.equal((await call('get',`/api/client-share-access/${client.id}`,undefined,ot)).status,404);
   assert.equal((await call('post','/api/client-share-access/generate',{clientId:client.id,scopes:['BASIC'],revision:0})).status,400);
   const r=await generate(0);assert.equal(r.status,200);grant=data(r);assert.match(grant.accessCode,/^[A-F0-9]{4}(-[A-F0-9]{4}){4}$/);assert.match(grant.websiteUrl,/127\.0\.0\.1:5173\/access#share=/);
   const stored=(await db.query('SELECT * FROM node_share_grants WHERE id=$1',[grant.shareId])).rows[0];assert.notEqual(stored.code_hash,grant.accessCode);assert.ok(!stored.code_cipher.includes(grant.accessCode));
   assert.equal(data(await call('get',`/api/client-share-access/${client.id}`)).accessCode,grant.accessCode);
  });
  await t.test('Codes sign into a limited portal; staff routes reject portal sessions',async()=>{
   assert.equal((await exchange(grant,'WRONG')).status,401);const r=await exchange(grant);assert.equal(r.status,200);session=data(r).token;
   const record=data(await call('get','/api/portal/record',undefined,session));assert.equal(record.clientName,'client Test');assert.ok(record.basic);assert.ok(!record.medical);assert.ok(!record.careLog);assert.ok(!JSON.stringify(record).includes('PRIVATE DOOR CODE'));
   assert.equal((await call('get',`/api/client-share-access/${client.id}`,undefined,session)).status,401);
   assert.equal((await call('get','/api/portal/record',undefined,at)).status,401);
   assert.equal((await call('put','/api/portal/record',{basic:{firstName:'Forged'}},session)).status,401);
  });
  await t.test('Replacing a code revokes active sessions and previous email links',async()=>{
   let r=await call('post','/api/client-share-access/send-magic-link',{clientId:client.id,revision:grant.revision});assert.equal(r.status,200);
   oldMagic=new URLSearchParams(new URL(sent.at(-1).text.match(/http[^\s]+/)[0]).hash.slice(1));
   const old=grant;grant=data(await generate(grant.revision,['BASIC','MEDICAL','CARE_LOG']));
   assert.equal((await exchange(old)).status,401);assert.equal((await call('get','/api/portal/record',undefined,session)).status,401);
   assert.equal((await request(app).post('/api/portal/exchange').send({shareId:oldMagic.get('share'),token:oldMagic.get('token')})).status,401);
   assert.equal((await generate(old.revision)).status,409);
  });
  await t.test('Shared medical/care sections are allowlisted and isolated to one client',async()=>{
   session=data(await exchange(grant)).token;
   const r=await call('get','/api/portal/record',undefined,session);assert.equal(r.status,200);const record=data(r);
   assert.deepEqual(record.medical.medicalHistory,['Example medical history']);assert.equal(record.careLog.length,1);assert.equal(record.careLog[0].title,'Shared note');assert.ok(!JSON.stringify(record).includes('Internal alert'));assert.ok(!JSON.stringify(record).includes('Other client note'));
   assert.equal((await call('get','/api/portal/record?page=-1',undefined,session)).status,400);
  });
  await t.test('Email links are single use and revocation invalidates all access',async()=>{
   assert.equal((await call('post','/api/client-share-access/send-magic-link',{clientId:client.id,revision:grant.revision})).status,200);
   const params=new URLSearchParams(new URL(sent.at(-1).text.match(/http[^\s]+/)[0]).hash.slice(1)),body={shareId:params.get('share'),token:params.get('token')};
   const r=await request(app).post('/api/portal/exchange').send(body);assert.equal(r.status,200);const emailSession=data(r).token;
   assert.equal((await request(app).post('/api/portal/exchange').send(body)).status,401);
   const history=data(await call('get',`/api/client-share-access/${client.id}`)).history;assert.ok(history.some(e=>e.action==='CLIENT_SIGNED_IN'));assert.ok(history.some(e=>e.action==='RECORD_VIEWED'));assert.ok(!JSON.stringify(history).includes(grant.accessCode));
   assert.equal((await call('post','/api/client-share-access/revoke',{clientId:client.id,revision:grant.revision})).status,200);
   assert.equal((await call('get','/api/portal/record',undefined,emailSession)).status,401);assert.equal((await exchange(grant)).status,401);
   grant=data(await call('get',`/api/client-share-access/${client.id}`));assert.equal(grant.active,false);
  });
  await t.test('Expiry, inactive clients, persistent attempt limits and logout are enforced',async()=>{
   grant=data(await generate(grant.revision));
   await db.query("UPDATE node_share_grants SET expires_at=CURRENT_TIMESTAMP-interval '1 second' WHERE id=$1",[grant.shareId]);assert.equal((await exchange(grant)).status,401);
   grant=data(await generate(grant.revision));
   await db.query('UPDATE node_share_grants SET failed_attempts=10 WHERE id=$1',[grant.shareId]);assert.equal((await exchange(grant)).status,401);
   await db.query("UPDATE node_share_grants SET attempt_window=CURRENT_TIMESTAMP-interval '16 minutes' WHERE id=$1",[grant.shareId]);const r=await exchange(grant);assert.equal(r.status,200);session=data(r).token;
   await repo.save('UserEntity',{id:client.id,isActive:false});assert.equal((await call('get','/api/portal/record',undefined,session)).status,401);await repo.save('UserEntity',{id:client.id,isActive:true});
   assert.equal((await call('post','/api/portal/logout',{},session)).status,200);assert.equal((await call('get','/api/portal/record',undefined,session)).status,401);
  });
 }finally{await db.close();}
});
