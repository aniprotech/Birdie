# Inbox, Log, Finance, Reporting and mobile — 2026-09-08

## Web modules now implemented

- Inbox: internal staff conversations, multiple recipients, replies, unread counts, read cursors, archived conversations and older-message pagination. Membership and agency are checked on every message request. This is not a Google Workspace mailbox. No external email is sent by Inbox.
- Log: administrator-only, read-only view of existing audit records, filtered by London calendar date and activity text, with pagination. It records successful requests handled by the audited routes; it is not a complete security-access log or clinical visit note system.
- Finance: GBP effective-dated client billing and staff pay rates; previews from completed roster visits; immutable line and rate snapshots; sequential per-organisation invoice/pay-run numbers; draft, issue/approve, paid and void transitions; duplicate-visit protection; void releases unprocessed visit slots; CSV and print/PDF output. Recording paid is manual and does not move money. Already-paid records cannot be voided through this workflow.
- Reporting: visit status counts, scheduled hours of completed visits, completion rate, daily counts, staff workloads, current active people, financial-document status totals and a staff CSV export. Financial totals include complete documents whose billing periods overlap the selected dates, and separate drafts and voids from issued/paid documents.

## Calculation boundaries

Finance uses the scheduled length of visits marked completed, not measured clock-in/out duration. Charges are rounded per visit to the nearest penny; rates take effect by visit date. Gross staff pay does not include PAYE, National Insurance, pensions, holiday pay or payroll submission. Invoices have no tax/VAT calculation, payment gateway, delivery email, refunds or accounting-system integration. This is an operational billing and pay-record workflow, not a complete statutory payroll/accounting system.

## Database and validation

Additive migration: `AniProTech_Node_Backend/scripts/migrate-operations.js`. New messaging, effective-rate, finance-document and finance-line tables preserve existing records. Fresh schema initialization also includes these tables. The original API routes remain available.

33 automated backend tests passed, including message privacy/unread handling, agency isolation, invoice rounding, immutable snapshots, duplicate billing, pay lifecycle, reports and mobile single-use links. The frontend production build passed. Protected live reads passed against the configured PostgreSQL server for Inbox, Activity, Finance and Reporting. A temporary test login was revoked afterwards. No test staff messages, invoices, pay runs, clients or visits were inserted into the live database.

## React Native app

Source: `AniProTech_Mobile`. Official Expo SDK 57 / React Native 0.86 TypeScript project. Includes secure native session storage, sign-in links and paste-link fallback, day-by-day visits and status tracking, permitted client profiles, team directory, staff conversations, and administrator read-only finance/report/activity summaries. Care-team assignments still determine access to client records; visit assignment alone does not grant access to the full client record.

Both Android and iOS JavaScript/Hermes bundles exported successfully, and TypeScript checks passed. Expo Doctor passed all 21 checks after duplicate native dependencies were deduplicated. These exports are not APK/IPA packages. No physical-device test, native compilation or App Store submission has been completed. Mobile admin creation/editing remains on the web; there is no offline clinical data cache, push notifications, GPS attendance or camera/document workflow in this first mobile implementation. Development icon assets from the Expo template remain and should be replaced with approved release artwork.

## Same-Wi-Fi testing

The PC address detected is 192.168.0.106. Express listens on port 8080 on the LAN; Expo Go serves this project on port 8082. On a phone connected to the same Wi-Fi, open Expo Go and scan `AniProTech_Mobile/mobile-preview-qr.png`. Sign in with the existing account. If the custom-scheme email link cannot open Expo Go, copy the complete link into the app's sign-in field instead. Never share that one-time link.

The API health check succeeded using the Wi-Fi address. A Windows firewall or Wi-Fi client isolation can still prevent the phone from connecting; actual phone access has not been verified. If the PC changes Wi-Fi/IP, update the mobile `.env`, preview/development build environment and QR link, then restart Expo. No firewall settings were changed.

## Build status and next requirements

`eas.json` defines Android preview APK and production profiles. Production config refuses a non-HTTPS API; deploy a reachable HTTPS backend before a production release. The user has Expo, but Expo CLI on this PC was not signed in when checked. Run `npx eas-cli@latest login` locally, then link the Expo project and build. iPhone device distribution additionally needs Apple signing setup; the user does not yet have an Apple Developer account. Cloud builds and store publishing have not been started.

The mobile npm audit reports 10 moderate entries in the Expo/Xcode build-tool dependency chain from a UUID advisory; no high or critical entries. The suggested automatic fix would downgrade Expo across major versions, so it was not applied blindly. Recheck upstream compatible fixes before release.

Official references: https://docs.expo.dev/versions/v57.0.0/ , https://docs.expo.dev/build/setup/ , https://docs.expo.dev/build-reference/apk/ , https://docs.expo.dev/linking/into-your-app/ .
