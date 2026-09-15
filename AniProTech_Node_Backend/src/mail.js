import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const encodeHeader = (value) =>
  /[^\x20-\x7e]/.test(value)
    ? `=?UTF-8?B?${Buffer.from(value).toString("base64")}?=`
    : value;

const gmailError = (message, status) => {
  const error = new Error(message);
  error.code = "EMAIL_DELIVERY_FAILED";
  error.status = status;
  error.retryable = status === 429 || status >= 500;
  return error;
};

function gmailMessage({ from, to, subject, text, messageId }) {
  const recipients = Array.isArray(to) ? to.join(", ") : to;
  const headers = [
    `From: ${from}`,
    `To: ${recipients}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
  ];
  if (messageId) headers.push(`Message-ID: ${messageId}`);
  return Buffer.from(
    `${headers.join("\r\n")}\r\n\r\n${Buffer.from(text).toString("base64")}`,
  ).toString("base64url");
}

export function createMail(config) {
  const gmail = {
    clientId: process.env.GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
    clientSecret:
      process.env.GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    sender: process.env.GMAIL_SENDER,
  };
  const usesGmail = config.mailMode === "gmail";
  const configured = Object.values(gmail).every(Boolean);
  if (config.production && !(usesGmail && configured))
    throw new Error("Production requires Gmail API email configuration.");

  async function accessToken() {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: gmail.clientId,
        client_secret: gmail.clientSecret,
        refresh_token: gmail.refreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (!response.ok)
      throw gmailError("Gmail authorization failed", response.status);
    const result = await response.json();
    if (!result.access_token)
      throw gmailError("Gmail authorization returned no access token", 502);
    return result.access_token;
  }

  return {
    verify: async () => !usesGmail || configured,
    async send(message) {
      if (usesGmail) {
        const token = await accessToken();
        const response = await fetch(
          "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              raw: gmailMessage({ from: gmail.sender, ...message }),
            }),
          },
        );
        if (!response.ok)
          throw gmailError("Gmail API rejected the email", response.status);
        const result = await response.json();
        return {
          id: result.id,
          messageId: result.id,
          accepted: Array.isArray(message.to) ? message.to : [message.to],
          rejected: [],
        };
      }
      await fs.mkdir(config.outboxDir, { recursive: true, mode: 0o700 });
      await fs.writeFile(
        path.join(config.outboxDir, `${Date.now()}-${randomUUID()}.json`),
        JSON.stringify(message, null, 2),
        { mode: 0o600 },
      );
    },
  };
}
