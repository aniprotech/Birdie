# AniProTech project review and conversion

Reviewed: 2026-09-08. Source: `AniProTech_UI-main.zip` and `AniProTech_Backend-main.zip` supplied in this folder. This is a source review plus build and local runtime evidence, not a production-deployment certification.

## Outcome

An Express/Node.js version of the supplied Spring Boot backend is in `AniProTech_Node_Backend`. It covers all 210 routes found in the 39 Java controllers and maps 66 persistent entities. The frontend now uses the new backend for local development. The original archives and extracted Java source remain available for comparison.

## Verification

| Check | Result |
| --- | --- |
| Original Java compile/package | Passed with a portable Java 17 JDK; tests skipped for this compile |
| Original Java runtime/database tests | Not performed against the supplied production configuration |
| Frontend clean install, as supplied | Failed: package.json and package-lock.json disagreed |
| Frontend local setup | Repaired dependency lock; original saved as frontend-package-lock.original.json |
| Frontend production build | Passed; main bundle approximately 3.21 MB before compression in the initial build |
| Frontend original lint | 45 errors and 45 warnings across the scanned files; not a clean lint gate |
| Express route registration | All 210 original routes covered |
| Express database mappings | 66 entity mappings; local schema check found no missing columns/type warnings |
| Express integration tests | 15 tests passed, including all 18 care domains |
| Express production dependency audit | Zero reported vulnerabilities after updating Nodemailer |
| Local backend HTTP | /api/health returned UP |
| Local frontend HTTP | Returned HTTP 200 |
| Browser | Login screen displayed; demo email-link request reached Express successfully |
| Authenticated browser workflow | Not completed: browser URL policy blocked opening the local outbox HTML file |
| Production deployment / existing data migration | Not performed |

## What was already implemented

The React 18/Vite frontend contains extensive client and team forms, care-plan screens, medication scheduling, task plans, staff availability, onboarding, skills, care-team assignments and document views. It uses React Router, Tailwind, Axios, Zustand, Formik and several calendar/table libraries.

The Spring Boot 3.4.1 backend targets Java 17 and PostgreSQL. Its controllers/services include email-link authentication, client/team records, clinical information, assessment/risk storage, task plans, medication scheduling, document uploads, signature records and administrative settings. The supplied backend includes a single context-loading test, rather than a domain regression suite.

## Highest-priority findings in the supplied source

1. **Role escalation and overly broad permissions.** `configuration/RouteAccessConfig.java:17` grants ADMIN, SUPERADMIN and CAREGIVER the same broad `/api` access. `services/ClientService.java:182` loads a target user by supplied ID, and line 250 applies a caller-supplied role. Together, these paths lack an adequate server-side role-change boundary. The Express implementation restricts administrative changes and derives ownership from the session.

2. **Missing agency/record ownership checks.** Client and team services fetch records by raw IDs or list records without consistently scoping them to the requesting agency. `ClientService.java:132` and the team listing are representative examples. This is a source-confirmed risk; no attack was attempted against the external server. The conversion checks agencies, parent relationships and assigned-carer permissions.

3. **Private documents exposed through a public resource handler.** `configuration/WebMvcConfig.java:15` serves `/uploads/**`, while authentication applies to `/api/**`. The stored caregiver-read flag does not protect the static resource itself. The conversion uses authenticated API filtering and signed file tickets.

4. **Unsafe file naming.** `utils/FileStorageUtil.java:26` derives a stored name from the supplied original filename; `SingleFileStorageUtil.java:30` resolves that name without checking it remains within the upload root. The conversion generates names and validates file contents. Arbitrary source filename paths are not accepted.

5. **Secrets and production configuration packaged with code.** The archives contain frontend environment values, backend database/mail settings, a hard-coded signing secret and historical logs/uploads. Values were not copied into this report. The Java application defaults to `prod` and `ddl-auto=update`, so a casual launch could modify the configured database schema. Existing credentials should be replaced during deployment preparation, and historical logs/uploads should not be published with source.

6. **Frontend/backend contract gaps.** Frontend COVID and environmental/fire URLs did not match the Java controllers; these two URL families were corrected in the frontend. Other referenced APIs did not exist in the supplied Java project: medical, moving/handling, restrictive-practice, seizures, Waterlow and certain delete/update operations. The remaining references are enumerated in `AniProTech_Node_Backend/docs/frontend-unavailable-endpoints.json`; some constants may be unused, so the list is not itself a count of failing screens.

7. **Unfinished screens.** Roster, Inbox, Log, Finance and Reporting components only render placeholder labels. Microsoft SSO has no functional click handler. `AuditAssessmentPage.jsx:90` creates mock update data; its submit function at line 110 logs data and navigates rather than persisting the assessment. These are feature gaps independent of the language conversion.

8. **Frontend runtime defects despite a passing build.** Lint found undefined identifiers including `e` in OrderPopUp, `setFieldValue` in both action-feed forms, `setShowCalendar` in VisitHeader and `paramsData` in EditGroups. Google Maps globals and configuration globals also contribute lint findings. The exact lint output is in `frontend-lint.json`; not all lint findings imply a runtime failure.

9. **Client-side token encryption does not protect against injected JavaScript.** Both the token and its decryption key are available to the browser. The conversion adds session revocation and server-side controls, but a stronger browser/mobile token storage design remains relevant for production and native apps.

## Conversion changes

The new backend uses Express, typed PostgreSQL mappings, parameterized queries, explicit database initialization, validated uploads, transactional domain writes and mutation audit records. It retains the original route naming and principal response shapes while tightening authorization. It supports an embedded PostgreSQL database for local development and an external PostgreSQL server through configuration.

The frontend changes needed for integration are a local API URL override, corrected DELETE request bodies, URL-safe login-token decoding, server-side logout/session revocation, clearing stored user information on logout, and corrected COVID/environment-fire endpoint prefixes. The dependency lock was repaired. Unfinished feature screens were not replaced with invented implementations.

## Android and iOS path

The React frontend can be reused with Capacitor after mobile layout and API workflows are stabilized. Capacitor can be added to an existing JavaScript web app. A dedicated React Native client is another option if the intended carer app needs a substantially different interface. The Spring-to-Express conversion does not require changing the mobile approach. [Capacitor documentation](https://capacitorjs.com/docs)

For this application, plan mobile work around sign-in/deep links, assigned clients, visits, task completion, medication administration, file/camera access, push notifications and any required offline synchronization. The supplied code does not yet implement that complete native workflow. iOS builds require macOS/Xcode locally or a suitable hosted macOS build environment; Android development uses Android Studio and the Android SDK. [Official environment requirements](https://capacitorjs.com/docs/getting-started/environment-setup)

Before production cutover, validate the new permissions with the business owner, test against an isolated copy of the existing database, confirm email delivery and complete the unfinished workflows relevant to the first release. See the new backend README for local run and staging migration instructions.
