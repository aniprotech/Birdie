# Production readiness report

Verified on 14 September 2026.

## Passed locally

- Web dashboard lint: 0 errors (46 existing hook/refresh warnings).
- Web dashboard production build: passed; `/login` returned HTTP 200 from the production preview.
- API tests: 88 passed, 0 failed.
- API route parity: 284 Express routes, 210 legacy Java routes, 0 missing.
- API production dependency audit: 0 known vulnerabilities.
- API live health check: `UP` while connected to the configured PostgreSQL database.
- Mobile TypeScript check: passed.
- Expo Doctor: 21/21 checks passed.
- Android and iOS Hermes exports: passed.
- Mobile production configuration: HTTPS API enforced and Android cleartext traffic disabled.
- Mobile generated files, local environment file and signing formats are ignored by Git.

## Release gates requiring account or infrastructure access

- Rotate the locally exposed database, SMTP and Google Maps credentials before any Git push or deployment.
- Choose the final Git repository layout and remote destination.
- Deploy the API and dashboard to stable HTTPS domains and replace temporary/local URLs.
- Bind Railway to `backend.aniprotech.com` and `caremonitor.aniprotech.com` and verify issued TLS certificates.
- Configure the Expo project owner/project ID and production EAS environment.
- Confirm the permanent app identifier `com.aniprotech.care`.
- Create Android and iOS signed builds using the organisation's Google Play and Apple Developer accounts.
- Test login links, camera, uploads, speech recognition, location/arrival notifications and check-in/out on real Android and iOS devices using development/release builds.
- Publish privacy, retention, deletion, support and consent information required for care data, camera, microphone and location use.
- Provide durable private upload storage and backup/restore monitoring for production.

## Known non-blocking engineering work

- The dashboard reports 46 React hook/fast-refresh lint warnings. They do not fail lint or the build, but should be resolved module-by-module to reduce stale-effect risk.
- The dashboard's main JavaScript bundle is about 3.2 MB before gzip. Route-level code splitting should be scheduled as a performance improvement.
- The web production audit has two low-severity advisories in Quill's HTML-export path. Do not expose or render untrusted Quill HTML; upgrade when its maintained React wrapper ships a patched compatible Quill version.
- Expo's dependency tree reports moderate build-tool advisories in native project tooling. Expo Doctor passes; follow the Expo SDK upgrade path rather than forcing incompatible dependency versions.
