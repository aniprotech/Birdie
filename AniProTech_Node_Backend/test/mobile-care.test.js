import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { openDatabase, initializeSchema } from "../src/db.js";
import { createApp } from "../src/app.js";

test("Mobile carer visit workflow is assigned, audited and tenant scoped", async () => {
  const db=await openDatabase({driver:"pglite",dataDir:":memory:"}); await initializeSchema(db);
  const sent=[];
  const app=createApp({db,config:{production:false,jwtSecret:"mobile-test-secret-at-least-32-characters",frontendUrl:"http://localhost",corsOrigins:[],uploadDir:"./test-uploads"},mail:{send:async(m)=>sent.push(m)}});
  const {repo}=app.locals.ctx, agency=randomUUID(), otherAgency=randomUUID();
  const carer=await repo.save("UserEntity",{agencyId:agency,firstName:"Mobile",lastName:"Carer",email:"mobile@example.test",role:"CAREGIVER",isActive:true});
  const other=await repo.save("UserEntity",{agencyId:otherAgency,firstName:"Other",lastName:"Carer",email:"other@example.test",role:"CAREGIVER",isActive:true});
  const client=await repo.save("UserEntity",{agencyId:agency,firstName:"Care",lastName:"Client",email:"client@example.test",role:"USER",isActive:true});
  await repo.save("UserPrimaryAddressEntity",{user:client.id,addressLine1:"1 Test Street",city:"Birmingham",postalCode:"B1 1AA",isPrimary:true,latitude:52.1,longitude:-1.5,checkinRadius:150});
  const category=await repo.save("ClientTaskCategoryEntity",{name:"Daily care",description:"Test category"});
  const task=await repo.save("ClientTaskEntity",{name:"Hydration check",description:"Offer water",clientTaskCategory:category.id});
  await repo.save("ClientTaskPlanEntity",{task:task.id,taskNameSnapshot:task.name,categoryNameSnapshot:category.name,user:client.id,details:"Offer water",isEssential:true,isAnyTime:true,sessions:[],frequency:"DAILY",selectedDays:[],startDate:"2026-01-01",timesPerDay:1,revision:1});
  await repo.save("ClientMedicationSchedulingEntity",{user:client.id,clientFirstName:"Care",clientLastName:"Client",medicationName:"Test medication",dose:"1 unit",route:"Oral",frequencyType:"DAILY",firstDoseDate:"2026-01-01",isStopped:false});
  const visitId=randomUUID(); await db.query("INSERT INTO node_roster_visits(id,agency_id,client_id,staff_id,visit_date,start_time,end_time,title,notes,status,revision,created_by,updated_by) VALUES($1,$2,$3,$4,'2026-09-13','09:00','10:00','Morning care','','SCHEDULED',1,$4,$4)",[visitId,agency,client.id,carer.id]);
  const tokenFor=async(u)=>{await app.locals.ctx.auth.requestLink(u.email);const link=sent.at(-1).text.match(/http[^\s]+/)[0];const [email,password]=Buffer.from(new URL(link).searchParams.get("token"),"base64url").toString().split(":");return (await app.locals.ctx.auth.exchange(email,password)).accessToken};
  const carerToken=await tokenFor(carer),otherToken=await tokenFor(other);
  const call=(method,path,body,token=carerToken)=>{let r=request(app)[method](path).set("Authorization","Bearer "+token);if(body!==undefined)r=r.send(body);return r};
  try {
    let detailResponse=await call("get",`/api/mobile/visits/${visitId}`); assert.equal(detailResponse.status,200); assert.equal(detailResponse.body.results.data.tasks.length,1); assert.equal(detailResponse.body.results.data.medication.length,1); assert.equal(detailResponse.body.results.data.medication[0].dose,"1 unit");
    assert.equal((await call("get",`/api/mobile/visits/${visitId}`,undefined,otherToken)).status,404);
    let r=await call("post",`/api/mobile/visits/${visitId}/attendance`,{event:"CHECK_IN",latitude:null,longitude:null,accuracy:null});assert.equal(r.status,400);
    r=await call("post",`/api/mobile/visits/${visitId}/attendance`,{event:"CHECK_IN",latitude:52.1,longitude:-1.5,accuracy:8});assert.equal(r.status,200,JSON.stringify(r.body)); assert.equal(r.body.results.data.withinRadius,true);
    r=await call("post",`/api/mobile/visits/${visitId}/entries`,{kind:"NOTE",title:"Visit note",body:"Client comfortable",status:"RECORDED",category:""});assert.equal(r.status,201,JSON.stringify(r.body));
    r=await call("post",`/api/mobile/visits/${visitId}/entries`,{kind:"ALERT",title:"Incident reported",body:"Minor concern escalated",status:"OPEN",category:"INCIDENT"});assert.equal(r.status,201);
    r=await request(app).post(`/api/mobile/visits/${visitId}/photos`).set("Authorization","Bearer "+carerToken).field("caption","Dummy care evidence").attach("photo",Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=","base64"),{filename:"dummy.png",contentType:"image/png"});assert.equal(r.status,201,JSON.stringify(r.body));
    r=await call("post",`/api/mobile/visits/${visitId}/attendance`,{event:"CHECK_OUT",latitude:52.1,longitude:-1.5,accuracy:9});assert.equal(r.status,200);
    const detail=(await call("get",`/api/mobile/visits/${visitId}`)).body.results.data;
    assert.equal(detail.visit.status,"COMPLETED"); assert.equal(detail.attendance.length,2); assert.equal(detail.entries.length,3); assert.equal(detail.attachments.length,1); assert.equal(detail.entries.some((e)=>e.title==="Caregiver arrived"),true); assert.equal(sent.some((m)=>m.subject==="Your caregiver has arrived"),true);
    assert.equal((await call("post","/api/mobile/note-assist",{text:"Client refused medication. Senior carer was informed."})).body.results.data.attention.length,1);
  } finally { await db.close(); }
});
