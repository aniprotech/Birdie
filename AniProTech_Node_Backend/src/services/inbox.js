import {registerInboxAlerts} from './inbox-alerts.js';
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { reply, fail } from "../http.js";
const bodySchema = z.string().trim().min(1).max(6000);
export function registerInbox(ctx, route) { const {db,repo}=ctx; registerInboxAlerts(ctx,route);
  async function member(req, id) {
    const row = (
      await db.query(
        `SELECT t.id FROM node_threads t JOIN node_thread_members m ON m.thread_id=t.id
      WHERE t.id=$1 AND t.agency_id=$2 AND m.user_id=$3`,
        [id, req.user.agencyId, req.user.id],
      )
    ).rows[0];
    if (!row) fail(404, "Conversation not found");
    return row;
  }
  route("GET", "/api/inbox/people", async (req, res) => {
    const people = await repo.find(
      "UserEntity",
      { agencyId: req.user.agencyId },
      { collections: false },
    );
    return reply(
      res,
      people
        .filter(
          (p) =>
            p.id !== req.user.id &&
            p.role !== "USER" &&
            p.isActive &&
            !p.deletedAt,
        )
        .map((p) => ({ id: p.id, name: p.firstName + " " + p.lastName })),
    );
  });
  route("GET", "/api/inbox/threads", async (req, res) => {
    const page = Number(req.query.page || 1);
    if (!Number.isInteger(page) || page < 1) fail(400, "Invalid page");
    const { rows } = await db.query(
      `SELECT t.id,t.subject,m.archived,
      (SELECT max(created_at) FROM node_messages WHERE thread_id=t.id) AS "updatedAt",
      (SELECT count(*)::int FROM node_messages WHERE thread_id=t.id AND seq>m.last_read AND sender_id<>$2) AS unread,
      (SELECT left(body,100) FROM node_messages WHERE thread_id=t.id ORDER BY seq DESC LIMIT 1) AS preview
      FROM node_threads t JOIN node_thread_members m ON m.thread_id=t.id
      WHERE t.agency_id=$1 AND m.user_id=$2 AND m.archived=$3
      ORDER BY "updatedAt" DESC,t.id LIMIT 31 OFFSET $4`,
      [
        req.user.agencyId,
        req.user.id,
        req.query.archived === "true",
        (page - 1) * 30,
      ],
    );
    return reply(res, {
      threads: rows.slice(0, 30),
      hasMore: rows.length > 30,
    });
  });
  route("POST", "/api/inbox/threads", async (req, res) => {
    const parsed = z
      .object({
        subject: z.string().trim().min(1).max(160),
        participantIds: z.array(z.uuid()).min(1).max(20),
        body: bodySchema,
      })
      .safeParse(req.body);
    if (!parsed.success)
      fail(400, "Choose recipients and enter a subject and message");
    const { subject, body } = parsed.data,
      ids = [...new Set([req.user.id, ...parsed.data.participantIds])];
    if (ids.length < 2) fail(400, "Choose another staff member");
    for (const id of ids) {
      const u = await repo.get("UserEntity", id, { collections: false });
      if (
        !u ||
        u.agencyId !== req.user.agencyId ||
        !u.isActive ||
        u.deletedAt ||
        u.role === "USER"
      )
        fail(400, "One or more recipients are unavailable");
    }
    const id = randomUUID();
    await db.query(
      "INSERT INTO node_threads(id,agency_id,subject,created_by) VALUES($1,$2,$3,$4)",
      [id, req.user.agencyId, subject, req.user.id],
    );
    for (const userId of ids)
      await db.query(
        "INSERT INTO node_thread_members(thread_id,user_id) VALUES($1,$2)",
        [id, userId],
      );
    await db.query(
      "INSERT INTO node_messages(id,thread_id,sender_id,body) VALUES($1,$2,$3,$4)",
      [randomUUID(), id, req.user.id, body],
    );
    return reply(res, { id, subject }, "Conversation created", 201);
  });
  route("GET", "/api/inbox/threads/:id/messages", async (req, res) => {
    await member(req, req.params.id);
    const before = req.query.before || null;
    if (before && !/^\d{1,18}$/.test(before))
      fail(400, "Invalid message cursor");
    const { rows } = await db.query(
      `SELECT m.seq::text,m.id,m.body,m.sender_id AS "senderId",m.created_at AS "createdAt",
      u.first_name||' '||u.last_name AS sender FROM node_messages m JOIN users u ON u.id=m.sender_id
      WHERE m.thread_id=$1 AND ($2::bigint IS NULL OR m.seq<$2) ORDER BY m.seq DESC LIMIT 51`,
      [req.params.id, before],
    );
    const messages = rows.slice(0, 50).reverse();
    const people = (
      await db.query(
        `SELECT u.id,u.first_name||' '||u.last_name AS name FROM node_thread_members m JOIN users u ON u.id=m.user_id WHERE thread_id=$1`,
        [req.params.id],
      )
    ).rows;
    return reply(res, {
      messages,
      people,
      nextBefore: rows.length > 50 ? messages[0].seq : null,
    });
  });
  route("POST", "/api/inbox/threads/:id/messages", async (req, res) => {
    await member(req, req.params.id);
    const parsed = bodySchema.safeParse(req.body.body);
    if (!parsed.success) fail(400, "Enter a message of up to 6000 characters");
    await db.query(
      "INSERT INTO node_messages(id,thread_id,sender_id,body) VALUES($1,$2,$3,$4)",
      [randomUUID(), req.params.id, req.user.id, parsed.data],
    );
    await db.query(
      "UPDATE node_thread_members SET archived=false WHERE thread_id=$1",
      [req.params.id],
    );
    return reply(res, {}, "Message sent", 201);
  });
  route("POST", "/api/inbox/threads/:id/read", async (req, res) => {
    await member(req, req.params.id);
    const seq = String(req.body.throughSeq || "");
    if (!/^\d{1,18}$/.test(seq)) fail(400, "Invalid read position");
    const exists = (
      await db.query(
        "SELECT seq FROM node_messages WHERE thread_id=$1 AND seq=$2",
        [req.params.id, seq],
      )
    ).rows[0];
    if (!exists)
      fail(400, "Read position does not belong to this conversation");
    await db.query(
      "UPDATE node_thread_members SET last_read=GREATEST(last_read,$3) WHERE thread_id=$1 AND user_id=$2",
      [req.params.id, req.user.id, seq],
    );
    return reply(res);
  });
  route("POST", "/api/inbox/threads/:id/archive", async (req, res) => {
    await member(req, req.params.id);
    if (typeof req.body.archived !== "boolean")
      fail(400, "Choose archive or restore");
    await db.query(
      "UPDATE node_thread_members SET archived=$3 WHERE thread_id=$1 AND user_id=$2",
      [req.params.id, req.user.id, req.body.archived],
    );
    return reply(res);
  });
}

