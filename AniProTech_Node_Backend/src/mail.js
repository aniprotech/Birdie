import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
export function createMail(config) {
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
  if (config.production && !transport)
    throw new Error("Production requires MAIL_MODE=smtp.");
  return {
    verify: async () => transport ? transport.verify() : false,
    async send(message) {
      if (transport)
        return transport.sendMail({ from: process.env.SMTP_FROM, ...message });
      await fs.mkdir(config.outboxDir, { recursive: true, mode: 0o700 });
      await fs.writeFile(
        path.join(config.outboxDir, `${Date.now()}-${randomUUID()}.json`),
        JSON.stringify(message, null, 2),
        { mode: 0o600 },
      );
    },
  };
}
