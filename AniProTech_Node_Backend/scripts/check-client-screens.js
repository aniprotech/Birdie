import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { configuration } from "../src/config.js";
import { openDatabase } from "../src/db.js";
import { Repository } from "../src/repository.js";
import { createAuth } from "../src/auth.js";
const require = createRequire(import.meta.url);
const {
  chromium,
} = require("C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const config = configuration(),
  db = await openDatabase(config),
  repo = new Repository(db);
let browser, token, page;
try {
  let mail;
  const auth = createAuth({
    db,
    repo,
    config,
    mail: { send: async (m) => (mail = m) },
  });
  const admin = await repo.one("UserEntity", { email: "info@aniprotech.com" });
  const dummy = await repo.one("UserEntity", {
    email: "dummy.client@example.test",
  });
  assert.ok(dummy, "Dummy client is required");
  assert.equal(dummy.agencyId, admin.agencyId);
  await auth.requestLink(admin.email);
  const url = mail.text.match(/http[^\s]+/)[0];
  const [email, password] = Buffer.from(
    new URL(url).searchParams.get("token"),
    "base64url",
  )
    .toString()
    .split(":");
  const response = await fetch("http://127.0.0.1:8080/api/auth/get-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(response.status, 200);
  token = (await response.json()).results.data.accessToken;
  const api = async (method, path, body) => {
    const r = await fetch("http://127.0.0.1:8080" + path, {
      method,
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await r.json();
    assert.ok(r.ok, data.message);
    return data.results.data;
  };
  const base = `/api/clients/${dummy.id}`;
  let visit = (
    await db.query(
      "SELECT id FROM node_roster_visits WHERE client_id=$1 AND title=$2",
      [dummy.id, "DUMMY TEST — client feed preview"],
    )
  ).rows[0];
  if (!visit) {
    visit = (
      await api("POST", "/api/roster/visits", {
        clientId: dummy.id,
        staffId: null,
        date: "2026-09-08",
        startTime: "21:00",
        endTime: "22:00",
        title: "DUMMY TEST — client feed preview",
        notes:
          "Fictional preview only. Not a care instruction or a billable visit.",
        status: "DRAFT",
      })
    ).visits[0];
  }
  const detail = await api("GET", `${base}/visits/${visit.id}`);
  for (const [kind, status, title, body] of [
    [
      "NOTE",
      "RECORDED",
      "DUMMY TEST — general note",
      "Fictional demonstration note. This is not a real care record.",
    ],
    [
      "ALERT",
      "OPEN",
      "DUMMY TEST — review required",
      "Demonstration alert. No real concern is being reported.",
    ],
    [
      "ACTION",
      "OPEN",
      "DUMMY TEST — follow-up",
      "Demonstration action for checking the client feed.",
    ],
    [
      "ACTIVITY",
      "PENDING",
      "DUMMY TEST — sample activity",
      "Demonstration activity; no care has been delivered.",
    ],
    [
      "OBSERVATION",
      "RECORDED",
      "DUMMY TEST — sample observation",
      "Fictional observation for screen testing only.",
    ],
  ])
    if (!detail.entries.some((e) => e.title === title))
      await api("POST", base + "/entries", {
        kind,
        status,
        title,
        body,
        category: "Demonstration only",
        visitId: visit.id,
      });
  const feed = await api("GET", base + "/feed");
  assert.ok(feed.items.some((i) => i.id === visit.id));
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
      viewport: { width: 1600, height: 1000 },
    }),
    screenPage = await context.newPage();
  page = screenPage;
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // Use a separate browser session and captured local login link; send no email.
  await auth.requestLink(admin.email);
  const loginUrl = mail.text.match(/http[^\s]+/)[0];
  await page.goto(loginUrl);
  await page.waitForURL("**/admin/**", { timeout: 30000 });
  mkdirSync("../client-screen-checks", { recursive: true });
  if (!process.argv.includes("--visits-only")) {
    await page.goto(
      `http://127.0.0.1:5173/admin/clients/${dummy.id}/basic-info`,
    );
    await page
      .getByRole("heading", { name: "Personal details", exact: true })
      .waitFor();
    await page.screenshot({
      path: "../client-screen-checks/basic-information.png",
      fullPage: true,
    });
    await page.goto(
      `http://127.0.0.1:5173/admin/clients/${dummy.id}/basic-info/edit`,
    );
    await page
      .getByRole("heading", { name: "Edit client", exact: true })
      .waitFor();
    assert.equal(
      await page.getByLabel("First name *", { exact: true }).inputValue(),
      "Dummy",
    );
    await page.getByLabel("Middle name", { exact: true }).fill("Preview");
    await page
      .getByRole("textbox", {
        name: "Highlights and past history",
        exact: true,
      })
      .fill(
        "DUMMY TEST RECORD ONLY. Not a real person.\n\nPast history: fictional background for demonstrating multi-line highlights.\n\nPreferences: fictional demonstration only.",
      );
    await page
      .getByRole("button", { name: "Save client", exact: true })
      .click();
    await page.waitForURL("**/basic-info");
    await page.getByText("Preview", { exact: true }).waitFor();
    console.log(
      "Browser: direct edit URL loads; middle name and multiline highlights save and display.",
    );
    await page.goto(
      `http://127.0.0.1:5173/admin/clients/${dummy.id}/client-info`,
    );
    await page
      .getByRole("button", { name: "Agency Admin", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Identifiers", exact: true })
      .waitFor();
    const identifiers = page
      .locator("section")
      .filter({
        has: page.getByRole("heading", { name: "Identifiers", exact: true }),
      });
    await identifiers.getByRole("button").first().click();
    await identifiers
      .getByLabel("Client identifier", { exact: true })
      .fill("DUMMY-001");
    await identifiers
      .getByRole("button", { name: "Save identifiers", exact: true })
      .click();
    await identifiers.getByText("DUMMY-001", { exact: true }).waitFor();
    console.log("Browser: client identifiers save successfully.");
    await page.screenshot({
      path: "../client-screen-checks/client-information.png",
      fullPage: true,
    });
  }
  await page.goto(
    `http://127.0.0.1:5173/admin/clients/${dummy.id}/client-feed`,
  );
  await page.screenshot({
    path: "../client-screen-checks/feed-before-selection.png",
    fullPage: true,
  });
  const panel = page.getByRole("region", { name: "Selected record details" });
  const visitsToCheck = feed.items.filter((item) => item.kind === "VISIT");
  assert.ok(
    visitsToCheck.length >= 2,
    "At least two existing dummy visits are needed to verify switching",
  );
  for (const item of visitsToCheck) {
    await page.locator(`[data-record-id="${item.id}"]`).click();
    await page.locator(`#client-selected-record[data-visit-id="${item.id}"]`).waitFor();
    await panel
      .getByRole("heading", { name: item.title, exact: true })
      .waitFor();
    assert.ok((await panel.innerText()).includes(item.date));
    for (const heading of [
      "Planned",
      "Client location",
      "Alerts",
      "Care team",
      "Check in",
      "Check out",
    ])
      await panel
        .getByRole("heading", { name: heading, exact: true })
        .waitFor();
    const expected = await api("GET", `${base}/visits/${item.id}`);
    await panel
      .getByRole("navigation", { name: "Visit tabs" })
      .getByRole("button", { name: "Observations", exact: true })
      .click();
    for (const entry of expected.entries.filter((e) =>
      ["NOTE", "OBSERVATION"].includes(e.kind),
    ))
      await panel
        .getByRole("heading", { name: entry.title, exact: true })
        .waitFor();
    if (!expected.entries.some((e) => e.kind === "OBSERVATION"))
      await panel
        .getByText("No observations recorded for this visit.", { exact: true })
        .waitFor();
  }
  const first = visitsToCheck[0],
    last = visitsToCheck.at(-1);
  await page.route("**/api/clients/*/visits/*", async (route) => {
    if (route.request().url().endsWith(first.id))
      await new Promise((resolve) => setTimeout(resolve, 800));
    await route.continue().catch(() => {});
  });
  await page.locator(`[data-record-id="${first.id}"]`).click();
  await page.locator(`[data-record-id="${last.id}"]`).click();
  await page.locator(`#client-selected-record[data-visit-id="${last.id}"]`).waitFor();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  assert.equal(await panel.getAttribute("data-visit-id"), last.id);
  await page.unroute("**/api/clients/*/visits/*");
  await page.route("**/api/clients/*/visits/*", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ message: "Temporary test outage" }),
    }),
  );
  await page.locator(`[data-record-id="${first.id}"]`).click();
  await panel.getByRole("button", { name: "Retry loading details" }).waitFor();
  assert.equal(await panel.getAttribute("data-visit-id"), "");
  await page.unroute("**/api/clients/*/visits/*");
  await panel.getByRole("button", { name: "Retry loading details" }).click();
  await page.locator(`#client-selected-record[data-visit-id="${first.id}"]`).waitFor();
  console.log(
    `Browser: ${visitsToCheck.length} visits show their own dates, dashboard cards and observations; rapid switching and failed-load retry passed.`,
  );
  await page
    .getByRole("button")
    .filter({ hasText: "DUMMY TEST — client feed preview" })
    .click();
  for (const tab of [
    "Details",
    "Alerts",
    "Activities",
    "Observations",
    "Care team",
    "Timeline",
  ]) {
    await page
      .getByRole("navigation", { name: "Visit tabs" })
      .getByRole("button", { name: tab, exact: true })
      .click();
    await page.screenshot({
      path: `../client-screen-checks/feed-${tab.toLowerCase().replaceAll(" ", "-")}.png`,
      fullPage: true,
    });
  }
  await page
    .getByRole("navigation", { name: "Visit tabs" })
    .getByRole("button", { name: "Observations", exact: true })
    .click();
  await page.getByRole("button", { name: "See history" }).first().click();
  await page.getByRole("heading", { name: "Record history" }).waitFor();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("combobox", { name: "Client section", exact: true })
    .waitFor();
  console.log(
    "Mobile layout width:",
    await page.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
    })),
  );

  await page.screenshot({
    path: "../client-screen-checks/feed-mobile.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "Browser: all six visit tabs, note history and narrow-screen layout loaded without JavaScript errors.",
  );
  // Revoke only sessions created by this verification, leaving the user logged in.
  const browserToken = await page.evaluate(async () => {
    const { decryptData } = await import("/src/utils/cryptoHelpers.js");
    return decryptData(localStorage.getItem("access_token"));
  });
  if (browserToken)
    await fetch("http://127.0.0.1:8080/api/auth/logout", {
      method: "POST",
      headers: { Authorization: "Bearer " + browserToken },
    });
  console.log(
    "Live PostgreSQL: dummy draft visit and clearly labelled demonstration entries retained for review.",
  );
} catch (error) {
  if (page) {
    await page
      .screenshot({
        path: "../client-screen-checks/failure.png",
        fullPage: true,
      })
      .catch(() => {});
    console.log(
      "Browser diagnostic:",
      (
        await page
          .locator("body")
          .innerText()
          .catch(() => "")
      ).slice(0, 5000),
    );
  }
  if(page)console.log("Panel selection:",await page.locator(".cf-detail").evaluate(el=>({id:el.id,visit:el.getAttribute("data-visit-id")})));
  throw error;
} finally {
  if (page) {
    try {
      const bt = await page.evaluate(async () => {
        const { decryptData } = await import("/src/utils/cryptoHelpers.js");
        const value = localStorage.getItem("access_token");
        return value ? decryptData(value) : null;
      });
      if (bt)
        await fetch("http://127.0.0.1:8080/api/auth/logout", {
          method: "POST",
          headers: { Authorization: "Bearer " + bt },
        });
    } catch {}
  }
  await browser?.close();
  if (token)
    await fetch("http://127.0.0.1:8080/api/auth/logout", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
    });
  await db.close();
}
