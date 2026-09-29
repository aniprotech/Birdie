import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { openDatabase, initializeSchema } from "../src/db.js";
import { createApp } from "../src/app.js";

test("opt-in mobile notifications are tenant scoped and contain no care details", async () => {
  const db=await openDatabase({driver:"pglite",dataDir:":memory:"});
  await initializeSchema(db);
  const mail=[], delivered=[];
  const app=createApp({db,config:{production:false,jwtSecret:"push-test-secret-at-least-32-characters",frontendUrl:"http://localhost",corsOrigins:[],uploadDir:"./test-uploads"},mail:{send:async(message)=>mail.push(message)},pushTransport:async(tokens,message)=>{delivered.push({tokens,message});return {data:tokens.map(()=>({status:"ok"}))}}});
  const {repo}=app.locals.ctx, agency=randomUUID(), otherAgency=randomUUID();
  const admin=await repo.save("UserEntity",{agencyId:agency,firstName:"Office",lastName:"Admin",email:"office@example.test",role:"ADMIN",isActive:true});
  const carer=await repo.save("UserEntity",{agencyId:agency,firstName:"Mobile",lastName:"Carer",email:"carer@example.test",role:"CAREGIVER",isActive:true});
  const outsider=await repo.save("UserEntity",{agencyId:otherAgency,firstName:"Other",lastName:"Carer",email:"other@example.test",role:"CAREGIVER",isActive:true});
  const client=await repo.save("UserEntity",{agencyId:agency,firstName:"Test",lastName:"Client",email:"client@example.test",role:"USER",isActive:true});
  const tokenFor=async(user)=>{await app.locals.ctx.auth.requestLink(user.email);const link=mail.at(-1).text.match(/http[^\s]+/)[0];const [email,password]=Buffer.from(new URL(link).searchParams.get("token"),"base64url").toString().split(":");return (await app.locals.ctx.auth.exchange(email,password)).accessToken};
  const carerToken=await tokenFor(carer),adminToken=await tokenFor(admin),otherToken=await tokenFor(outsider);
  const pushToken="ExpoPushToken[CaremonitorTestDevice123456]";
  try {
    let response=await request(app).put("/api/mobile/push-token").set("Authorization",`Bearer ${carerToken}`).send({token:pushToken,platform:"ios"});
    assert.equal(response.status,200,JSON.stringify(response.body));
    response=await request(app).post("/api/inbox/threads").set("Authorization",`Bearer ${adminToken}`).send({subject:"Private handover",participantIds:[carer.id],body:"Fictional client clinical details"});
    assert.equal(response.status,201,JSON.stringify(response.body));
    assert.deepEqual(delivered,[{tokens:[pushToken],message:"You have a new team message. Open Caremonitor to read it."}]);
    response=await request(app).post("/api/roster/visits").set("Authorization",`Bearer ${adminToken}`).send({clientId:client.id,staffId:carer.id,date:"2026-10-05",startTime:"09:00",endTime:"10:00",title:"Test visit",status:"SCHEDULED"});
    assert.equal(response.status,201,JSON.stringify(response.body));
    assert.deepEqual(delivered[1],{tokens:[pushToken],message:"Your visits have been updated. Open Caremonitor to view your rota."});
    assert.equal((await request(app).delete("/api/mobile/push-token").set("Authorization",`Bearer ${otherToken}`).send({token:pushToken})).status,200);
    assert.equal((await db.query("SELECT count(*)::int AS count FROM node_mobile_push_tokens WHERE token=$1",[pushToken])).rows[0].count,1);
    assert.equal((await request(app).delete("/api/mobile/push-token").set("Authorization",`Bearer ${carerToken}`).send({token:pushToken})).status,200);
    assert.equal((await db.query("SELECT count(*)::int AS count FROM node_mobile_push_tokens WHERE token=$1",[pushToken])).rows[0].count,0);
    assert.equal((await request(app).put("/api/mobile/push-token").set("Authorization",`Bearer ${carerToken}`).send({token:pushToken,platform:"ios"})).status,200);
    assert.equal((await request(app).post("/api/auth/logout").set("Authorization",`Bearer ${carerToken}`).send({})).status,200);
    await app.locals.ctx.push.sendToUsers(agency,[carer.id],"Open Caremonitor to view your rota.");
    assert.equal(delivered.length,2,"revoked device sessions must not receive push updates");
  } finally {await db.close()}
});
