# Caremonitor Phase 1 production roadmap

Status date: 17 September 2026

This roadmap converts the nine recommended development priorities and the production release checks into measurable delivery gates. A checked source-level item is not a production approval: staging, physical-device and recovery evidence must still be recorded.

## Current verified foundation

- Backend automated suite: 92 tests passed after the first Phase 1 clinical-safety implementation.
- API compatibility inventory: 210 Java routes, 290 Express routes and no missing mapped routes.
- Mobile: TypeScript check passed and Expo exported Android and iOS bundles. The encrypted ordered queue covers attendance, care tasks, notes, incidents and eMAR, with visible pending/error state and idempotent server replay.
- Web: Vite production build passed; large bundle warnings remain an optimisation task.
- eMAR safety foundation: dedicated administration records, visit-state enforcement, due-round checkout controls, PRN validation, exception alerts, controlled-drug witnesses, stock deduction and low-stock alerts, append-only corrections, audit events, idempotent mobile submissions and encrypted pending-mutation storage.

## Nine development priorities

| Priority | Required outcome | Current position | Phase 1 exit evidence |
| --- | --- | --- | --- |
| 1. Medication safety | Safe eMAR rounds, PRN, omissions, stock, controlled drugs, allergy/interaction warnings and escalation | Due-round controls, controlled-drug witnessing, stock balance alerts and append-only corrections implemented | Clinical review, full stock ledger/reconciliation, allergy/interaction warnings, authorised override policy, mobile and web acceptance tests |
| 2. Offline mobile reliability | Visits continue safely during poor connectivity without lost or duplicated records | Encrypted ordered queue, visible sync status and idempotent attendance/care-record/eMAR replay implemented | Restart/network-loss automation, device storage-pressure handling and physical-device evidence |
| 3. Advanced rostering | Recurrence, double-up visits, travel, skills, continuity, working-time rules and open shifts | Conflicts, availability, absence, runs, templates and reviewed suggestions exist | Double-up/open-shift workflows, route/travel calculation, compliance rules and manager acceptance tests |
| 4. Complete finance | Invoice/payroll documents, funding, mileage, rate rules, credit notes, exports and reconciliation | Review locks, planned/actual basis, service hours, rates and history exist | Immutable invoice/pay-run lifecycle, PDFs, credit notes, export adapters and reconciliation tests |
| 5. Production security and privacy | MFA, secure sessions, retention, export/erasure, backup/restore and security testing | One-time links, session revocation, tenant isolation and audit records exist | MFA/passkeys, device sessions, retention jobs, data-subject workflows, tested restore and penetration-test remediation |
| 6. Quality and compliance | Incidents, safeguarding, complaints, actions, audits, policy sign-off and credential expiry | Inbox alerts/actions and staff onboarding provide a base | Dedicated registers, escalation timers, evidence packs and compliance-owner acceptance |
| 7. Family/client portal | Scoped visits, messages, documents, consent, feedback and payments | Secure read-only shared client portal exists | Consent-led family accounts, messaging, visit visibility, granular revocation and accessibility testing |
| 8. Human-reviewed AI | Explainable summaries and safety signals without autonomous clinical decisions | Note assistance exists | Evidence links, review/approval history, false-positive evaluation, permissions and monitoring |
| 9. Analytics and forecasting | Operational, quality, workforce and margin insight | Reporting and finance overview exist | Metric definitions, drill-down, exports, data-quality checks and role-scoped dashboards |

## Delivery sequence

### Gate A - Clinical and mobile safety

1. Complete medication round generation, PRN outcome follow-up, stock and controlled-drug workflows.
2. Extend offline storage only to approved visit mutations and show pending/failed/synchronised state.
3. Block unsafe visit completion when an essential task or due medication has no recorded outcome, with an authorised and audited administrator override and reason. Implemented at API level; web approval UI and clinical policy acceptance remain.
4. Validate location, camera, voice, notifications and reconnection on representative Android and iOS devices.

### Gate B - Workforce and finance integrity

1. Add double-up calls, open shifts, working-time checks and route-aware travel buffers.
2. Produce immutable invoice and pay-run documents from confirmed visit revisions.
3. Add credit notes, mileage/travel calculations and audited exports.
4. Reconcile each document to source visits and prevent post-release mutation.

### Gate C - Security, privacy and operational readiness

1. Add MFA or passkeys, device/session management and privileged-action reauthentication.
2. Implement retention schedules, export, correction, erasure review and legal holds.
3. Move uploads to durable private object storage before horizontal scaling.
4. Automate database and file backups; complete and record a staging restoration drill.
5. Complete threat modelling, dependency review, penetration testing and incident-response exercises.

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

Add automated mobile restart/network-loss coverage and an administrator web review screen for blocked sync items and completion overrides. The encrypted ordered queue, visible mobile sync state, idempotent replay, essential-task checkout controls and audited administrator override are implemented. Production approval remains blocked until clinical review, staging and physical-device checks are evidenced.
