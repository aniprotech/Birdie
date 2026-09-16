import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { randomUUID } from "node:crypto";
import { openDatabase, initializeSchema } from "../src/db.js";
import { createApp } from "../src/app.js";

const details = (email = "owner@example.test") => ({
  firstName: "Asha", lastName: "Patel", email, phone: "+44 7700 900123",
  businessName: "Safe Hands Care", legalName: "Safe Hands Care Ltd",
  businessType: "HOME_CARE", registrationNumber: "CQC-12345",
  website: "https://example.test", addressLine1: "10 High Street",
  state: "England", city: "London", postcode: "SW1A 1AA", country: "United Kingdom",
  timezone: "Europe/London", acceptTerms: true,
});

test("business registration creates an isolated pending organisation awaiting approval", async () => {
  const db = await openDatabase({ driver: "pglite", dataDir: ":memory:" });
  await initializeSchema(db);
  const sent = [];
  const app = createApp({
    db,
    config: { production:false, frontendUrl:"http://localhost:5173", corsOrigins:["http://localhost:5173"], jwtSecret:"registration-test-secret-at-least-32-chars", uploadDir:"uploads", outboxDir:"outbox", platformAdminEmails:["platform@example.test"] },
    mail: { send: async message => { sent.push(message); return { accepted:[message.to] }; } },
  });
  try {
    const response = await request(app).post("/api/auth/register-business").send(details());
    assert.equal(response.status, 201, JSON.stringify(response.body));
    assert.equal(sent.length, 2);
    assert.match(sent[0].text, /received the application/i);
    const user = (await db.query("SELECT role,is_active,agency_id FROM users WHERE email=$1", ["owner@example.test"])).rows[0];
    assert.equal(user.role, "SUPERADMIN");
    assert.equal(user.is_active, false);
    const agency = (await db.query("SELECT name,timezone,status FROM node_agencies WHERE id=$1", [user.agency_id])).rows[0];
    assert.deepEqual(agency, { name:"Safe Hands Care", timezone:"Europe/London", status:"PENDING" });
    const platform = await app.locals.ctx.repo.save("UserEntity", { id:randomUUID(), firstName:"Platform", lastName:"Admin", email:"platform@example.test", role:"SUPERADMIN", isActive:true });
    const login = await app.locals.ctx.auth.createLoginLink(platform.email);
    const token = login.link.searchParams.get("token"), [loginEmail,secret] = Buffer.from(token,"base64url").toString().split(":");
    const session = await app.locals.ctx.auth.exchange(loginEmail, secret);
    const bearer = { Authorization:`Bearer ${session.accessToken}` };
    const pending = await request(app).get("/api/platform/organisations?status=PENDING").set(bearer);
    assert.equal(pending.status, 200, JSON.stringify(pending.body));
    assert.equal(pending.body.results.data.organisations.length, 1);
    const approval = await request(app).put(`/api/platform/organisations/${user.agency_id}/status`).set(bearer).send({status:"ACTIVE",notes:"Checks completed"});
    assert.equal(approval.status, 200, JSON.stringify(approval.body));
    assert.equal((await db.query("SELECT status FROM node_agencies WHERE id=$1",[user.agency_id])).rows[0].status,"ACTIVE");
    assert.equal((await db.query("SELECT is_active FROM users WHERE email=$1",["owner@example.test"])).rows[0].is_active,true);
    assert.equal(sent.at(-1).actionLabel,"Open your Caremonitor dashboard");
    assert.equal((await request(app).post("/api/auth/register-business").send(details())).status, 409);
    assert.equal((await request(app).post("/api/auth/register-business").send({...details("bad@example.test"), acceptTerms:false})).status, 400);
    assert.equal((await request(app).post("/api/auth/register-business").send({...details("postcode@example.test"), postcode:"501218", country:"United Kingdom"})).status, 400);
  } finally { await db.close(); }
});
