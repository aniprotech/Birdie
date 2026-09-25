# Caremonitor reporting library plan

The supplied Looker exports are a reference for report organisation, measures, filters and drill-downs. Caremonitor reports must calculate from Caremonitor records and use Caremonitor terminology. Birdie example totals and its proprietary Q-Score must never appear as Caremonitor results.

## Placement and access

- Keep **Reporting** in the existing top navigation. Add a **Report library** view within Reporting, organised as Care delivery, Care records, and Management. Existing overview, safeguarding, medication audit, people and finance views remain alongside it.
- Agency ADMIN and SUPERADMIN roles can read their own agency's reports. Do not treat the agency SUPERADMIN role as a platform-wide grant. A separate platform-wide view requires an explicit platform administrator permission and a scoped implementation.
- Keep personal, medical and next-of-kin rows behind the existing admin permission. Export only the selected agency and filters. Link detail rows to the source record when possible.

## Data-backed reports

| Reference reports | Caremonitor source and definition |
| --- | --- |
| Completed Visit Reports, Hours Delivered, Visit Punctuality & Fulfilment, Longer Visits, Individuals with Reported Visits | Roster visits with planned and actual times. Count completed visits separately from scheduled visits; use distinct visit IDs for shared calls. Calculate punctuality using an explicit grace period and fulfilment using actual/planned duration. |
| Care Delivery Trends, Care Delivery by Client, Care Delivery by Carer | The same visit facts grouped by week, client or staff, with drill-downs to Visits. |
| Secure Check-in & Out Success | Mobile attendance events with `within_radius`; the current denominator is events with a known in/out radius result. Show unknown-location events separately. Distinguishing manual/forced events and configured-location eligibility needs a further source audit. |
| Care Tasks Completed, Observations & Visit Notes Recorded | Visit-linked client entries. Report recorded activities, observations and notes; do not claim a scheduled-task completion rate until scheduled and completed task identities are joined reliably. |
| Medication Tasks Completed, Medication Task Logs, Medication Alerts & Comments | Mobile eMAR, historical administrations and medication alerts. Recorded administrations are not the full expected-dose denominator. |
| Alerts Raised & Resolved, Actions, Notes, Concerns, Visit Logs, Task Logs, Client Observation Logs | Client feed, inbox, quality cases and visit events, with event-specific date and status definitions. |
| Client Details, Monthly Active Clients, Care Circle Members | Client profile, service dates, visit activity and care-circle records. Define activity and invitation/login status explicitly. |
| Care Planning, Assessments, Medical History, Client Risk Level Changes, Client Waterlow Score Changes | Care-plan and clinical records. Historical changes require versioned source data; do not derive change tables from a current snapshot. |
| Pulse Dashboard Care Management | A curated overview of the above verified measures, never a separate source of truth. |

## Requires a further data/definition audit

- Birdie's Q-Score is proprietary. A Caremonitor quality score needs an approved, published formula and versioned inputs.
- The Provider Information Return report contains regulatory questions. Each item needs an explicit source, eligibility rule, period rule and human review before it can be represented as a completed return.
- Region, branch, client group and carer group filters need a confirmed Caremonitor hierarchy. Do not infer region or branch from free-text addresses or team group names.
- Finance pulse requires agreement on invoice, payroll, cost, revenue and settlement definitions. Existing finance assurance reports only check document inclusion.
- Several source exports are screenshots of empty reports or truncated tables. Missing metric definitions, drill-downs and hidden columns need inspection before claiming exact parity.

## Release sequence

1. Introduce the grouped report library and verified visit, attendance, observation and alert measures using the existing agency boundary.
2. Add client/family, medication, care-plan and finance reports where source facts and denominators are proven.
3. Add clinical change histories, regulatory returns and a Caremonitor quality score only after their data capture and definitions are approved.
4. Validate each report with isolated database tests, role/tenant checks, frontend build and a signed-in production comparison against known Caremonitor records before publishing.
