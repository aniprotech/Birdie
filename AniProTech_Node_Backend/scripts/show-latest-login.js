import fs from "node:fs/promises";
import path from "node:path";
import { configuration } from "../src/config.js";
const config = configuration();
if (config.production || config.mailMode !== "outbox")
  throw new Error("Only available with the local development outbox.");
const names = (await fs.readdir(config.outboxDir))
  .filter((n) => n.endsWith(".json"))
  .sort()
  .reverse();
let link;
for (const name of names) {
  const message = JSON.parse(
    await fs.readFile(path.join(config.outboxDir, name), "utf8"),
  );
  if (message.subject === "Your AniProTech login link") {
    link = message.text.match(/http[^\s]+/)?.[0];
    break;
  }
}
if (!link) throw new Error("Request a login link on the frontend first.");
const escaped = link.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
await fs.writeFile(
  path.join(config.outboxDir, "latest-login.html"),
  `<!doctype html><html><head><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>AniProTech local login</title></head><body style="font:18px system-ui;max-width:600px;margin:80px auto"><h1>Local demo login</h1><p>This link expires after 15 minutes and works once.</p><a href="${escaped}">Continue to AniProTech</a></body></html>`,
  { mode: 0o600 },
);
console.log("Open outbox/latest-login.html to continue. No email was sent.");
