import { reply, fail } from "../http.js";
export function registerNotificationDelivery({ db, notifications }, route) {
  route("GET", "/api/inbox/notifications", async (req, res) => {
    const rows = (
      await db.query(
        `SELECT d.id,d.status,d.channel,d.attempts,d.error_code AS "errorCode",d.safe_retry AS "safeRetry",d.created_at AS "createdAt",d.updated_at AS "updatedAt",d.next_attempt_at AS "nextAttemptAt",e.entry_id AS "entryId",d.preference_key AS "alertType" FROM node_notification_deliveries d JOIN node_notification_events e ON e.id=d.event_id WHERE d.user_id=$1 AND d.agency_id=$2 ORDER BY d.created_at DESC,d.id LIMIT 50`,
        [req.user.id, req.user.agencyId],
      )
    ).rows;
    const history = rows.length
      ? (
          await db.query(
            `SELECT delivery_id AS "deliveryId",status,description,created_at AS "createdAt" FROM node_notification_history WHERE delivery_id=ANY($1::uuid[]) ORDER BY created_at DESC`,
            [rows.map((r) => r.id)],
          )
        ).rows
      : [];
    return reply(res, {
      channels: notifications.ready(),
      recipientEmail: req.user.email,
      deliveries: rows.map((r) => ({
        ...r,
        history: history.filter((h) => h.deliveryId === r.id),
      })),
    });
  });
  route("POST", "/api/inbox/notifications/:id/retry", async (req, res) => {
    const row = (
      await db.query(
        "SELECT * FROM node_notification_deliveries WHERE id=$1 AND user_id=$2 AND agency_id=$3 FOR UPDATE",
        [req.params.id, req.user.id, req.user.agencyId],
      )
    ).rows[0];
    if (!row) fail(404, "Delivery not found");
    if (row.status !== "FAILED" || !row.safe_retry || row.attempts >= 8)
      fail(409, "This delivery cannot be safely retried");
    if (!notifications.ready().enabled || !notifications.ready().email)
      fail(409, "Email delivery is unavailable");
    await db.query(
      `UPDATE node_notification_deliveries SET status='PENDING',next_attempt_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=$1`,
      [row.id],
    );
    await notifications.history(
      row.id,
      "PENDING",
      "Retry requested by the recipient; access and preferences will be rechecked",
    );
    return reply(res, {}, "Retry queued");
  });
}
