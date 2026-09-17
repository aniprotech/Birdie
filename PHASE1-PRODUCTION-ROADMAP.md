# Caremonitor Phase 1 production roadmap

Status date: 17 September 2026

This roadmap converts the nine recommended development priorities and the production release checks into measurable delivery gates. A checked source-level item is not a production approval: staging, physical-device and recovery evidence must still be recorded.

## Current verified foundation

- Backend automated suite: 93 tests passed after the Gate B workforce and finance implementation.
- API compatibility inventory: 210 Java routes, 302 Express routes and no missing mapped routes.
- Mobile: TypeScript check passed and Expo exported Android and iOS bundles. The encrypted ordered queue covers attendance, care tasks, notes, incidents and eMAR, with visible pending/error state, idempotent server replay and automated ordered-replay/conflict coverage.
- Web: Vite production build passed; large bundle warnings remain an optimisation task.
- eMAR safety foundation: dedicated administration records, visit-state enforcement, due-round checkout controls, PRN validation, exception alerts, controlled-drug witnesses, stock deduction and low-stock alerts, append-only corrections, audit events, idempotent mobile submissions and encrypted pending-mutation storage.

## Nine development priorities

| Priority | Required outcome | Current position | Phase 1 exit evidence |
| --- | --- | --- | --- |
| 1. Medication safety | Safe eMAR rounds, PRN, omissions, stock, controlled drugs, allergy/interaction warnings and escalation | Due-round controls, controlled-drug witnessing, allergy acknowledgement, stock balance alerts and append-only corrections implemented | Clinical review, full stock ledger/reconciliation, interaction checking, authorised override policy and mobile/web acceptance tests |
| 2. Offline mobile reliability | Visits continue safely during poor connectivity without lost or duplicated records | Encrypted ordered queue, visible sync status, idempotent attendance/care-record/eMAR replay and ordered restart/conflict tests implemented | Device storage-pressure handling and physical-device network-loss evidence |
| 3. Advanced rostering | Recurrence, double-up visits, travel, skills, continuity, working-time rules and open shifts | Double-up calls, care-team-scoped open shifts, configurable daily/weekly/rest rules and conservative location travel checks implemented | Manager acceptance and licensed road-routing integration if exact journey times are required |
| 4. Complete finance | Invoice/payroll documents, funding, mileage, rate rules, credit notes, exports and reconciliation | Revision-pinned invoice/pay-run lines, travel and mileage pay, credit notes, audited CSV/PDF-ready print output and reconciliation implemented | Finance-owner acceptance, tax/accounting policy validation and external accounting/payroll adapters |
| 5. Production security and privacy | MFA, secure sessions, retention, export/erasure, backup/restore and security testing | TOTP MFA, named device sessions, recent-auth controls, retention policies, data-subject workflows, legal holds and backup/restore tooling implemented | Private durable storage, scheduled backups, recorded staging restore and penetration-test remediation |
| 6. Quality and compliance | Incidents, safeguarding, complaints, actions, audits, policy sign-off and credential expiry | Inbox alerts/actions and staff onboarding provide a base | Dedicated registers, escalation timers, evidence packs and compliance-owner acceptance |
| 7. Family/client portal | Scoped visits, messages, documents, consent, feedback and payments | Secure read-only shared client portal exists | Consent-led family accounts, messaging, visit visibility, granular revocation and accessibility testing |
| 8. Human-reviewed AI | Explainable summaries and safety signals without autonomous clinical decisions | Note assistance exists | Evidence links, review/approval history, false-positive evaluation, permissions and monitoring |
| 9. Analytics and forecasting | Operational, quality, workforce and margin insight | Reporting and finance overview exist | Metric definitions, drill-down, exports, data-quality checks and role-scoped dashboards |

## Delivery sequence

### Gate A - Clinical and mobile safety

1. Complete medication round generation, PRN outcome follow-up, stock and controlled-drug workflows.
2. Extend offline storage only to approved visit mutations and show pending/failed/synchronised state.
3. Block unsafe visit completion when an essential task or due medication has no recorded outcome, with an authorised and audited administrator override and reason. Implemented at API level and visibly flagged for administrator review in the care log; resolution workflow and clinical policy acceptance remain.
4. Validate location, camera, voice, notifications and reconnection on representative Android and iOS devices.

### Gate B - Workforce and finance integrity

Source implementation completed on 17 September 2026. Production approval remains subject to the acceptance and operational checks below.

1. Double-up calls, care-team-scoped open shifts, configurable daily/weekly/rest rules and location-aware conservative travel buffers are implemented.
2. Invoice and pay-run lines retain the confirmed visit, review and travel revisions used to create them; issued documents are immutable.
3. Credit-note lifecycle, mileage and paid-travel calculations, print/PDF-ready documents and audited CSV exports are implemented.
4. Document totals and source revisions are reconciled before issue/approval, and travel records used by pay runs cannot be changed afterward.

### Gate C - Security, privacy and operational readiness

Source implementation started on 17 September 2026.

1. TOTP MFA, named device sessions, session revocation and ten-minute recent-authentication checks are implemented.
2. Retention schedules, export/correction/erasure review, scoped export execution, controlled pseudonymisation and legal holds are implemented.
3. Private download tickets remain implemented. Durable storage migration remains required before horizontal scaling.
4. Checksum-backed database/file backup and isolated restore-drill tooling are implemented; production scheduling and recorded staging restoration remain required.
5. The threat model and operational evidence plan are documented. Independent dependency/security review, penetration testing and incident-response exercises remain required.

### Gate D - Compliance, portal, AI and analytics

1. Complete the quality/compliance registers and evidence packs.
2. Expand the client/family portal through explicit consent and least-privilege permissions.
3. Add human-reviewed AI with evidence, evaluation and monitoring.
4. Release governed dashboards with agreed metric definitions and data-quality checks.

## Production release checks

### Automated on the release commit

- Backend clean install, all tests, route parity check and database schema check.
- Web clean install, lint and production build.
- Mobile clean install, TypeScript check, Expo Doctor and Android/iOS export.
- No secrets, environment files, signing keys, databases, uploads, outbox contents or test accounts in Git.
- Database migrations applied to a staging snapshot and rolled forward twice to prove idempotency.

### Staging acceptance

- Register business, approve it as platform administrator and sign in as organisation administrator.
- Create staff and client records, grant care-team access and schedule a visit.
- Sign in on a physical caregiver device; check in with location evidence.
- Complete tasks and eMAR, including one permitted exception that creates an alert.
- Record notes by typing and voice, add a photo and report an incident.
- Check out, review the care log and resolve the generated alerts.
- Confirm payroll and billing, create the financial documents and reconcile totals.
- Exercise denied permissions, offline/reconnection, duplicate submission, stale update and session revocation.

### Operational approval

- Backup restoration is demonstrated and timed.
- Data retention, access export and deletion review are demonstrated with synthetic data.
- Monitoring, alerting, support ownership and incident contacts are active.
- Gmail, Microsoft sign-in, PostgreSQL and private file storage are verified in the production configuration.
- Store privacy declarations, screenshots, support URLs, signing credentials and reviewer accounts are complete.
- Clinical, operational, privacy and security owners sign the release record.

## Current next implementation slice

Begin Gate C with MFA/passkeys, device-session management and privileged-action reauthentication. Gate A still requires clinical acceptance and physical-device denial/reconnection evidence; Gate B still requires manager and finance-owner acceptance, exact road-routing only if required by policy, and staging evidence. These external approvals remain production release gates.
