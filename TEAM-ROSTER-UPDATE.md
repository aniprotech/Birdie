# Team and Roster update — 2026-09-08

## Delivered

Roster at `/admin/rosters` now has a weekly calendar and list view, week navigation, staff/status filters, counts and planned hours. Administrators can create draft visits, assign staff, schedule visits, edit individual visits, create up to 12 weekly occurrences, and cancel visits without losing history. Assigned carers can see their own visits and progress them from scheduled to in progress to completed. All schedule dates and times refer to Europe/London.

The API enforces agency isolation, active client/staff checks, client inactivity periods, staff/client overlap prevention, recorded staff availability and absence, stale-edit protection, and atomic weekly creation. Cancelled visits release the time slot. Recorded availability is enforced if a staff member has any availability records; otherwise any non-conflicting time is allowed. Later absence bookings cannot silently conflict with existing planned visits. Creating or changing availability does not automatically reschedule existing visits.

Team list search, pagination/filter reset, all-status filtering, request cancellation and loading behaviour were repaired. Creation controls are hidden for caregivers. Self-deactivation and self-role changes are blocked on the server. Existing profile, onboarding, skills, operations, assignments and availability endpoints remain connected. PostgreSQL date parsing now preserves calendar dates rather than interpreting them in the Windows timezone.

## Persistence

Added `node_roster_visits`, `node_team_groups`, `node_team_feed` and their supporting indexes. `node scripts/migrate-roster.js` applies only this additive change; fresh database initialization includes it too. Existing data is retained. All API mutations continue through the existing transactional audit wrapper. No sample clients, staff or visits were inserted into the user database.

## Validation

26 automated tests passed, including the original integration suite and new roster/Team cases. All 210 original routes remain; there are now 220 total routes. The frontend production build passed, retaining its pre-existing large-bundle warning. Authenticated HTTP checks against the configured PostgreSQL server passed for roster options/list, Team Groups and Carer Feed, using a temporary session that was revoked afterwards. The signed-in browser UI was not fully exercised; browser inspection encountered another project on localhost. Tests use isolated embedded PostgreSQL and a fake mailer; no test mail is sent.

## Current boundaries

This is a same-day, single-staff-per-visit roster. Overnight visits must be split. Visits intersecting 01:00–02:00 on UK clock-change Sundays are rejected because this wall-time scheduler cannot distinguish the missing or repeated hour. Completed/cancelled visits are kept as history and cannot be reopened. There is no payroll, travel-time optimisation, automatic care-plan task execution, GPS attendance, publication/notification workflow or whole-series editing. Staff group labels and a persisted Carer Feed are now included. The feed supports notes, concerns, actions, pagination/type filters and administrator resolution; it does not generate automatic visit alerts or send staff notifications.

## Open the app

Use http://127.0.0.1:5173/admin/rosters. Another local project may own the IPv6 `localhost:5173` address. AniProTech runs on IPv4 127.0.0.1. The backend FRONTEND_URL now uses that explicit address for future email links.
