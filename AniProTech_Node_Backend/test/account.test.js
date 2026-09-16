import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { randomUUID } from "node:crypto";
import { openDatabase, initializeSchema } from "../src/db.js";
import { createApp } from "../src/app.js";

test("administrator account settings are tenant scoped, validated and audited", async () => {
  const db=await openDatabase({driver:"pglite",dataDir:":memory:"});
  await initializeSchema(db);
  const app=createApp({db,config:{production:false,frontendUrl:"http://localhost:5173",corsOrigins:["http://localhost:5173"],jwtSecret:"account-test-secret-at-least-32-characters",uploadDir:"uploads-test",outboxDir:"outbox-test"},mail:{send:async()=>({accepted:[]})}});
  const {repo,auth}=app.locals.ctx, agency=randomUUID(), userId=randomUUID();
  await db.query(`INSERT INTO node_agencies(id,name,business_type,phone,address_line1,city,postcode,country,timezone,terms_accepted_at) VALUES($1,'Old Care','HOME_CARE','0200000000','1 Old Road','London','SW1','United Kingdom','Europe/London',CURRENT_TIMESTAMP)`,[agency]);
  await repo.save("UserEntity",{id:userId,agencyId:agency,firstName:"Old",lastName:"Admin",email:"admin@example.test",primaryPhone:"0700000000",role:"SUPERADMIN",isActive:true});
  const login=await auth.createLoginLink("admin@example.test"), token=login.link.searchParams.get("token"), decoded=Buffer.from(token,"base64url").toString().split(":"), session=await auth.exchange(decoded[0],decoded[1]);
  const bearer={Authorization:`Bearer ${session.accessToken}`};
  const initial=await request(app).get("/api/account").set(bearer);
  assert.equal(initial.status,200);
  assert.equal(initial.body.results.data.organisation.name,"Old Care");
  const payload={firstName:"Ani",lastName:"ProTech",email:"info@aniprotech.com",primaryPhone:"0711111111",organisationName:"Anipro Tech",organisationPhone:"0201111111",legalName:"Anipro Tech Ltd",businessType:"HOME_CARE",registrationNumber:"REG-1",website:"https://aniprotech.com",addressLine1:"10 High Street",addressLine2:"",city:"London",postcode:"SW1A 1AA",country:"United Kingdom",timezone:"Europe/London",supportEmail:"support@aniprotech.com",supportPhone:"0202222222",carerAppMessage:"Welcome carers",carerAppSettings:JSON.stringify({allowPhotoUploads:true,requireLocationForCheckIn:true,allowVoiceNotes:true,notifyClientOnArrival:true})};
  const updated=await request(app).put("/api/account").set(bearer).field(payload);
  assert.equal(updated.status,200,JSON.stringify(updated.body));
  assert.equal(updated.body.results.data.user.email,"info@aniprotech.com");
  assert.equal(updated.body.results.data.organisation.name,"Anipro Tech");
  assert.equal(updated.body.results.data.organisation.carer_app_settings.allowVoiceNotes,true);
  assert.equal((await db.query("SELECT count(*)::int AS count FROM node_audit_log WHERE path='/api/account'")).rows[0].count,1);
  await db.close();
});
