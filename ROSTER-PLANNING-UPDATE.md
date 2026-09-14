# Roster planning update

The Roster at `/admin/rosters` now follows the supplied timeline references, using AniProTech branding and the existing visit database.

## Available controls

- Carer and client views, searchable names, staff groups, seven day buttons, week navigation, Today, refresh, and timeline zoom.
- Timeline and day-list displays; scheduled, in-progress, completed, draft and cancelled colours. Cancelled visits can be shown explicitly.
- Weekly planned hours and visit counts, unallocated visits, working-hour shading, hatched time off, and optional same-day travel-gap indicators. Missing working hours are labelled as unknown availability.
- Click a visit to edit its date, time, client, staff member, notes or draft/scheduled state. Existing start, complete and cancel actions retain revision and permission checks.
- Open the selected visit's care record directly, including Details, Alerts, Activities, Observations, Care team and Timeline, even when that visit is outside the feed's first page.
- Save a week's visits as a named template. Applying a template previews draft visits first; unavailable original staff leave visits unallocated, while conflicting client visits are skipped.
- Manage named runs by grouping existing visits. Filter the board by a saved run. Removing a run or template retains all visits.
- Suggest assignments for unallocated draft visits. Only active caregivers with eligible client care-team links are considered. Candidates are ranked by completed visits with that client in the preceding 90 days, then lower planned workload.

## Persistence and safeguards

Templates and runs are stored per agency in `node_roster_assets`, so other authorised administrators in the organisation can reuse them. Caregivers cannot manage plans or access another caregiver's board through this API.

Plans must be previewed before application. Previews belong to the requesting administrator, expire after ten minutes, and cannot be replayed. Applying rechecks current revisions, care-team eligibility for suggestions, availability, absence, client inactivity, overlap and configured travel buffers. A conflict rolls back the entire application. Visit changes produce timeline events.

Availability loading uses batched records and collection reads rather than a query sequence for every team member. Historical visits remain visible even when their staff/client no longer appears in the active options list.

## Practical limits

- Visits remain within one London calendar day; overnight visits and the ambiguous clock-change hour are not supported by this scheduling model.
- Travel buffers apply between different clients' same-day visits during planning. They are configurable scheduling gaps, not mapped driving estimates; manual edits retain the existing overlap/absence/availability checks and do not enforce a plan-specific travel buffer.
- Suggestions do not perform skills matching, route optimisation, payroll or entitlement calculations. Where no working hours are recorded, the existing scheduling rules allow assignment subject to other checks; the board identifies this as unknown availability.
- Runs group visit IDs; they do not automatically recur or calculate routes. Template copies are drafts, not an automatically published rota. Preview batches are limited to 250 visits.
- No public deployment, real visit edits or real email sending were performed for verification.

Continuity and sufficient travel time informed these additions; see [NICE home-care recommendations 1.4.4 and 1.4.7](https://www.nice.org.uk/guidance/ng21/chapter/recommendations). This is not a compliance certification.

## Verification

- Full backend suite: 67 checks passed before the final targeted additions. The updated planning suite then passed seven checks, including the additional care-team-change and newly introduced travel-conflict cases.
- Route audit: 259 Express routes; no missing legacy routes.
- Frontend lint passed for the changed roster and feed components; production build passed with the existing bundle-size advisory.
- Browser checks at desktop and 390px mobile widths verified filtering, both perspectives, timeline/day switching, visit editing/creation, template/run persistence through refresh responses, assignment preview/apply, and the six-tab visit deep link. Browser mutations used isolated fixtures; backend integration tests used an in-memory PostgreSQL-compatible database.
- The live authenticated board endpoint was checked read-only. Planning schema migration retained existing visits, and the local backend was restarted to enable the new routes.

Useful checks: `node --test test/roster-planning.test.js`, `node scripts/check-roster-board.js`, and `npm run build` in their respective backend/UI folders. The browser script captures a test login locally without sending email and revokes its test session afterward.
