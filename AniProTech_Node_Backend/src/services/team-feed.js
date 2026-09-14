import { randomUUID } from "node:crypto";
import { z } from "zod";
import { reply, fail } from "../http.js";
export function registerTeamFeed({ db, auth }, route) {
  route("GET", "/api/team/:id/groups", async (req, res) => {
    await auth.userAccess(req, req.params.id, { staff: true });
    const row = (
      await db.query("SELECT groups FROM node_team_groups WHERE user_id=$1", [
        req.params.id,
      ])
    ).rows[0];
    return reply(res, { groups: row?.groups || [] });
  });
  route("PUT", "/api/team/:id/groups", async (req, res) => {
    await auth.userAccess(req, req.params.id, { staff: true, write: true });
    const parsed = z
      .array(z.string().trim().min(1).max(60))
      .max(20)
      .safeParse(req.body.groups);
    if (!parsed.success)
      fail(400, "Enter up to 20 group names, each 1–60 characters");
    const groups = [
      ...new Map(parsed.data.map((g) => [g.toLowerCase(), g])).values(),
    ];
    await db.query(
      "INSERT INTO node_team_groups(user_id,groups) VALUES($1,$2) ON CONFLICT(user_id) DO UPDATE SET groups=EXCLUDED.groups",
      [req.params.id, JSON.stringify(groups)],
    );
    return reply(res, { groups }, "Groups saved");
  });
  route("GET", "/api/team/:id/feed", async (req, res) => {
    await auth.userAccess(req, req.params.id, { staff: true });
    const page = Number(req.query.page || 1);
    if (!Number.isInteger(page) || page < 1) fail(400, "Invalid page");
    const kind = req.query.kind || null;
    if (kind && !["NOTE", "CONCERN", "ACTION"].includes(kind))
      fail(400, "Invalid feed filter");
    const { rows } = await db.query(
      `SELECT f.id,f.kind,f.body,f.status,f.created_at AS "createdAt",f.resolved_at AS "resolvedAt",
      a.first_name||' '||a.last_name AS author FROM node_team_feed f JOIN users a ON a.id=f.created_by
      WHERE f.agency_id=$1 AND f.user_id=$2 AND ($3::text IS NULL OR f.kind=$3)
      ORDER BY f.created_at DESC,f.id LIMIT 21 OFFSET $4`,
      [req.user.agencyId, req.params.id, kind, (page - 1) * 20],
    );
    return reply(res, {
      entries: rows.slice(0, 20),
      hasMore: rows.length > 20,
    });
  });
  route("POST", "/api/team/:id/feed", async (req, res) => {
    await auth.userAccess(req, req.params.id, { staff: true });
    const parsed = z
      .object({
        kind: z.enum(["NOTE", "CONCERN", "ACTION"]),
        body: z.string().trim().min(1).max(4000),
      })
      .safeParse(req.body);
    if (!parsed.success)
      fail(400, "Choose a type and enter a message of up to 4000 characters");
    const id = randomUUID();
    await db.query(
      "INSERT INTO node_team_feed(id,agency_id,user_id,kind,body,created_by) VALUES($1,$2,$3,$4,$5,$6)",
      [
        id,
        req.user.agencyId,
        req.params.id,
        parsed.data.kind,
        parsed.data.body,
        req.user.id,
      ],
    );
    return reply(res, { id }, "Feed entry saved", 201);
  });
  route("POST", "/api/team/:id/feed/:entryId/resolve", async (req, res) => {
    await auth.userAccess(req, req.params.id, { staff: true, write: true });
    const { rows } = await db.query(
      `UPDATE node_team_feed SET status='RESOLVED',resolved_by=$4,resolved_at=CURRENT_TIMESTAMP
      WHERE id=$1 AND agency_id=$2 AND user_id=$3 AND status='OPEN' AND kind<>'NOTE' RETURNING id`,
      [req.params.entryId, req.user.agencyId, req.params.id, req.user.id],
    );
    if (!rows.length) fail(404, "Open action or concern not found");
    return reply(res, {}, "Marked as resolved");
  });
}
