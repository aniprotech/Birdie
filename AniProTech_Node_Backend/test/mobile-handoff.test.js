import assert from "node:assert/strict";
import test from "node:test";
import { createAuth } from "../src/auth.js";

test("mobile sign-in email opens the HTTPS handoff while web sign-in stays on the web", async () => {
  const sent = [];
  const user = {
    id: "00000000-0000-4000-8000-000000000001",
    email: "carer@example.test",
    role: "CAREGIVER",
    isActive: true,
    agencyId: null,
  };
  const db = {
    async query(sql) {
      if (sql.startsWith("SELECT id FROM users")) return { rows: [{ id: user.id }] };
      if (sql.startsWith("INSERT INTO node_login_links")) return { rows: [] };
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const auth = createAuth({
    db,
    repo: { get: async () => user },
    config: { frontendUrl: "https://caremonitor.example.test" },
    mail: { send: async (message) => sent.push(message) },
  });

  await auth.requestLink(user.email, { mobile: true });
  const mobile = new URL(sent[0].actionUrl);
  assert.equal(mobile.origin, "https://caremonitor.example.test");
  assert.equal(mobile.pathname, "/mobile-sign-in.html");
  assert.ok(new URLSearchParams(mobile.hash.slice(1)).get("token"));
  assert.ok(sent[0].text.includes(sent[0].actionUrl));
  assert.ok(!sent[0].actionUrl.startsWith("aniprotech:"));

  await auth.requestLink(user.email);
  const web = new URL(sent[1].actionUrl);
  assert.equal(web.pathname, "/login");
  assert.ok(web.searchParams.get("token"));
});
