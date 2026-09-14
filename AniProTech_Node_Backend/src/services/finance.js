import { randomUUID } from "node:crypto";
import { z } from "zod";
import { reply, fail, uuid } from "../http.js";
import { dateRange } from "./activity.js";
export const roundCharge = (minutes, pence) =>
  Math.floor((minutes * pence + 30) / 60);
export function registerFinance({ db, repo, auth }, route) {
  async function lock(req) {
    await db.query(
      "SELECT id FROM users WHERE agency_id=$1 ORDER BY id FOR UPDATE",
      [req.user.agencyId],
    );
  }
  async function recipient(req, id, kind) {
    const u = await auth.userAccess(req, uuid(id));
    if ((kind === "INVOICE") !== (u.role === "USER"))
      fail(400, "Select a matching client or staff member");
    return u;
  }
  async function preview(req, query) {
    const { from, to } = dateRange(query),
      kind = query.kind;
    if (!["INVOICE", "PAYRUN"].includes(kind))
      fail(400, "Choose invoices or staff pay");
    const user = await recipient(req, query.recipientId, kind),
      rateKind = kind === "INVOICE" ? "BILLING" : "PAY";
    const { rows } = await db.query(
      `SELECT v.id AS "visitId",v.visit_date::text AS date,v.title,
      review.minutes AS minutes,
      (SELECT hourly_pence FROM node_rates r WHERE r.user_id=$2 AND r.agency_id=$1 AND r.kind=$5 AND r.effective_from<=v.visit_date ORDER BY effective_from DESC LIMIT 1) AS "hourlyPence"
      FROM node_roster_visits v JOIN node_finance_reviews review ON review.visit_id=v.id AND review.kind=$5 AND review.state='CONFIRMED' AND review.visit_revision=v.revision WHERE v.agency_id=$1 AND ${kind === "INVOICE" ? "v.client_id" : "v.staff_id"}=$2 AND v.status='COMPLETED'
      AND v.visit_date BETWEEN $3 AND $4 AND NOT EXISTS(SELECT 1 FROM node_finance_lines l WHERE l.visit_id=v.id AND l.kind=$6 AND l.released=false)
      ORDER BY v.visit_date,v.start_time,v.id`,
      [req.user.agencyId, user.id, from, to, rateKind, kind],
    );
    const lines = rows.map((r) => ({
      ...r,
      amountPence:
        r.hourlyPence === null ? null : roundCharge(r.minutes, r.hourlyPence),
    }));
    return {
      kind,
      recipientId: user.id,
      recipientName: user.firstName + " " + user.lastName,
      from,
      to,
      lines,
      missingRates: lines.filter((l) => l.hourlyPence === null).length,
      totalPence: lines.reduce((sum, l) => sum + (l.amountPence || 0), 0),
      currency: "GBP",
    };
  }
  const docSelect = `SELECT id,kind,number,recipient_id AS "recipientId",recipient_name AS "recipientName",from_date::text AS "from",to_date::text AS "to",total_pence AS "totalPence",status,created_at AS "createdAt" FROM node_finance_documents`;
  route("GET", "/api/finance/options", async (req, res) => {
    auth.admin(req);
    const people = await repo.find(
      "UserEntity",
      { agencyId: req.user.agencyId },
      { collections: false },
    );
    return reply(res, {
      people: people
        .filter((p) => !p.deletedAt)
        .map((p) => ({
          id: p.id,
          name: p.firstName + " " + p.lastName,
          isClient: p.role === "USER",
        })),
      currency: "GBP",
    });
  });
  route("GET", "/api/finance/rates", async (req, res) => {
    auth.admin(req);
    return reply(
      res,
      (
        await db.query(
          `SELECT r.id,r.user_id AS "userId",r.kind,r.effective_from::text AS "effectiveFrom",r.hourly_pence AS "hourlyPence",u.first_name||' '||u.last_name AS name
      FROM node_rates r JOIN users u ON u.id=r.user_id WHERE r.agency_id=$1 ORDER BY r.effective_from DESC,u.first_name`,
          [req.user.agencyId],
        )
      ).rows,
    );
  });
  route("POST", "/api/finance/rates", async (req, res) => {
    auth.admin(req);
    const p = z
      .object({
        userId: z.uuid(),
        kind: z.enum(["BILLING", "PAY"]),
        effectiveFrom: z.string(),
        hourlyPence: z.number().int().min(0).max(1000000),
      })
      .safeParse(req.body);
    if (!p.success)
      fail(400, "Enter a person, effective date and valid hourly rate");
    const b = p.data;
    dateRange({ from: b.effectiveFrom, to: b.effectiveFrom });
    await recipient(req, b.userId, b.kind === "BILLING" ? "INVOICE" : "PAYRUN");
    await lock(req);
    await db.query(
      `INSERT INTO node_rates(id,agency_id,user_id,kind,effective_from,hourly_pence) VALUES($1,$2,$3,$4,$5,$6)
      ON CONFLICT(user_id,kind,effective_from) DO UPDATE SET hourly_pence=EXCLUDED.hourly_pence`,
      [
        randomUUID(),
        req.user.agencyId,
        b.userId,
        b.kind,
        b.effectiveFrom,
        b.hourlyPence,
      ],
    );
    await db.query("INSERT INTO node_finance_history(id,agency_id,actor_id,subject_id,action,snapshot) VALUES($1,$2,$3,$4,'RATE_SAVED',$5)",[randomUUID(),req.user.agencyId,req.user.id,b.userId,JSON.stringify(b)]);
    return reply(res, {}, "Rate saved");
  });
  route("GET", "/api/finance/preview", async (req, res) => {
    auth.admin(req);
    return reply(res, await preview(req, req.query));
  });
  route("POST", "/api/finance/documents", async (req, res) => {
    auth.admin(req);
    await lock(req);
    const p = await preview(req, req.body);
    if (!p.lines.length)
      fail(400, "Confirm completed visits for this period before creating a document");
    if (p.missingRates)
      fail(
        400,
        "Set effective hourly rates for every visit before creating this document",
      );
    if (p.totalPence > 2000000000) fail(400, "Choose a smaller billing period");
    const number = (
        await db.query(
          "SELECT COALESCE(max(number),0)+1 AS next FROM node_finance_documents WHERE agency_id=$1 AND kind=$2",
          [req.user.agencyId, p.kind],
        )
      ).rows[0].next,
      id = randomUUID();
    await db.query(
      `INSERT INTO node_finance_documents(id,agency_id,kind,number,recipient_id,recipient_name,from_date,to_date,total_pence,created_by)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        id,
        req.user.agencyId,
        p.kind,
        number,
        p.recipientId,
        p.recipientName,
        p.from,
        p.to,
        p.totalPence,
        req.user.id,
      ],
    );
    for (const l of p.lines)
      await db.query(
        "INSERT INTO node_finance_lines(id,document_id,visit_id,kind,visit_date,title,minutes,hourly_pence,amount_pence) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [
          randomUUID(),
          id,
          l.visitId,
          p.kind,
          l.date,
          l.title,
          l.minutes,
          l.hourlyPence,
          l.amountPence,
        ],
      );
    return reply(res, { id }, "Draft created", 201);
  });
  route("GET", "/api/finance/documents", async (req, res) => {
    auth.admin(req);
    const { from, to } = dateRange(req.query);
    const kind = req.query.kind || "INVOICE";
    if (!["INVOICE", "PAYRUN"].includes(kind))
      fail(400, "Invalid document type");
    return reply(
      res,
      (
        await db.query(
          docSelect +
            " WHERE agency_id=$1 AND kind=$2 AND from_date<=$4 AND to_date>=$3 ORDER BY number DESC",
          [req.user.agencyId, kind, from, to],
        )
      ).rows,
    );
  });
  route("GET", "/api/finance/documents/:id", async (req, res) => {
    auth.admin(req);
    const d = (
      await db.query(docSelect + " WHERE id=$1 AND agency_id=$2", [
        req.params.id,
        req.user.agencyId,
      ])
    ).rows[0];
    if (!d) fail(404, "Document not found");
    d.lines = (
      await db.query(
        'SELECT visit_date::text AS date,title,minutes,hourly_pence AS "hourlyPence",amount_pence AS "amountPence" FROM node_finance_lines WHERE document_id=$1 ORDER BY visit_date,id',
        [d.id],
      )
    ).rows;
    return reply(res, d);
  });
  route("POST", "/api/finance/documents/:id/status", async (req, res) => {
    auth.admin(req);
    await lock(req);
    const d = (
      await db.query(
        "SELECT * FROM node_finance_documents WHERE id=$1 AND agency_id=$2 FOR UPDATE",
        [req.params.id, req.user.agencyId],
      )
    ).rows[0];
    if (!d) fail(404, "Document not found");
    const next = req.body.status;
    if (req.body.expectedStatus !== d.status)
      fail(409, "This document changed. Refresh before updating");
    const approved = d.kind === "INVOICE" ? "ISSUED" : "APPROVED";
    const allowed = {
      DRAFT: [approved, "VOID"],
      [approved]: ["PAID", "VOID"],
      PAID: [],
      VOID: [],
    };
    if (!allowed[d.status]?.includes(next))
      fail(400, "This status change is not allowed");
    await db.query(
      "UPDATE node_finance_documents SET status=$2,updated_at=CURRENT_TIMESTAMP WHERE id=$1",
      [d.id, next],
    );
    if (next === "VOID")
      await db.query(
        "UPDATE node_finance_lines SET released=true WHERE document_id=$1",
        [d.id],
      );
    return reply(res, {}, "Document updated");
  });
}
