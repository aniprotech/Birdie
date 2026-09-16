import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
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

test("business registration creates an isolated organisation owner and verification link", async () => {
  const db = await openDatabase({ driver: "pglite", dataDir: ":memory:" });
  await initializeSchema(db);
  const sent = [];
  const app = createApp({
    db,
    config: { production:false, frontendUrl:"http://localhost:5173", corsOrigins:["http://localhost:5173"], jwtSecret:"registration-test-secret-at-least-32-chars", uploadDir:"uploads", outboxDir:"outbox" },
    mail: { send: async message => { sent.push(message); return { accepted:[message.to] }; } },
  });
  try {
    const response = await request(app).post("/api/auth/register-business").send(details());
    assert.equal(response.status, 201, JSON.stringify(response.body));
    assert.equal(sent.length, 1);
    assert.match(sent[0].text, /http:\/\/localhost:5173\/login\?token=/);
    const user = (await db.query("SELECT role,is_active,agency_id FROM users WHERE email=$1", ["owner@example.test"])).rows[0];
    assert.equal(user.role, "SUPERADMIN");
    assert.equal(user.is_active, true);
    const agency = (await db.query("SELECT name,timezone FROM node_agencies WHERE id=$1", [user.agency_id])).rows[0];
    assert.deepEqual(agency, { name:"Safe Hands Care", timezone:"Europe/London" });
    assert.equal((await request(app).post("/api/auth/register-business").send(details())).status, 409);
    assert.equal((await request(app).post("/api/auth/register-business").send({...details("bad@example.test"), acceptTerms:false})).status, 400);
    assert.equal((await request(app).post("/api/auth/register-business").send({...details("postcode@example.test"), postcode:"501218", country:"United Kingdom"})).status, 400);
  } finally { await db.close(); }
});
