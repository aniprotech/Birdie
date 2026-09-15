export function createNotificationTransport(config, mail) {
  const ready = { email: config.mailMode === "gmail", sms: false };
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
            throw error("EMAIL_REJECTED");
          return { id: result.messageId || id, status: "ACCEPTED" };
        } catch (e) {
          if (e.code === "EMAIL_REJECTED") throw e;
          if (e.code === "EMAIL_DELIVERY_FAILED")
            throw error("EMAIL_REJECTED", Boolean(e.retryable));
          throw error("EMAIL_OUTCOME_UNKNOWN");
        }
      }
      throw error("SMS_DISABLED");
    },
  };
}
