import { z } from "zod";
import { reply, fail } from "../http.js";

const decisionSchema = z.object({
  status: z.enum(["ACTIVE", "REJECTED", "SUSPENDED"]),
  notes: z.string().trim().max(2000).optional().default(""),
});

export function registerPlatformAdmin(ctx, route) {
  const { auth, db, mail } = ctx;

  route("GET", "/api/platform/organisations", async (req, res) => {
    auth.platformAdmin(req);
    const status = String(req.query.status || "").toUpperCase();
    if (status && !["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"].includes(status)) fail(400, "Invalid organisation status");
    const values = status ? [status] : [];
    const rows = (await db.query(`SELECT a.id,a.name,a.legal_name,a.business_type,a.registration_number,a.phone,a.website,
      a.address_line1,a.address_line2,a.state,a.city,a.postcode,a.country,a.timezone,a.status,a.submitted_at,a.created_at,
      a.reviewed_at,a.review_notes,u.id AS owner_id,u.first_name,u.last_name,u.email,u.primary_phone
      FROM node_agencies a LEFT JOIN users u ON u.agency_id=a.id AND u.role='SUPERADMIN' AND u.deleted_at IS NULL
      ${status ? "WHERE a.status=$1" : ""} ORDER BY CASE a.status WHEN 'PENDING' THEN 0 ELSE 1 END,a.created_at DESC`, values)).rows;
    const counts = Object.fromEntries((await db.query("SELECT status,count(*)::int AS count FROM node_agencies GROUP BY status")).rows.map((row) => [row.status, row.count]));
    return reply(res, { organisations: rows, counts });
  });

  route("PUT", "/api/platform/organisations/:id/status", async (req, res) => {
    auth.platformAdmin(req);
    const parsed = decisionSchema.safeParse(req.body);
    if (!parsed.success) fail(400, parsed.error.issues[0]?.message || "Invalid review decision");
    const current = (await db.query("SELECT id,name,status FROM node_agencies WHERE id=$1 FOR UPDATE", [req.params.id])).rows[0];
    if (!current) fail(404, "Organisation not found");
    const owner = (await db.query("SELECT id,email,first_name FROM users WHERE agency_id=$1 AND role='SUPERADMIN' AND deleted_at IS NULL ORDER BY created_at LIMIT 1", [current.id])).rows[0];
    if (!owner) fail(409, "Organisation owner not found");
    const { status, notes } = parsed.data;
    await db.query("UPDATE node_agencies SET status=$1,reviewed_at=CURRENT_TIMESTAMP,reviewed_by=$2,review_notes=$3,updated_at=CURRENT_TIMESTAMP WHERE id=$4", [status, req.user.id, notes || null, current.id]);
    await db.query("UPDATE users SET is_active=$1,updated_by=$2,updated_at=CURRENT_TIMESTAMP WHERE agency_id=$3", [status === "ACTIVE", req.user.id, current.id]);
    req.afterCommit.push(async () => {
      if (status === "ACTIVE") {
        const login = await auth.createLoginLink(owner.email);
        await mail.send({ to: owner.email, subject: "Your business has been approved", text: `Hello ${owner.first_name},\n\n${current.name} is approved and ready to use. Your secure sign-in link expires in 15 minutes.`, actionUrl: login?.link?.toString(), actionLabel: "Open your Caremonitor dashboard" });
      } else {
        await mail.send({ to: owner.email, subject: status === "SUSPENDED" ? "Organisation access suspended" : "Business application update", text: `Hello ${owner.first_name},\n\nThe status of ${current.name} is now ${status.toLowerCase()}.${notes ? `\n\nReview notes: ${notes}` : ""}\n\nContact Caremonitor support if you need help.` });
      }
    });
    return reply(res, { id: current.id, status, reviewedAt: new Date().toISOString() }, `Organisation ${status.toLowerCase()}`);
  });
}
