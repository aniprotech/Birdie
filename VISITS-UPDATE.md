# Weekly Visits screen

## Calendar view

Clients → Calendar now uses the same visit records in a Monday–Sunday hourly grid, with half-hour lines and proportional visit blocks. It opens around 06:00 and scrolls through all 24 hours. Completed visits are green with a check mark; scheduled visits are blue. Other statuses have a legend. Overlapping visits share the day column without hiding each other. A red line marks the current London time.

Click a block to open the same six visit-detail tabs. Filters, Add/edit visit, week navigation, CSV download and the read-only 21-visit demo are shared with Visits. Three positioning/overlap tests, frontend build/lint and desktop/mobile browser checks passed. Screenshots are in `calendar-screen-checks`.

Open Clients → a client → Visits at http://127.0.0.1:5173.

The screen uses seven day columns and Anytime, Morning, Lunchtime, Afternoon, Evening and Night rows. Day headings and the time-of-day labels stay visible while scrolling. Today is highlighted using Europe/London dates.

Visit cards show the schedule, recorded activity completion count, planned duration, assigned carer, status and review reasons. Select a card to open Details, Alerts, Activities, Observations (including general notes), Care team and Timeline in a right-hand panel.

Search, status and carer filters, a review filter, previous/next week, Today and a date picker are available. Download visits exports the filtered visits as CSV, with planned/actual minutes and review reasons. Spreadsheet formula prefixes are escaped.

Admins can add visits, repeat weekly for up to 12 weeks and edit draft/scheduled visits. These actions use the existing roster service's availability, conflict and stale-edit checks. Carers see only their own visits for clients they are authorised to view.

The schedule also projects client Task Planner entries into their due dates and sessions, respecting recurrence and end dates. These are labelled planned tasks. They do not imply care was delivered or automatically become recorded visit activities.

## Dummy examples

Use **Demo schedule** to preview 21 fictional visits across a full week, with completed, scheduled and draft examples, two fictional carers, planned tasks, activities, an alert, notes and timeline examples. Demo data is read-only, generated for the displayed week and excluded from real records and billing. Exit demo returns to live data.

A clearly labelled **DUMMY TEST — weekly visits preview** draft is retained for the existing Dummy Client. Its create/edit flow was tested against PostgreSQL. Existing real visits were not edited.

## Validation

All 52 backend checks passed, including new coverage for activity/alert counts, tenant and carer access, due task dates and invalid date ranges. The frontend build and targeted lint passed. Browser checks and screenshots are in `visit-screen-checks`.

Review reasons flag draft/unassigned visits, open alerts and scheduled visits whose start has passed; this is a review aid, not an automatically generated missed-visit record. Overnight visits still need splitting into same-day visits, as required by the existing roster service. Medication administration is not inferred from task counts.
