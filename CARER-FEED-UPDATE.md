# Carer Feed update — 8 September 2026

Team > Carer Feed now uses the reference's three-column structure: filter counts, selectable visit/entry cards, and the selected record panel. More filters opens date range and search controls. Visit cards show client, UK date/time, alert/observation/activity counts, planned/actual duration and status colours.

Visits come from Roster assignments for that team member. The feed also includes visit-linked notes, alerts and actions, plus existing staff notes/concerns/actions. Staff concerns appear under Alerts. Existing records are preserved. Add new creates a staff entry; visit tabs provide the existing client-entry controls. Administrators can resolve staff concerns/actions.

The six visit tabs reuse the existing client feed: Details, Alerts, Activities, Observations, Care team and Timeline. Attendance, entry history and assignment controls keep their existing backend validation. Feed selection carries the client identifier so requests target the selected visit's client. Caregivers can only open their own team feed and retain the client care-team restrictions; agency boundaries apply.

Verification: all 60 backend tests passed, targeted frontend lint passed, and production build passed (existing large-bundle warning). Chrome verified the live database-backed feed endpoint. Browser-only fictional fixtures verified selection between visits, all six tabs, search/clear, Add new form, and 390px mobile layout. No fictional visits were inserted into the database and no care records were changed by browser testing. The Team content container now allows shrinking on small screens.

Refresh Team > the relevant carer > Carer Feed. A team member with no assigned visits will have an empty Visits list; use Roster to assign real visits. Preview screenshots are in carer-feed-checks and show explicitly fictional browser test data.

Main changes: backend src/services/team-activity.js and src/app.js; frontend shared LiveClientFeed.jsx/client-feed.css, CarerFeedIndex.jsx and ViewTeamIndex.jsx. Repeatable test: backend scripts/check-carer-feed.js.
