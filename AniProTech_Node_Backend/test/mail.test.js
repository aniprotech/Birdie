import { test } from "node:test";
import assert from "node:assert/strict";
import { createMail } from "../src/mail.js";

test("Gmail API exchanges a refresh token and sends an RFC 2822 message", async () => {
  const previous = Object.fromEntries(
    ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GMAIL_REFRESH_TOKEN", "GMAIL_SENDER"].map(
      (key) => [key, process.env[key]],
    ),
  );
  const originalFetch = global.fetch;
  Object.assign(process.env, {
    GOOGLE_CLIENT_ID: "client-id",
    GOOGLE_CLIENT_SECRET: "client-secret",
    GMAIL_REFRESH_TOKEN: "refresh-token",
    GMAIL_SENDER: "info@example.test",
  });
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    if (String(url).includes("oauth2.googleapis.com"))
      return new Response(JSON.stringify({ access_token: "access-token" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    return new Response(JSON.stringify({ id: "gmail-message-id" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const mail = createMail({ production: true, mailMode: "gmail" });
    const result = await mail.send({
      to: "person@example.test",
      subject: "Login link",
      text: "Use this link",
    });
    assert.equal(result.messageId, "gmail-message-id");
    assert.equal(calls.length, 2);
    assert.match(calls[0].options.body.toString(), /grant_type=refresh_token/);
    const request = JSON.parse(calls[1].options.body);
    const decoded = Buffer.from(request.raw, "base64url").toString();
    assert.match(decoded, /From: info@example\.test/);
    assert.match(decoded, /To: person@example\.test/);
    assert.match(decoded, /Subject: Login link/);
  } finally {
    global.fetch = originalFetch;
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("Production refuses incomplete Gmail API configuration", () => {
  const previous = process.env.GMAIL_REFRESH_TOKEN;
  delete process.env.GMAIL_REFRESH_TOKEN;
  try {
    assert.throws(
      () => createMail({ production: true, mailMode: "gmail" }),
      /requires Gmail API email configuration/,
    );
  } finally {
    if (previous !== undefined) process.env.GMAIL_REFRESH_TOKEN = previous;
  }
});
