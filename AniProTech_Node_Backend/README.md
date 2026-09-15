# AniProTech — Node.js / Express backend

This is the Node.js/Express conversion of the supplied Java Spring Boot backend. It implements the **210 HTTP routes** found in **39 controllers**, with **66 database entity mappings**, PostgreSQL persistence and the existing `message/error/code/results.data` response structure. The original Java project and ZIP files are retained alongside it.

The application runs without Java. Local development uses **PGlite**, an embedded PostgreSQL runtime persisted under `data/postgres`; a PostgreSQL server is supported through the `pg` adapter. PGlite is for local development and tests, not the production deployment mode.

## Start locally

Node.js 22 or later is required. From this folder:

```powershell
npm ci
npm run db:init
npm run seed:demo
npm start
```

The backend listens on **http://localhost:8080**. Health checks are available at `/api/health` and `/actuator/health`. Database initialization is explicit; starting the server does not alter the schema.

In a second terminal, from the sibling `AniProTech_UI-main` folder:

```powershell
npm ci
npm run dev -- --host 127.0.0.1 --strictPort
```

Open **http://localhost:5173**. The frontend's `.env.development.local` points to the Express backend. The scripts `../start-backend.ps1` and `../start-frontend.ps1` also start each side from the correct folder.

Dependencies and local demo data were prepared during the conversion, so normally only the two start commands are needed. Stop a foreground server with Ctrl+C.

## Demo login

1. Enter **admin@example.test** in the frontend and click **Send me a link**.
2. The development mailer writes the message to this folder's `outbox` directory. No email is sent.
3. Run `node scripts/show-latest-login.js`.
4. Open `outbox/latest-login.html` yourself and click **Continue to AniProTech**. The link expires after 15 minutes and is usable once.

The demo data includes one administrator, one carer, one client and one example task. All are artificial test records. Seeding is disabled for external PostgreSQL and production configurations. The carer account is `carer@example.test`; an administrator must assign client access before that account can read the client's records.

## Implemented modules

| Area | Functionality |
| --- | --- |
| Authentication | Email links, single-use exchange, JWT sessions, validation, logout and session reset |
| Team | Creation, profile updates, contacts, termination, onboarding files, skills, operations, availability and absence |
| Clients | Profiles and addresses, clinical information, emergency contacts, professionals and inactivity |
| Care plans | 18 care domains; assessment create/update/read/delete, review/submission audit fields, risks and mitigations, supported summary updates |
| Tasks | Categories, tasks, plans, recurrence validation, pagination and care-plan associations |
| Medication | Medication details, schedules, PRN/regular date filtering, past administrations, immediate/scheduled stopping and soft deletion |
| Assignments | Client-to-carer and carer-to-client listings, individual changes and atomic bulk changes |
| Care circle | Members, invitation status and grouped invitation history |
| Documents | Uploads, caregiver visibility, signed downloads, signature records and document packs |
| Settings | Client settings, QR regeneration, access-code generation and configurable client-portal links |

See [API-ROUTES.md](docs/API-ROUTES.md) for every original route. Route inventory coverage is not a claim that every possible input and deployment scenario has been tested.

## Tests and checks

```powershell
npm test
npm run check
npm run db:check
npm audit --omit=dev
```

Stop the local backend before running database initialization, seeding or schema checks against its on-disk PGlite database. Do not open the same PGlite data directory in two processes. The integration suite uses its own isolated in-memory PGlite database. It exercises real SQL persistence and HTTP requests, including all assessment JSON fields across all 18 implemented care domains, single-use login, tenant isolation, privilege escalation rejection, nested records, atomic rollback, medication history, date filters, availability, onboarding, file validation, signed downloads and document packs.

Verification recorded on 2026-09-08: **15 tests passed**, **210/210 original routes registered**, **66 entity mappings checked with no missing local columns**, and **zero reported production-dependency vulnerabilities** after updating Nodemailer. These checks do not verify external SMTP delivery or compatibility with an actual copy of your existing production database.

## PostgreSQL server configuration

Copy `.env.example` to `.env`. Set `DB_DRIVER=postgres` and provide a `DATABASE_URL` using an appropriate account. Set a fresh random `JWT_SECRET` of at least 32 characters, `FRONTEND_URL` and the allowed `CORS_ORIGINS`.

For production, also set `NODE_ENV=production`, `MAIL_MODE=gmail`, the Gmail API OAuth settings and persistent upload storage. Use HTTPS through your hosting platform or reverse proxy. Keep the service private to that proxy unless intentionally publishing it. No credentials from the supplied Java configuration were copied into this project.

**Use a backup restored into an isolated staging database before switching an existing deployment.** Run `npm run db:check` there to compare the Java-derived mappings with the actual database, then review missing columns and type differences. The schema checker does not validate every historical constraint, index, sequence, timezone convention or historical data inconsistency.

The conversion retains original table/column naming, including source misspellings such as `care_pan_medication`. Scalar, JSONB, enum and collection mappings are stored in `src/models/schema.json`. It adds the `node_login_links`, `node_sessions` and `node_audit_log` tables. Java-issued login tokens are intentionally not accepted; existing users sign in again. Existing users and clients need correct `agency_id` values. Records with missing agency ownership are denied instead of being assigned to a guessed agency.

After verifying the staging mappings, initialize required tables with `npm run db:init`. This creates absent tables and supporting indexes; it does not drop existing tables or repair existing column types. Test representative existing records and migrate the `uploads` directory, retaining relative file paths, before redirecting traffic.

## Deliberate behavior changes

- Administrators can manage records only within their agency. Carers cannot change staff roles, assignments, onboarding, care-plan assessments or document permissions. They can read assigned client records and record medication administration. Confirm this permission policy against your operational requirements before production rollout.
- Login endpoints give generic responses for unknown/inactive accounts. Tokens are one-time, login attempts are rate limited, sessions are revocable, and actor identities come from the authenticated session.
- Files are not exposed as an unauthenticated static directory. API responses contain five-minute signed download tickets. File extensions are generated by the server after content inspection; client-supplied storage paths are ignored.
- Related records are checked against their parent and agency. Bulk mutations and their audit entries commit together before a success response is sent.
- Gmail API delivery is opt-in. `MAIL_MODE=outbox` writes local files. A `SHARE_ACCESS_URL` for your own client portal must be configured before sharing links; the application does not send client information to the unrelated third-party URL embedded in the Java source.
- The HTTP response format and nested `data` shape for assignment/task-category responses are retained. Error messages and stricter validation differ from the original.

## Remaining work outside the supplied backend conversion

The frontend contains unfinished modules and endpoint references that had no corresponding Java implementation. A generated list is in [frontend-unavailable-endpoints.json](docs/frontend-unavailable-endpoints.json). In particular, medical, moving/handling, restrictive-practice, seizures and Waterlow assessment APIs were absent from the supplied backend. Roster, Inbox, Log, Finance and Reporting pages are placeholders, and Microsoft SSO has no implemented authentication handler.

The current frontend still has pre-existing lint/runtime findings described in [the review](../PROJECT-REVIEW.md). The conversion does not turn those placeholder features into completed workflows. It also does not create Android/iOS packages or publish a production deployment.

The integration tests ran against embedded PostgreSQL, not an external PostgreSQL server. Browser verification reached the login screen and successfully requested a login message; authenticated browser navigation was not completed because the browser tool blocked the local email file. API authentication and authorized workflows were tested directly.

## Project layout

```text
src/app.js                 Express setup and route registration
src/auth.js                Login links, sessions and authorization
src/db.js                  PostgreSQL adapters and explicit schema initialization
src/repository.js          Typed entity persistence and collection handling
src/models/schema.json     Java-derived entity and enum mappings
src/services/              Domain implementations
src/files.js               File validation and protected downloads
src/mail.js                SMTP or local development outbox
scripts/                   Initialization, seeding and compatibility checks
test/integration.test.js   HTTP/database integration tests
docs/                      Route inventory and compatibility findings
```

The database, uploads, outbox, generated local signing key and `.env` files are excluded from Git. Back up the database and uploaded files together. Local outbox files contain short-lived login links and should stay private. Failed uploads can leave unreferenced private files; production storage should include a retention/cleanup process after checking database references.

## Team and Roster update

See [Team and Roster update](../TEAM-ROSTER-UPDATE.md) for the new weekly scheduling, staff groups and Carer Feed features, tested permissions, additive migration, and limits. The project now registers 220 routes and passes 26 automated tests. Open http://127.0.0.1:5173/admin/rosters to avoid another local project using the IPv6 localhost address.

## Operations and mobile update

Inbox, Log, Finance and Reporting are implemented. See [Operations and mobile update](../OPERATIONS-MOBILE-UPDATE.md) for scope and calculation boundaries. The React Native source is in `../AniProTech_Mobile`; same-Wi-Fi development is enabled. Production mobile access requires a hosted HTTPS API.
