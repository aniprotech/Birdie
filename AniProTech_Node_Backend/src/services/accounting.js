import { randomUUID } from "node:crypto";
import { z } from "zod";
import { fail, reply } from "../http.js";

const contactSchema = z.object({
  displayName: z.string().trim().min(1).max(160),
  legalName: z.string().trim().max(160).default(""),
  contactPerson: z.string().trim().max(160).default(""),
  email: z.union([z.email(), z.literal("")]).default(""),
  phone: z.string().trim().max(50).default(""),
  billingAddress: z.string().trim().max(1000).default(""),
  companyNumber: z.string().trim().max(40).default(""),
  vatNumber: z.string().trim().max(40).default(""),
  role: z.enum(["CUSTOMER", "SUPPLIER", "BOTH"]),
  payerType: z.enum(["INDIVIDUAL", "FAMILY", "INSURER", "LOCAL_AUTHORITY", "ORGANISATION", "OTHER"]).default("OTHER"),
  paymentTermsDays: z.number().int().min(0).max(365).default(30),
});
const itemSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(500).default(""),
  unit: z.string().trim().min(1).max(30).default("each"),
  unitPricePence: z.number().int().min(0).max(100000000),
});
const taxSettingsSchema = z.object({
  vatNumber: z.string().regex(/^[0-9]{9}$/),
  vatEffectiveDate: z.iso.date(),
});
const contactSelect = `SELECT id,display_name AS "displayName",legal_name AS "legalName",
  contact_person AS "contactPerson",email,phone,billing_address AS "billingAddress",
  company_number AS "companyNumber",vat_number AS "vatNumber",role,
  payer_type AS "payerType",
  payment_terms_days AS "paymentTermsDays",archived_at AS "archivedAt",
  created_at AS "createdAt" FROM node_accounting_contacts`;
const itemSelect = `SELECT id,name,description,unit,unit_price_pence AS "unitPricePence",
  archived_at AS "archivedAt",created_at AS "createdAt" FROM node_accounting_items`;
const parse = (schema, body) => {
  const result = schema.safeParse(body);
  if (!result.success) fail(400, "Check the required fields and values");
  return result.data;
};

export function registerAccounting({ db, auth }, route) {
  const requireAccess = (req) => {
    auth.admin(req);
    if (!req.user.agencyId) fail(403, "An organisation is required");
    return req.user.agencyId;
  };
  route("GET", "/api/accounting/summary", async (req, res) => {
    const agencyId = requireAccess(req);
    const [contacts, items, documents] = await Promise.all([
      db.query("SELECT count(*)::int AS total FROM node_accounting_contacts WHERE agency_id=$1 AND archived_at IS NULL", [agencyId]),
      db.query("SELECT count(*)::int AS total FROM node_accounting_items WHERE agency_id=$1 AND archived_at IS NULL", [agencyId]),
      db.query(`SELECT count(*)::int AS total,COALESCE(sum(total_pence),0)::bigint AS "totalPence"
        FROM node_finance_documents WHERE agency_id=$1 AND kind='INVOICE' AND status<>'VOID'`, [agencyId]),
    ]);
    return reply(res, { contacts: contacts.rows[0].total, items: items.rows[0].total,
      visitInvoices: documents.rows[0].total, visitInvoiceTotalPence: Number(documents.rows[0].totalPence) });
  });
  route("GET", "/api/accounting/tax-settings", async (req, res) => {
    const agencyId = requireAccess(req);
    const settings = (await db.query(`SELECT vat_number AS "vatNumber",
      vat_effective_date::text AS "vatEffectiveDate",verification_status AS "verificationStatus",
      updated_at AS "updatedAt" FROM node_accounting_tax_settings WHERE agency_id=$1`,[agencyId])).rows[0];
    return reply(res, settings || null);
  });
  route("PUT", "/api/accounting/tax-settings", async (req, res) => {
    const agencyId = requireAccess(req), p = parse(taxSettingsSchema, req.body);
    await db.query(`INSERT INTO node_accounting_tax_settings(agency_id,vat_number,vat_effective_date,updated_by)
      VALUES($1,$2,$3,$4) ON CONFLICT(agency_id) DO UPDATE SET vat_number=EXCLUDED.vat_number,
      vat_effective_date=EXCLUDED.vat_effective_date,verification_status='UNVERIFIED',
      updated_by=EXCLUDED.updated_by,updated_at=CURRENT_TIMESTAMP`,
      [agencyId,p.vatNumber,p.vatEffectiveDate,req.user.id]);
    const settings = (await db.query(`SELECT vat_number AS "vatNumber",
      vat_effective_date::text AS "vatEffectiveDate",verification_status AS "verificationStatus",
      updated_at AS "updatedAt" FROM node_accounting_tax_settings WHERE agency_id=$1`,[agencyId])).rows[0];
    return reply(res, settings, "VAT registration details saved");
  });
  route("GET", "/api/accounting/contacts", async (req, res) => {
    const agencyId = requireAccess(req);
    const rows = (await db.query(`${contactSelect} WHERE agency_id=$1 AND archived_at IS NULL
      ORDER BY lower(display_name),id LIMIT 500`, [agencyId])).rows;
    return reply(res, rows);
  });
  route("GET", "/api/accounting/client-payers", async (req, res) => {
    const agencyId = requireAccess(req);
    const rows = (await db.query(`SELECT u.id AS "clientId",concat_ws(' ',u.first_name,u.last_name) AS "clientName",
      d.payer_contact_id AS "payerContactId",c.display_name AS "payerName",c.payer_type AS "payerType",
      c.archived_at IS NOT NULL AS "payerArchived"
      FROM users u LEFT JOIN node_client_billing_defaults d ON d.client_id=u.id AND d.agency_id=u.agency_id
      LEFT JOIN node_accounting_contacts c ON c.id=d.payer_contact_id AND c.agency_id=u.agency_id
      WHERE u.agency_id=$1 AND u.role='USER' AND u.deleted_at IS NULL
      ORDER BY lower(u.first_name),lower(u.last_name),u.id LIMIT 500`,[agencyId])).rows;
    return reply(res, rows);
  });
  route("PUT", "/api/accounting/client-payers/:id", async (req, res) => {
    const agencyId = requireAccess(req);
    const input = parse(z.object({ payerContactId: z.uuid().nullable() }),req.body);
    const client = (await db.query(`SELECT id FROM users WHERE id=$1 AND agency_id=$2 AND role='USER'
      AND deleted_at IS NULL`,[req.params.id,agencyId])).rows[0];
    if (!client) fail(404,"Client not found");
    if (input.payerContactId) {
      const payer = (await db.query(`SELECT id FROM node_accounting_contacts WHERE id=$1 AND agency_id=$2
        AND archived_at IS NULL AND role IN ('CUSTOMER','BOTH') FOR UPDATE`,[input.payerContactId,agencyId])).rows[0];
      if (!payer) fail(404,"Billing contact not found");
    }
    await db.query(`INSERT INTO node_client_billing_defaults(agency_id,client_id,payer_contact_id,updated_by)
      VALUES($1,$2,$3,$4) ON CONFLICT(agency_id,client_id) DO UPDATE
      SET payer_contact_id=EXCLUDED.payer_contact_id,updated_by=EXCLUDED.updated_by,
      updated_at=CURRENT_TIMESTAMP`,[agencyId,client.id,input.payerContactId,req.user.id]);
    return reply(res,{ clientId:client.id,payerContactId:input.payerContactId },"Default payer saved");
  });
  route("POST", "/api/accounting/contacts", async (req, res) => {
    const agencyId = requireAccess(req), p = parse(contactSchema, req.body), id = randomUUID();
    const duplicate = (await db.query(`SELECT id FROM node_accounting_contacts
      WHERE agency_id=$1 AND lower(display_name)=lower($2) AND archived_at IS NULL`, [agencyId,p.displayName])).rows[0];
    if (duplicate) fail(409, "An active contact with this name already exists");
    await db.query(`INSERT INTO node_accounting_contacts(id,agency_id,display_name,legal_name,
      contact_person,email,phone,billing_address,company_number,vat_number,role,payer_type,payment_terms_days,created_by)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [id,agencyId,p.displayName,p.legalName,p.contactPerson,p.email,p.phone,p.billingAddress,
        p.companyNumber,p.vatNumber,p.role,p.payerType,p.paymentTermsDays,req.user.id]);
    return reply(res, (await db.query(`${contactSelect} WHERE id=$1 AND agency_id=$2`,[id,agencyId])).rows[0], "Contact created", 201);
  });
  route("PUT", "/api/accounting/contacts/:id", async (req, res) => {
    const agencyId = requireAccess(req), p = parse(contactSchema, req.body);
    const contact = (await db.query(`SELECT id FROM node_accounting_contacts WHERE id=$1 AND agency_id=$2
      AND archived_at IS NULL FOR UPDATE`,[req.params.id,agencyId])).rows[0];
    if (!contact) fail(404,"Contact not found");
    if (p.role === "SUPPLIER") {
      const assigned = (await db.query(`SELECT 1 FROM node_client_billing_defaults WHERE agency_id=$1
        AND payer_contact_id=$2 LIMIT 1`,[agencyId,req.params.id])).rows[0];
      if (assigned) fail(409,"Choose another default payer before changing this contact to supplier-only");
    }
    const result = await db.query(`UPDATE node_accounting_contacts SET display_name=$3,legal_name=$4,
      contact_person=$5,email=$6,phone=$7,billing_address=$8,company_number=$9,vat_number=$10,
      role=$11,payer_type=$12,payment_terms_days=$13,updated_at=CURRENT_TIMESTAMP
      WHERE id=$1 AND agency_id=$2 AND archived_at IS NULL RETURNING id`,
      [req.params.id,agencyId,p.displayName,p.legalName,p.contactPerson,p.email,p.phone,
        p.billingAddress,p.companyNumber,p.vatNumber,p.role,p.payerType,p.paymentTermsDays]);
    if (!result.rows[0]) fail(404, "Contact not found");
    return reply(res, (await db.query(`${contactSelect} WHERE id=$1 AND agency_id=$2`,[req.params.id,agencyId])).rows[0], "Contact updated");
  });
  route("POST", "/api/accounting/contacts/:id/archive", async (req, res) => {
    const agencyId = requireAccess(req);
    const contact = (await db.query(`SELECT id FROM node_accounting_contacts WHERE id=$1 AND agency_id=$2
      AND archived_at IS NULL FOR UPDATE`,[req.params.id,agencyId])).rows[0];
    if (!contact) fail(404,"Contact not found");
    const assigned = (await db.query(`SELECT 1 FROM node_client_billing_defaults WHERE agency_id=$1
      AND payer_contact_id=$2 LIMIT 1`,[agencyId,req.params.id])).rows[0];
    if (assigned) fail(409,"Choose another default payer before archiving this contact");
    const result = await db.query(`UPDATE node_accounting_contacts SET archived_at=CURRENT_TIMESTAMP,
      updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND agency_id=$2 AND archived_at IS NULL RETURNING id`,
      [req.params.id,agencyId]);
    if (!result.rows[0]) fail(404, "Contact not found");
    return reply(res, {}, "Contact archived");
  });
  route("GET", "/api/accounting/items", async (req, res) => {
    const agencyId = requireAccess(req);
    return reply(res, (await db.query(`${itemSelect} WHERE agency_id=$1 AND archived_at IS NULL
      ORDER BY lower(name),id LIMIT 500`,[agencyId])).rows);
  });
  route("POST", "/api/accounting/items", async (req, res) => {
    const agencyId = requireAccess(req), p = parse(itemSchema, req.body), id = randomUUID();
    await db.query(`INSERT INTO node_accounting_items(id,agency_id,name,description,unit,unit_price_pence,created_by)
      VALUES($1,$2,$3,$4,$5,$6,$7)`,[id,agencyId,p.name,p.description,p.unit,p.unitPricePence,req.user.id]);
    return reply(res,(await db.query(`${itemSelect} WHERE id=$1 AND agency_id=$2`,[id,agencyId])).rows[0],"Item created",201);
  });
  route("PUT", "/api/accounting/items/:id", async (req, res) => {
    const agencyId = requireAccess(req), p = parse(itemSchema, req.body);
    const result = await db.query(`UPDATE node_accounting_items SET name=$3,description=$4,unit=$5,
      unit_price_pence=$6,updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND agency_id=$2 AND archived_at IS NULL RETURNING id`,
      [req.params.id,agencyId,p.name,p.description,p.unit,p.unitPricePence]);
    if (!result.rows[0]) fail(404,"Item not found");
    return reply(res,(await db.query(`${itemSelect} WHERE id=$1 AND agency_id=$2`,[req.params.id,agencyId])).rows[0],"Item updated");
  });
  route("POST", "/api/accounting/items/:id/archive", async (req, res) => {
    const agencyId = requireAccess(req);
    const result = await db.query(`UPDATE node_accounting_items SET archived_at=CURRENT_TIMESTAMP,
      updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND agency_id=$2 AND archived_at IS NULL RETURNING id`,[req.params.id,agencyId]);
    if (!result.rows[0]) fail(404,"Item not found");
    return reply(res,{},"Item archived");
  });
}
