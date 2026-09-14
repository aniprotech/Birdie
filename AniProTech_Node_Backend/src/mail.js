import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
export function createMail(config) {
  const resendKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM || process.env.SMTP_FROM;
  const transport =
    config.mailMode === "smtp"
      ? nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === "true",
          connectionTimeout: 20000,
          greetingTimeout: 20000,
          socketTimeout: 60000,
          auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
            : undefined,
        })
      : null;
  const usesResend = config.mailMode === "resend";
  if (config.production && !transport && !(usesResend && resendKey && resendFrom))
    throw new Error("Production requires a configured email provider.");
  return {
    verify: async () => transport ? transport.verify() : Boolean(usesResend && resendKey && resendFrom),
    async send(message) {
      if (transport)
        return transport.sendMail({ from: process.env.SMTP_FROM, ...message });
      if (usesResend) {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ from: resendFrom, ...message }),
        });
        if (!response.ok) {
          const error = new Error("Transactional email provider rejected the request");
          error.code = "EMAIL_DELIVERY_FAILED";
          throw error;
        }
        return response.json();
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
