export function createNotificationTransport(config, mail) {
  const ready = { email: ["smtp", "resend"].includes(config.mailMode), sms: false };
  const error = (code, retryable = false) =>
    Object.assign(new Error(code), { code, retryable });
  return {
    ready,
    async send(channel, to, message, id) {
      if (!ready[channel]) throw error("CHANNEL_NOT_CONFIGURED");
      if (channel === "email") {
        try {
          const result = await mail.send({
            to,
            subject: "AniProTech: an alert needs your attention",
            text: message,
            messageId: `<${id}@notifications.aniprotech>`,
          });
          if (result.rejected?.length || !result.accepted?.length)
            throw error("SMTP_REJECTED");
          return { id: result.messageId || id, status: "ACCEPTED" };
        } catch (e) {
          if (e.code === "SMTP_REJECTED") throw e;
          if (e.code === "EAUTH" || e.responseCode >= 500)
            throw error("SMTP_REJECTED");
          // A lost acknowledgement after DATA may already have delivered a message.
          if (
            e.command === "CONN" ||
            e.command === "AUTH" ||
            e.command === "MAIL FROM" ||
            e.command === "RCPT TO" ||
            (e.responseCode >= 400 && e.responseCode < 500)
          )
            throw error(
              "SMTP_REJECTED",
              e.code !== "EAUTH" && e.responseCode !== 535,
            );
          throw error("SMTP_OUTCOME_UNKNOWN");
        }
      }
      throw error("SMS_DISABLED");
    },
  };
}
