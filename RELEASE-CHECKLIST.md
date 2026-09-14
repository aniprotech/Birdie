# AniProTech release checklist

## Before the first Git push

- Rotate the database, SMTP and Google Maps credentials that were present in local environment files.
- Confirm that no `.env`, signing key, database, upload, outbox, archive or generated screenshot is staged.
- Decide whether the web, API and mobile app will use one repository or separate repositories.

## Web dashboard

- Set `VITE_APP_BASE_LIVE_URL=https://backend.aniprotech.com`.
- Set a random `VITE_APP_SECRET_KEY` and restrict the Google Maps browser key to the production domains and required APIs.
- Run `npm ci`, `npm run lint` and `npm run build`.
- Configure the host to return `index.html` for client-side routes.

## API

- Use Node.js 22, PostgreSQL and HTTPS behind a managed reverse proxy.
- Set `NODE_ENV=production`, `DB_DRIVER=postgres`, `DATABASE_URL`, a random `JWT_SECRET` of at least 32 characters, `FRONTEND_URL`, `CORS_ORIGINS`, and SMTP settings.
- Set `TRUST_PROXY=true` only when exactly one trusted reverse proxy is in front of the service.
- Run `npm ci`, `npm test`, `npm run check`, `npm run db:check`, then `npm run db:init` against the intended staging database.
- Provide durable private storage for `UPLOAD_DIR`, or replace local uploads with object storage before horizontal scaling.
- Back up PostgreSQL and uploaded files together and monitor `/api/health`.

## Android and iOS

- Confirm the permanent Android package and iOS bundle identifier (`com.aniprotech.care`) before the first store submission.
- Configure an Expo account/project; preview and production use `EXPO_PUBLIC_API_URL=https://backend.aniprotech.com`.
- Run `npm ci`, `npm run typecheck`, `npx expo-doctor`, and Android/iOS exports.
- Create and test development builds because speech recognition and remote notifications are native features and do not run fully in Expo Go.
- Complete physical-device checks for login deep links, camera, photo upload, microphone transcription, foreground location, arrival notification, check-in/out, offline/error handling and permission denial.
- Provide store privacy disclosures, support/contact URLs, screenshots, signing credentials and test accounts in the Apple and Google consoles.

## Release gate

- Deploy staging web and API builds and run a complete carer visit from scheduling through finance confirmation.
- Verify least-privilege roles, audit entries, notification delivery, backup restoration and deletion/retention procedures.
- Tag the approved commit and promote the same artifacts to production.
