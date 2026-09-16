# Birdie workflow parity audit

Audit date: 16 September 2026

This is a read-only review of observable Birdie workflows. It records product behaviour only; no Birdie source code or personal care data has been copied.

## Verified workflow comparison

| Area | Birdie behaviour observed | Caremonitor implementation |
| --- | --- | --- |
| Clients | Status/search/group filters, map, create client, detailed client workspace | Implemented: client list and creation, basic/client information, feed, care plan, task planner, medication, visits, calendar, care team/circle, sharing, settings and downloads |
| Team | Active/inactive staff, search/groups, create caregiver, staff workspace | Implemented: team list and creation, profile, onboarding, skills, clients, availability, calendar, time off, operations and staff feed |
| Roster | Weekly carer view, groups, display controls, runs and rota planning | Implemented: weekly timeline/list views, working-hours and absence overlays, runs, templates, reviewed auto-assignment and visit creation/editing |
| Inbox | Alert/action queues, status filters, assignments, due dates, comments and add-new actions | Implemented: alerts/actions/messages, advanced filters, search/severity, comments, assignment, due dates, bulk updates, notification preferences and delivery settings |
| Care log | Visit cards, alert/observation/activity counts, status and planned-versus-actual time | Implemented: filters, cards, visit detail tabs, audit history and planned/actual timing |
| Finance | Confirm/discard visits for payroll and invoicing using planned or actual time | Implemented: confirmation queues, filters, discrepancy handling, invoice/pay rates, payroll, service hours, travel rates and change history |
| Administration | Support details, carer-app settings/message, logo, groups, runs and documents | Implemented: editable organisation/admin profile, support contacts, mobile permissions, carer message, branding, staff groups, roster runs and client document workflows |
| Mobile carer app | Visits, client information, tasks/medication, notes, check-in/out, photos and incidents | Implemented in the Expo Android/iOS app, including location, camera, voice-to-text, notifications and production API configuration |

## Corrections made during this audit

- Administrator-menu items now open their real workspaces instead of incorrectly returning to Organisation settings.
- Manage runs opens the roster directly in the runs manager.
- Document administration points administrators to the client workspace, where document access is correctly scoped to a client.
- New business registrations enter a pending queue; only a configured Caremonitor platform administrator can approve, reject or suspend access.
- All transactional email now uses a central Caremonitor-branded responsive template, including secure sign-in, invitations, shared-care access, arrival messages, alerts and approval decisions.
- The local-only demo seeder supplies synthetic organisation, administrator, caregiver, client, address, tasks, medication, visits, inbox alerts and actions without copying real provider data.

## Remaining validation before release

- Complete role-based acceptance testing with administrator, caregiver and client-access accounts.
- Test Android and iOS permission flows on physical devices and verify push credentials for each store build.
- Verify email sign-in, Microsoft SSO, database migrations and file persistence in the production Railway environment.
- Run a controlled end-to-end care visit: schedule, assign, notify, check in, complete tasks/medication, add notes/media, check out, review the alert/log, confirm payroll and raise an invoice.
- Confirm privacy retention, audit exports, backup/restore, support procedures and store privacy declarations before onboarding real care data.
