import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { openDatabase, initializeSchema } from "../src/db.js";
import { createApp } from "../src/app.js";
import { classifyVisitTiming } from "../src/services/reporting-audits.js";

test("late visit timing distinguishes late and missing attendance", () => {
  const row = { scheduledStart: "2026-09-25T08:00:00Z", scheduledEnd: "2026-09-25T09:00:00Z", actualStart: "2026-09-25T08:12:00Z", actualEnd: null, status: "IN_PROGRESS" };
  const result = classifyVisitTiming(row, new Date("2026-09-25T09:10:00Z"), 5);
  assert.equal(result.checkInLateMinutes, 12);
  assert.equal(result.lateCheckIn, true);
  assert.equal(result.missingCheckOut, true);
  assert.equal(result.missingCheckIn, false);
});

test("reporting audits read agency data and restrict caregiver access", async () => {
  const db = await openDatabase({ driver: "pglite", dataDir: ":memory:" });
  try {
    await initializeSchema(db);
    const config = { production: false, jwtSecret: "reporting-audit-test-secret-long-enough", frontendUrl: "http://localhost:5173", corsOrigins: [], uploadDir: "./test-uploads" };
    const app = createApp({ db, config, mail: { send: async () => ({ accepted: [] }) } });
    const { repo, auth } = app.locals.ctx, agency = randomUUID();
    const admin = await repo.save("UserEntity", { agencyId: agency, firstName: "Report", lastName: "Admin", email: "report-admin@example.test", role: "ADMIN", isActive: true });
    const carer = await repo.save("UserEntity", { agencyId: agency, firstName: "Report", lastName: "Carer", email: "report-carer@example.test", role: "CAREGIVER", isActive: true });
    const client = await repo.save("UserEntity", { agencyId: agency, firstName: "Report", lastName: "Client", email: "report-client@example.test", role: "USER", isActive: true });
    await db.query("INSERT INTO node_team_groups(user_id,groups) VALUES($1,$2::jsonb)", [carer.id, JSON.stringify(["North team"])]);
    const token = async (user) => { const link = await auth.createLoginLink(user.email); const [email, secret] = Buffer.from(link.link.searchParams.get("token"), "base64url").toString().split(":"); return (await auth.exchange(email, secret)).accessToken; };
    const headers = { Authorization: `Bearer ${await token(admin)}` };
    const visitId = randomUUID();
    await db.query(`INSERT INTO node_roster_visits(id,agency_id,client_id,staff_id,visit_date,start_time,end_time,title,status,created_by,updated_by,actual_start,actual_end)
      VALUES($1,$2,$3,$4,'2026-09-25','09:00','10:00','Morning care','COMPLETED',$5,$5,'2026-09-25T08:15:00Z','2026-09-25T09:20:00Z')`, [visitId, agency, client.id, carer.id, admin.id]);
    await db.query(`INSERT INTO node_quality_cases(id,agency_id,client_id,kind,severity,title,description,owner_id,created_by,created_at)
      VALUES($1,$2,$3,'SAFEGUARDING','HIGH','Safety concern','A concern requiring review',$4,$5,'2026-09-25T12:00:00Z')`, [randomUUID(), agency, client.id, carer.id, admin.id]);
    const medicationId = randomUUID();
    await db.query("INSERT INTO client_medications_scheduling(id,user_id,medication_name) VALUES($1,$2,'Test medicine')", [medicationId, client.id]);
    await db.query(`INSERT INTO client_medications_administration(id,medication_id,date,slot,outcome,note,updated_by)
      VALUES($1,$2,'2026-09-25','MORNING','ADMINISTERED','Historical record',$3)`, [randomUUID(), medicationId, admin.id]);
    await db.query(`INSERT INTO node_medication_administrations(id,agency_id,client_event_id,visit_id,client_id,medication_id,actor_id,outcome,slot,occurred_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,'REFUSED','EVENING','2026-09-25T18:00:00Z')`, [randomUUID(), agency, randomUUID(), visitId, client.id, medicationId, carer.id]);
    await db.query(`INSERT INTO node_client_entries(id,agency_id,client_id,visit_id,kind,title,body,category,status,created_by,updated_by)
      VALUES($1,$2,$3,$4,'OBSERVATION','Wellbeing','Observed','GENERAL','OPEN',$5,$5)`, [randomUUID(), agency, client.id, visitId, carer.id]);
    await db.query(`INSERT INTO node_visit_attendance(id,visit_id,actor_id,event,within_radius,source)
      VALUES($1,$2,$3,'CHECK_IN',true,'MOBILE')`, [randomUUID(), visitId, carer.id]);
    const path = "/api/reports/audits?from=2026-09-25&to=2026-09-25&graceMinutes=5";
    const response = await request(app).get(path).set(headers);
    assert.equal(response.status, 200, JSON.stringify(response.body));
    const data = response.body.results.data;
    assert.equal(data.lateVisits.rows.length, 1);
    assert.equal(data.lateVisits.rows[0].checkInLateMinutes, 15);
    assert.equal(data.lateVisits.rows[0].checkOutLateMinutes, 20);
    assert.equal(data.safeguarding.rows.length, 1);
    assert.equal(data.medication.rows.length, 2);
    assert.deepEqual(new Set(data.medication.rows.map((row) => row.source)), new Set(["VISIT", "HISTORICAL"]));
    assert.equal((await request(app).get(path).set({ Authorization: `Bearer ${await token(carer)}` })).status, 403);
    const libraryPath = "/api/reports/library?from=2026-09-25&to=2026-09-25";
    const library = await request(app).get(libraryPath).set(headers);
    assert.equal(library.status, 200, JSON.stringify(library.body));
    assert.equal(library.body.results.data.visits.length, 1);
    assert.equal(library.body.results.data.visits[0].observations, 1);
    assert.equal(library.body.results.data.visits[0].verifiedEvents, 1);
    assert.equal(library.body.results.data.visits[0].medicationExceptions, 1);
    assert.deepEqual(library.body.results.data.groups, [{ name: "North team", staff: 1, visits: 1, completed: 1 }]);
    assert.equal((await request(app).get(libraryPath).set({ Authorization: `Bearer ${await token(carer)}` })).status, 403);
    const otherAgency = randomUUID();
    const superadmin = await repo.save("UserEntity", { agencyId: otherAgency, firstName: "Other", lastName: "Admin", email: "other-report-admin@example.test", role: "SUPERADMIN", isActive: true });
    const otherClient = await repo.save("UserEntity", { agencyId: otherAgency, firstName: "Other", lastName: "Client", email: "other-report-client@example.test", role: "USER", isActive: true });
    const otherCarer = await repo.save("UserEntity", { agencyId: otherAgency, firstName: "Other", lastName: "Carer", email: "other-report-carer@example.test", role: "CAREGIVER", isActive: true });
    await db.query("INSERT INTO node_team_groups(user_id,groups) VALUES($1,$2::jsonb)", [otherCarer.id, JSON.stringify(["South team"])]);
    await db.query(`INSERT INTO node_roster_visits(id,agency_id,client_id,staff_id,visit_date,start_time,end_time,title,status,created_by,updated_by)
      VALUES($1,$2,$3,$4,'2026-09-25','11:00','12:00','Other organisation visit','SCHEDULED',$5,$5)`, [randomUUID(), otherAgency, otherClient.id, otherCarer.id, superadmin.id]);
    const isolated = await request(app).get(libraryPath).set({ Authorization: `Bearer ${await token(superadmin)}` });
    assert.equal(isolated.status, 200, JSON.stringify(isolated.body));
    assert.deepEqual(isolated.body.results.data.visits.map((visit) => visit.clientId), [otherClient.id]);
    assert.deepEqual(isolated.body.results.data.groups.map((group) => group.name), ["South team"]);
    assert.deepEqual((await request(app).get(libraryPath).set(headers)).body.results.data.visits.map((visit) => visit.clientId), [client.id]);
    assert.deepEqual((await request(app).get(libraryPath).set(headers)).body.results.data.groups.map((group) => group.name), ["North team"]);
  } finally { await db.close(); }
});
