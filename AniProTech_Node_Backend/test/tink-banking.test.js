import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { openDatabase, initializeSchema } from "../src/db.js";
import { createApp } from "../src/app.js";

test("Tink consent imports only the starting organisation's bank snapshot and rejects replay", async () => {
  const db = await openDatabase({ driver: "pglite", dataDir: ":memory:" });
  const originalFetch = global.fetch;
  try {
    await initializeSchema(db);
    const sent = [], agencyA = randomUUID(), agencyB = randomUUID();
    for (const id of [agencyA, agencyB]) await db.query(`INSERT INTO node_agencies
      (id,name,business_type,phone,address_line1,city,postcode,country,timezone,terms_accepted_at)
      VALUES($1,'Test care','HOME_CARE','01234567890','1 Road','London','SW1A 1AA','United Kingdom','Europe/London',CURRENT_TIMESTAMP)`, [id]);
    const app = createApp({ db, config: { production: false,
      jwtSecret: "tink-test-secret-at-least-32-characters", frontendUrl: "http://localhost:5173",
      corsOrigins: [], uploadDir: "./test-uploads", tinkClientId: "sandbox-client",
      tinkClientSecret: "test-secret", tinkBankingEnabled: true,
      tinkRedirectUri: "http://localhost:9000/api/accounting/banking/tink/callback",
    }, mail: { send: async (message) => sent.push(message) } });
    const { repo, auth } = app.locals.ctx;
    async function login(name, agencyId) {
      const user = await repo.save("UserEntity", { firstName: name, lastName: "Owner",
        email: `${name}@test.example`, role: "SUPERADMIN", isActive: true, agencyId });
      await auth.requestLink(user.email);
      const url = sent.at(-1).text.match(/http[^\s]+/)[0];
      const [email, password] = Buffer.from(new URL(url).searchParams.get("token"), "base64url").toString().split(":");
      return (await auth.exchange(email, password)).accessToken;
    }
    const tokenA = await login("ownerA", agencyA), tokenB = await login("ownerB", agencyB);
    const begin = await request(app).post("/api/accounting/banking/tink/start")
      .set("Authorization", `Bearer ${tokenA}`).send({});
    assert.equal(begin.status, 200);
    const link = new URL(begin.body.results.data.url);
    assert.equal(link.hostname, "link.tink.com");
    assert.equal(link.searchParams.get("market"), "GB");
    const state = link.searchParams.get("state");
    assert.ok(state);
    global.fetch = async (url) => {
      if (String(url).endsWith("/oauth/token")) return Response.json({ access_token: "test-user-token" });
      if (String(url).endsWith("/accounts")) return Response.json({ accounts: [{ id: "bank-1", name: "Business current", currencyCode: "GBP", type: "CHECKING", accountNumber: "12345678" }] });
      if (String(url).includes("/transactions")) return Response.json({ transactions: [{ id: "tx-1", accountId: "bank-1", bookedDate: "2026-09-25", description: "Invoice payment", amount: { value: 42.15, currencyCode: "GBP" } }] });
      throw new Error("Unexpected provider URL");
    };
    const callback = await request(app).get("/api/accounting/banking/tink/callback").query({ state, code: "one-time-code" });
    assert.equal(callback.status, 303);
    assert.match(callback.headers.location, /bank=connected/);
    const own = await request(app).get("/api/accounting/banking").set("Authorization", `Bearer ${tokenA}`);
    const other = await request(app).get("/api/accounting/banking").set("Authorization", `Bearer ${tokenB}`);
    assert.equal(own.body.results.data.accounts.length, 1);
    assert.equal(Number(own.body.results.data.transactions[0].amountPence), 4215);
    assert.equal(other.body.results.data.accounts.length, 0);
    assert.equal(other.body.results.data.transactions.length, 0);
    const replay = await request(app).get("/api/accounting/banking/tink/callback").query({ state, code: "one-time-code" });
    assert.match(replay.headers.location, /bank=failed/);
  } finally { global.fetch = originalFetch; await db.close(); }
});
