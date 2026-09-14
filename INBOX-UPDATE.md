# Inbox alerts and actions

Implemented at `/admin/inbox`, following the supplied three-column reference with AniProTech branding.

## Working features

- Alerts: All, Action needed, In progress, Resolved and Archived folders, with counts.
- Actions: All, Unassigned, My actions, Due today, Due this week, Done and Archived.
- Search across client name, title and details; severity filtering; server-side pagination; manual refresh.
- Selecting a card opens its incident details on the right. Details, Comments and Timeline tabs show the selected record's data.
- Administrators can create alerts/actions, optionally link a recent visit, set severity, assign staff, set due dates, update status, and archive/restore resolved items.
- Comments are persistent, attributed and append-only. Timeline records updates and client-feed versions. Visit-linked updates also add visit timeline events.
- Multi-select supports this page's items, with a review dialog for status, severity, assignment, archive or restore. A stale revision or invalid item rolls back the entire bulk update. API maximum: 50 items; UI page size: 30.
- Existing private conversations remain available under Messages, with their original permissions, unread state, replies and archive behavior.
- Desktop uses independent column scrolling; mobile stacks the list and selected record with horizontally scrollable folders.

## Data and permissions

The workflow uses existing `node_client_entries` ALERT/ACTION records, so previously recorded client-feed alerts and actions appear without copying them. Resolving or reopening an item updates the same care-feed record and preserves its version history.

The new `node_inbox_details`, `node_inbox_comments`, and `node_inbox_events` tables hold workflow metadata and audit records. All access is restricted to the current agency. Administrators manage agency items. Carers see items they created or were assigned, only while retaining client view access; visit-linked records additionally require the carer to be assigned to that visit. Carers may comment on accessible records and change the status of their assigned records, but cannot create items, reassign them, change severity/dates or perform bulk updates.

Assigning a carer requires current client view access; for a visit-linked item, the assignee must be its carer or an administrator. Existing metadata is preserved when care-feed content changes. An external edit to an open care-feed record puts the Inbox record back into Action needed so it can be reviewed again. Archived items reopened through the feed become visible again.

## Limits

- Inbox displays recorded alerts/actions. Email delivery is implemented for recorded alerts. Background detection of missed visits, medication exceptions and clinical escalation rules remains outside this Inbox workflow.
- A medication-related incident links directly to the client's MAR chart for the incident creation month. It does not invent or modify MAR data.
- Due today/week use London dates. This week's due folder covers today through Sunday; overdue dates are highlighted on visible cards.
- The create form's optional visit picker covers 30 days before/after today. Existing older linked records remain accessible.
- No deletion of incident records or comments is offered. Messages remain a separate private conversation workflow.
- No public deployment was performed.

## Verification

- Full backend suite: 73 checks passed. The extended Inbox suite subsequently passed six checks including pagination, literal search and impossible due dates.
- Changed frontend components passed lint. Production build passed, with the existing large-bundle advisory.
- Route audit: 266 Express routes; no missing legacy routes.
- Authenticated live list/options endpoints passed read-only checks after the schema migration and local backend restart.
- Browser fixtures verified selecting records, status/severity changes, comments and reload persistence, timeline, search, bulk review/apply, action creation, assignments, due dates, archive/restore, preserved Messages, and 390px mobile layout. Screenshots are in `inbox-checks`.
- Database mutations in workflow tests used an isolated in-memory PostgreSQL-compatible database. Browser mutations used fictional intercepted responses. No real alert, client record, conversation or email was changed or sent during testing.

Checks: backend `node --test test/inbox-alerts.test.js`, `node scripts/check-inbox-alerts.js`; UI `npm run build`. The targeted schema script is `node scripts/init-inbox-alerts.js`.


## Advanced filters and Settings follow-up

- Sidebar More filters opens a keyboard-accessible dialog with independently scrolling content and a fixed result footer. Creation dates, carer groups, clients, linked visit carers, multiple statuses/severities, medication/visit/concern types, assignee, due-date range and overdue filters combine on the server. The dialog starts from the current folder and supports Alerts, Actions, or combined results with separate alert/action statuses. Clear all removes additional filters and includes both record kinds. Archived records require an explicit status selection. Assignment/due filters apply to all selected records; alert type/severity selections apply to alerts.
- Show results previews the actual matching total. Folder badges remain overall folder counts. Groups/carers refer to linked visits. Type matching uses recorded titles/categories; it does not infer clinical incident types from narrative text or create unrecorded alerts.
- Settings includes Concerns, Medication, Visits, Third party access, Forced check in/out (email only), and Observations, with personal Email/SMS selections. Defaults, sorting and card previews are also saved.
- Email delivery is now connected through the configured SMTP provider, with an explicit personal opt-in and durable queue. SMS remains disabled at the user's request. Existing alerts remain visible regardless of selections.
- Preferences persist by authenticated user and agency in node_inbox_preferences, with revision checks to reject stale saves. The targeted initialization was applied and the development backend restarted.
- Selecting a card sets ?item= in the URL so reload/deep links reopen the same record; Settings uses ?settings=true.
- Verification: 76 backend checks passed, including advanced filtering/date validation/agency boundaries and preference persistence/isolation/stale writes. Production build passed (existing bundle-size advisory). Browser fixture checks passed filter apply, notification save/reload, selected URL reload, MAR target links, and all earlier Inbox workflows and mobile width. The application did not send email/SMS or mutate real incident data during these checks.


## Email delivery completion (9 September 2026)

- User chose Email only. SMTP connection/authentication verified without sending a test email. SMS controls are disabled.
- Inbox > Settings now offers Enable email notifications, per-type email selection, an account recipient address, and personal delivery history with safe retry for eligible failures.
- A transactional database trigger captures new/reopened recorded alerts. Rollbacks cannot create orphan notifications. Existing historical records are not backfilled; enabling/changing preferences establishes a new eligibility timestamp.
- Durable event/delivery/history tables survive restarts. Unique event/user/channel keys and locked claims prevent duplicate queuing. The latest reopen supersedes pending work from older occurrences. A 15-second worker runs with the backend and processes bounded batches.
- Before sending, the worker rechecks account activity, agency, client/carer permissions, current preferences, resolution and expiry. Notifications older than 24 hours are cancelled/skipped rather than sent late.
- Known transient rejections retry with exponential backoff up to five automatic attempts. Eligible failures permit recipient-requested retries up to eight total attempts. Lost acknowledgements/interrupted sends are marked Unknown and are not automatically resent.
- Email contains only a generic notice and authenticated Inbox link; no client name, clinical narrative or medication details. SMTP acceptance is labelled Accepted by email provider, never Delivered. Recipient inbox delivery was not asserted or tested.
- Set INBOX_NOTIFICATIONS_ENABLED=false to pause the worker. SMTP uses the existing MAIL_MODE and SMTP configuration. No credentials are returned by the UI/status endpoints.
- Verification: 84 backend checks passed, including queue rollback, deduplication, retries, restart persistence, uncertain outcomes, opt-out/resolution cancellation, no historical replay, recipient isolation and SMTP failure classification. Production build and changed-component lint passed. All sending tests used fake transports; real SMTP verification authenticated only.
- The schema was applied and development backend restarted. Staff must enable their own email notifications and save their alert selections. No staff account was silently opted in.
- Reference: Nodemailer SMTP transport/error documentation: https://nodemailer.com/smtp and https://nodemailer.com/errors .
