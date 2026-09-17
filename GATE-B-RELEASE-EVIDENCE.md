# Gate B release evidence

Status date: 17 September 2026

## Delivered behavior

- Double-up calls create linked visit slots with one assignment per required caregiver.
- Unfilled slots appear as care-team-scoped open shifts and can be claimed only after availability, overlap, working-time, rest and travel checks pass.
- Administrators can configure daily and weekly working limits, minimum rest, planning speed and travel contingency.
- Location travel checks use recorded client coordinates and a conservative straight-line estimate. This is a planning safeguard, not live road routing.
- Confirmed billing and payroll reviews create revision-pinned financial lines.
- Pay runs can include care time, mileage and paid travel time using effective-dated rates.
- Issued invoices and approved pay runs are immutable. Reconciliation detects changed source visits, reviews, travel entries and total mismatches.
- Credit notes use a controlled draft, issued, applied or void lifecycle and cannot exceed the invoiced amount.
- CSV exports are recorded in the audit history; the document view supports browser print or save as PDF.

## Automated evidence

- Backend: 93 tests passed, including double-up/open-shift controls, working limits, travel gaps, finance snapshots, mileage, travel time, credit notes, stale-source rejection and reconciliation.
- Route compatibility: 210 Java routes, 302 Express routes, zero missing mapped routes.
- Web: lint completed with zero errors and the production build completed. Existing hook warnings and large bundle warnings remain technical-debt items.
- Mobile: 2 offline queue tests passed, TypeScript check passed, and Android/iOS production bundles exported.
- Source checks: changed backend modules pass syntax checks and the Git diff has no whitespace errors.

## Required acceptance before production sign-off

- A roster manager must validate double-up editing, open-shift claiming, working limits and local travel policy with synthetic schedules.
- A finance owner must validate rate selection, rounding, mileage, paid travel, credit-note approvals and exported totals against the organisation's rules.
- Payroll output is gross pay support; statutory tax, pension, deductions and bank submission require an approved payroll/accounting integration.
- Exact journey time requires a licensed routing provider. The current calculation is intentionally conservative and coordinate based.
- Staging must prove database migration idempotency, document immutability, concurrent open-shift claiming and backup restoration.
