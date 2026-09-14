import { randomUUID } from "node:crypto";
import { createNotificationTransport } from "./notification-transport.js";
export const notificationKeys = [
  "Severe",
  "Medium",
  "Low",
  "Medication not taken",
  "Medication partially taken",
  "No medication report received",
  "Visit not started in time",
  "Visit plan not completed",
  "Care professional did not check in to visit on time",
  "Third party access requested",
  "Forced check-in or check-out",
  "Coronavirus symptoms",
  "Other alerts",
];
export function classifyNotification(entry) {
  const normal = (v) =>
    (v || "").toLowerCase().replaceAll("-", " ").replace(/\s+/g, " ").trim();
  for (const value of [entry.category, entry.title]) {
    const key = notificationKeys.find((k) => normal(k) === normal(value));
    if (key) return key;
    if (["forced check in", "forced check out"].includes(normal(value)))
      return "Forced check-in or check-out";
    if (
      ["covid 19 symptoms reported", "coronavirus symptoms reported"].includes(
        normal(value),
      )
    )
      return "Coronavirus symptoms";
    if (
      ["accident", "incident", "skin integrity", "concern", "other"].includes(
        normal(value),
      )
    )
      return ["HIGH", "CRITICAL"].includes(entry.severity)
        ? "Severe"
        : entry.severity === "MEDIUM"
          ? "Medium"
          : entry.severity === "LOW"
            ? "Low"
            : "Other alerts";
  }
  return "Other alerts";
}
export function createInboxNotifications(
  { db, repo, config, mail },
  transport = createNotificationTransport(config, mail),
) {
  let running = false,
    stopping = false;
  const enabled = () => config.inboxNotificationsEnabled === true;
  const history = (id, status, description) =>
    db.query(
      "INSERT INTO node_notification_history(id,delivery_id,status,description) VALUES($1,$2,$3,$4)",
      [randomUUID(), id, status, description],
    );
  async function entry(id) {
    return (
      await db.query(
        `SELECT e.*,COALESCE(m.severity,'UNDEFINED') severity,m.assigned_to,v.staff_id,c.deleted_at AS client_deleted,c.agency_id AS client_agency FROM node_client_entries e JOIN users c ON c.id=e.client_id LEFT JOIN node_inbox_details m ON m.entry_id=e.id LEFT JOIN node_roster_visits v ON v.id=e.visit_id WHERE e.id=$1`,
        [id],
      )
    ).rows[0];
  }
  async function currentEvent(event) {
    const latest=(await db.query("SELECT id FROM node_notification_events WHERE entry_id=$1 ORDER BY created_at DESC,split_part(id,':',2)::integer DESC LIMIT 1",[event.entry_id])).rows[0];
    return latest?.id===event.id;
  }
  async function canRead(e, user) {
    if (
      !e ||
      e.client_deleted ||
      !user ||
      user.deletedAt ||
      !user.isActive ||
      e.agency_id !== user.agencyId ||
      e.client_agency !== user.agencyId
    )
      return false;
    if (["ADMIN", "SUPERADMIN"].includes(user.role)) return true;
    if (
      user.role !== "CAREGIVER" ||
      (e.created_by !== user.id && e.assigned_to !== user.id) ||
      (e.visit_id && e.staff_id !== user.id)
    )
      return false;
    const link = await repo.one("ClientCareTeamEntity", {
      client: e.client_id,
      carer: user.id,
    });
    return Boolean(
      link &&
        !link.deletedAt &&
        link.viewAccess &&
        !link.revokeViewaccess &&
        !link.declineCarer,
    );
  }
  async function expand() {
    return db.transaction(async () => {
      const events = (
        await db.query(
          "SELECT * FROM node_notification_events WHERE expanded_at IS NULL ORDER BY created_at,id LIMIT 25 FOR UPDATE SKIP LOCKED",
        )
      ).rows;
      for (const event of events) {
        const e = await entry(event.entry_id),
          key = e && classifyNotification(e);
        if (
          key && (await currentEvent(event)) &&
          e.status === "OPEN" &&
          Date.now() - new Date(event.created_at) < 86400000
        ) {
          const subscribers = (
            await db.query(
              `SELECT * FROM node_inbox_preferences WHERE agency_id=$1 AND preferences->>'deliveryEnabled'='true' AND notifications_since<=$2`,
              [event.agency_id, event.created_at],
            )
          ).rows;
          for (const sub of subscribers) {
            if (!sub.preferences.notifications?.[key]?.email) continue;
            const user = await repo.get("UserEntity", sub.user_id, {
              collections: false,
            });
            if (!(await canRead(e, user))) continue;
            const id = randomUUID();
            const inserted = await db.query(
              `INSERT INTO node_notification_deliveries(id,event_id,user_id,agency_id,channel,preference_key) VALUES($1,$2,$3,$4,'email',$5) ON CONFLICT(event_id,user_id,channel) DO NOTHING RETURNING id`,
              [id, event.id, user.id, event.agency_id, key],
            );
            if (inserted.rows.length)
              await history(id, "PENDING", "Email queued");
          }
        }
        await db.query(
          "UPDATE node_notification_events SET expanded_at=CURRENT_TIMESTAMP WHERE id=$1",
          [event.id],
        );
      }
    });
  }
  async function finish(
    id,
    status,
    description,
    { code = null, retry = false, next = null, provider = null } = {},
  ) {
    await db.transaction(async () => {
      await db.query(
        `UPDATE node_notification_deliveries SET status=$2,error_code=$3,safe_retry=$4,next_attempt_at=COALESCE($5::timestamptz,next_attempt_at),provider_id=COALESCE($6,provider_id),lease_until=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=$1`,
        [id, status, code, retry, next, provider],
      );
      await history(id, status, description);
    });
  }
  async function deliver() {
    // A worker lost after sending may have been accepted by SMTP. Never resend blindly.
    await db.transaction(async () => {
      const stale = (
        await db.query(
          `UPDATE node_notification_deliveries SET status='UNKNOWN',error_code='WORKER_INTERRUPTED',safe_retry=false,updated_at=CURRENT_TIMESTAMP WHERE status='PROCESSING' AND lease_until<CURRENT_TIMESTAMP RETURNING id`,
        )
      ).rows;
      for (const row of stale)
        await history(
          row.id,
          "UNKNOWN",
          "Worker interrupted; verify provider records before any resend",
        );
    });
    for (let n = 0; n < 10 && !stopping; n++) {
      const job = await db.transaction(async () => {
        const row = (
          await db.query(
            `SELECT * FROM node_notification_deliveries WHERE status='PENDING' AND next_attempt_at<=CURRENT_TIMESTAMP ORDER BY next_attempt_at,id LIMIT 1 FOR UPDATE SKIP LOCKED`,
          )
        ).rows[0];
        if (!row) return null;
        await db.query(
          `UPDATE node_notification_deliveries SET status='PROCESSING',attempts=attempts+1,lease_until=CURRENT_TIMESTAMP+INTERVAL '5 minutes',updated_at=CURRENT_TIMESTAMP WHERE id=$1`,
          [row.id],
        );
        return { ...row, attempts: row.attempts + 1 };
      });
      if (!job) break;
      const event = (
          await db.query("SELECT * FROM node_notification_events WHERE id=$1", [
            job.event_id,
          ])
        ).rows[0],
        e = await entry(event.entry_id);
      const user = await repo.get("UserEntity", job.user_id, {
        collections: false,
      });
      const pref = (
        await db.query(
          "SELECT * FROM node_inbox_preferences WHERE user_id=$1 AND agency_id=$2",
          [job.user_id, job.agency_id],
        )
      ).rows[0];
      if (
        !(await currentEvent(event)) || !(await canRead(e, user)) ||
        e.status !== "OPEN" ||
        !pref?.preferences.deliveryEnabled ||
        !pref.preferences.notifications?.[job.preference_key]?.email ||
        new Date(pref.notifications_since) > new Date(event.created_at) ||
        Date.now() - new Date(event.created_at) > 86400000
      ) {
        await finish(
          job.id,
          "CANCELLED",
          "No longer eligible, preferences changed, resolved, or expired",
        );
        continue;
      }
      if (!transport.ready.email) {
        await finish(job.id, "FAILED", "Email transport is not configured", {
          code: "CHANNEL_NOT_CONFIGURED",
          retry: true,
        });
        continue;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email || "")) {
        await finish(
          job.id,
          "FAILED",
          "Account email address needs correction",
          { code: "EMAIL_INVALID", retry: true },
        );
        continue;
      }
      const link = new URL("/admin/inbox", config.frontendUrl);
      link.searchParams.set("item", e.id);
      const message = `A new or reopened alert needs your attention in AniProTech. Sign in to view its details:\n${link}\n\nManage your email preferences in Inbox > Settings.`;
      try {
        const result = await transport.send(
          "email",
          user.email,
          message,
          job.id,
        );
        await finish(
          job.id,
          "ACCEPTED",
          "Accepted by the email provider; recipient delivery is not confirmed",
          { provider: result.id },
        );
      } catch (error) {
        const unknown =
          String(error.code || "").endsWith("UNKNOWN") ||
          error.retryable === undefined;
        const retry = !unknown && error.retryable === true;
        const code = /^[A-Z_]{1,60}$/.test(error.code || "")
          ? error.code
          : "DELIVERY_OUTCOME_UNKNOWN";
        if (retry && job.attempts < 5)
          await finish(
            job.id,
            "PENDING",
            "Temporary rejection; retry scheduled",
            {
              code,
              retry: true,
              next: new Date(
                Date.now() + 60000 * 2 ** (job.attempts - 1),
              ).toISOString(),
            },
          );
        else
          await finish(
            job.id,
            unknown ? "UNKNOWN" : "FAILED",
            unknown
              ? "Outcome uncertain; automatic resend blocked"
              : "Email rejected; review the delivery status",
            { code, retry },
          );
      }
    }
  }
  async function tick() {
    if (running || stopping || !enabled()) return;
    running = true;
    try {
      await expand();
      await deliver();
    } finally {
      running = false;
    }
  }
  return {
    tick,
    canRead,
    history,
    ready: () => ({
      enabled: enabled(),
      email: transport.ready.email,
      sms: false,
    }),
    start() {
      const timer = setInterval(
        () =>
          tick().catch(() =>
            console.error(
              "Inbox notification worker failed; pending work retained",
            ),
          ),
        15000,
      );
      timer.unref();
      tick().catch(() =>
        console.error(
          "Inbox notification worker failed; pending work retained",
        ),
      );
      return async () => {
        stopping = true;
        clearInterval(timer);
        while (running)
          await new Promise((resolve) => setTimeout(resolve, 100));
      };
    },
  };
}
