# Caremonitor accounting architecture and delivery status

## Existing application

- The production API is the Express service in `AniProTech_Node_Backend`; it uses PostgreSQL, with PGlite for local integration tests. Startup applies forward-only `CREATE TABLE IF NOT EXISTS` schema additions.
- The web UI is React/Vite. The mobile apps wrap this UI with Capacitor. Existing authenticated `/admin/finances` is for visit-time review, client visit invoice documents and staff pay documents.
- `users.agency_id` is the authoritative organisation boundary. ADMIN and SUPERADMIN can currently operate the finance endpoints; CAREGIVER cannot. The shared authentication session, envelope, audit log, mail service and file service are reused.
- Existing visit invoice documents have no billing contact, VAT, payment allocation or posted ledger. A status named `PAID` is not proof of money received. The Accounting overview therefore describes their amount as document value, not cash.
- Prior/unrelated workspace changes were left untouched.

## New accounting area

`/admin/accounting` is a separate top-level tab. It uses `/api/accounting/*` and new `node_accounting_*` tables, leaving current Finance routes and data intact. The first operational slice contains tenant-scoped billing contacts (customer, supplier or both), service catalogue prices in integer pence, archive/edit controls, a summary, and integration tests for cross-organisation denial. Contacts are independent of clinical care records; no diagnosis, note or patient information is copied into accounting tables.

The user selected both organisational/funder and individual billing contacts. The person who creates an invoice is a different concept from its recipient: ADMIN and SUPERADMIN manage records for their own organisation. Accounting now has an organisation-scoped VAT settings form, but registration details are not seeded to any tenant because this local checkout cannot prove which tenant owns them. An authorised admin must enter them in the correct organisation. The number has not been independently verified and VAT charging remains disabled until the applicable tax treatment and scheme are confirmed.

## Domain and route plan

1. **Sales:** introduce quote, invoice and immutable invoice-line snapshots linked to `node_accounting_contacts`, with tenant-local, concurrency-safe numbering. For care-visit charges, map approved visit finance lines into non-clinical billing descriptions only. Keep a strict review and approval state before sending, immutable issued totals, credit notes for corrections, secure PDF generation and revocable recipient links. Add explicit `POST /api/accounting/invoices` and state/line endpoints.
2. **Receivables:** record append-only payments, allocations and reversals in minor units. The invoice balance derives from committed allocations, not a mutable `PAID` label. Introduce webhook/sync idempotency and transaction-level locks before any automatic matching.
3. **Purchases:** add supplier bills, approval and expenses with separate role capabilities and audit events.
4. **Banking:** a sort code may identify a bank, but neither account ownership nor transaction history can be retrieved from a sort code. A business owner must connect an account through a consent and bank-authorisation flow. Once a provider connection is authorised, sync only the accounts and transaction scopes granted. Store provider identifiers encrypted or otherwise protected, use idempotent imports, and keep credentials out of client code. Then reconcile by agency, bank account, currency, exact payment reference and amount; never mark an invoice paid solely because an unrelated bank credit appears.
5. **Ledger and UK VAT:** post balanced, append-only journal entries with locked periods and auditable reversals. Configure registration number, effective date, VAT scheme and tax codes before computing VAT. Connect to HMRC MTD in sandbox first; submissions require a reviewed return, recent authentication and explicit user action. No live HMRC or banking call belongs in application startup.
6. **Operations:** projects, billable time, inventory, fixed assets, reports, mobile layouts, exports and notifications can then consume the approved accounting records rather than inventing parallel totals.

## Security and acceptance gates

- All finance queries must constrain `agency_id` derived from authenticated membership. Add explicit capabilities when moving beyond ADMIN/SUPERADMIN. Caregiver and cross-agency access must be denied server-side, including PDFs, exports and background jobs.
- Do not send clinical records to bank, payment, email, or tax providers. Store only minimal billing identifiers and redact logs.
- Existing `node_finance_documents` use `max(number)+1`; new issued accounting invoices should use a tenant-local sequence/lock and a unique constraint, not repeat that pattern.
- Provider connections need actual Data API entitlement, registered callbacks, consent, sandbox evidence and production approval. HMRC needs sandbox acceptance, fraud-prevention headers, credentials and business authorization. A successful build is not evidence that those external systems work.
- Acceptance for each phase includes API and tenant tests, UI build and keyboard/mobile checks, migration on existing data, backup/restore proof and a separate live-service check before deployment.

## Current status

Foundation contacts/catalogue, VAT registration settings and navigation are implemented locally. Quotes, accounting invoices, PDFs, email delivery, purchases, payments, bank transactions, reconciliation, ledger, VAT calculation, HMRC and production deployment are **not implemented or verified** by this change.
