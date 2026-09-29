# AniProTech Mobile

React Native / Expo SDK 57 app for Android and iOS. Shares the Express backend and PostgreSQL accounts with the web application.

## Run on the same Wi-Fi

1. Keep the Express backend running with `HOST=0.0.0.0` and port 8080.
2. Set `EXPO_PUBLIC_API_URL` in `.env` to a reachable backend address. Prefer a hosted HTTPS address for phone testing.
3. Run `npm install` then `npx expo start --go --lan --port 8082`.
4. On the same Wi-Fi, open Expo Go and scan the QR code shown by Expo. The prepared QR is `mobile-preview-qr.png`.
5. Request a fresh sign-in link. The email opens an HTTPS handoff page. On an installed native build, tap **Open Caremonitor** there. If the mail browser blocks the app handoff, open the page in Safari or Chrome, or use **Copy link for the app** and paste that copied link into the app's sign-in screen. Expo Go cannot register the native `aniprotech://` scheme, so use the copy-and-paste option for Expo Go.

The API address contains no secret. Never put database, SMTP or JWT credentials in this app or in EXPO_PUBLIC variables. Native access tokens and the device encryption key use Expo SecureStore. Pending visit records and photos are stored as separate encrypted files in the app's private storage; they remain until synchronisation or explicit discard at sign-out. Care profiles are fetched from the server. The app migrates pending records from the older SecureStore queue before replaying them. Do not uninstall the app while its sync status shows pending records.

## Checks

```powershell
npm run typecheck
npm run export
npx expo-doctor
```

Android and iOS JavaScript/Hermes export passed. No APK/IPA or physical-device test is claimed. See [the detailed update](../OPERATIONS-MOBILE-UPDATE.md) for verified features, limitations and dependency findings.

## Android APK cloud build

```powershell
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build --platform android --profile preview
```

Log in directly in your terminal; never put your password in chat or source code. The preview and production profiles point to the hosted HTTPS backend. The preview build does not require Metro.

Preview and production EAS builds use `https://backend.aniprotech.com`. The config rejects a local/plain-HTTP API in production. Android application id and iOS bundle identifier are `com.aniprotech.care`.

## iOS

The same source exports for iOS. Signed production builds use the existing Apple credentials stored with EAS. A local iOS build requires macOS/Xcode. Test the signed build on a physical iPhone and iPad before requesting App Review.

## Current mobile scope

### 1.0.3 daily operations update

Administrators can create and edit daily visits and caregiver assignments in the mobile Visits tab, and grant a caregiver client access in Clients. Revoke access on the web after reviewing existing visit assignments. Changes use the same backend records as the web roster and client care team. An assigned caregiver can see the next scheduled caregiver and all of tomorrow's assigned caregivers and times for a client from a visit detail. Care notes, incidents, medication records, visit attendance and photos continue to write to the shared backend and are visible to authorised web users after synchronisation. Offline visit mutations show their pending status; they are not visible on the web until replay succeeds.

Before check-in, opening a scheduled visit on its day starts foreground arrival monitoring for the assigned caregiver; the manual control can restart or stop it. With precise location permission, an accurate location sample within 100 metres of the client's configured primary address records a single arrival event and emails active administrators. Check-in and check-out each email active administrators with the client, caregiver, scheduled visit and time. These emails do not go to the client. Arrival monitoring requires that visit to remain open in the app and an internet connection; it does not monitor in the background. The caregiver should check the app's sync/error status when offline.

Version 1.0.4 (Android version code 9, iOS build 5) adds seven-day client handover visibility, previous notes, structured care observations, authorised care plan summaries, risks and documents, a caregiver timesheet from recorded attendance, and caregiver time-off requests with administrator decisions. Approved time off becomes an absence only after roster-conflict checks. Deploy the matching backend before distributing either build. A local export verifies JavaScript bundles, not device permissions, production email delivery or store release.

Version 1.0.5 (Android version code 10, iOS build 6) lets an assigned carer review client contact, access, allergy, preferences, care-plan and risk information before check-in; adds measured clinical observations and body-region skin observations to the shared web feed; shows medication application sites and requires an audited review acknowledgment before administration; and adds in-app care alerts and an account summary. A rostered carer can see that client without a separate care-team link unless access was explicitly revoked. The web medication form now records application sites. Photo uploads respect the organisation's setting. These features require the matching backend deployment. The body-region selector is textual; it is not a drawn anatomical diagram. Full finance administration, travel/mileage capture and push notifications remain outside this mobile release. Physical-device QA is still required before store submission.

Version 1.0.6 (Android version code 11, iOS build 7) opens a native Admin workspace after an administrator or superadministrator signs in. The Admin tab shows live organisation visit, client, staff and alert counts and navigates to native rota, client, team, inbox and reporting tools. Admins can create and edit client or staff profiles and update client care-plan guidance and risks within the mobile app. Caregiver sign-in keeps the caregiver tabs. Existing 1.0.5 installations do not gain this native workspace until updated to 1.0.6. Finance rates/documents, organisation settings and other advanced web controls are not yet editable in this mobile version; do not describe it as complete web-feature parity. Verify the new admin and caregiver flows on physical Android and iOS devices before store review.

The 1.0.7 source candidate (Android version code 12, iOS build 8) adds direct Client → Today's Visit navigation, an ordered client/care/delivery/recording/reporting/check-in visit view, caregiver visibility of assigned rota dates through day seven, fuller authorised safety and assessment details, approximate visual body-region guides alongside mandatory written medication-site review, camera or photo-library evidence, distinct concern categories with organisation-admin alerts, office announcements, and travel time and mileage claims on the caregiver timesheet for office approval. Out-of-radius check-in remains possible and writes an alert with the caregiver's optional explanation. Caregivers can view recorded availability and request extra hours from More; an administrator must approve those hours. Where the client QR setting is enabled, the caregiver must scan the current QR code before check-in. Clinical measurements now also have typed server records linked to the web feed. The My account card offers optional device authentication when returning to the app. A staff member can opt into generic device notifications for new rota assignments, office messages and care events; those alerts omit client and clinical details. Push delivery requires valid platform notification credentials and physical-device verification. Matching backend deployment is required. The body diagram is only an approximate region guide, never a substitute for the written prescription or care plan. A custom PIN and full admin/web feature parity are not in this candidate. Physical Android and iOS testing remains required before store release.

The shared Android/iOS app includes assigned visits, authorised client and care information, foreground-location check-in/check-out with configured-radius verification, agency-admin arrival alerts, due care tasks, medication instructions and eMAR, care records, concern alerts, reviewed voice-to-text dictation, private photo uploads, native admin daily tools, finance and accounting daily operations, team messaging, office announcements, and secure sign-in/out. Admins can edit organisation contact details and caregiver app settings in the native app. Some advanced web controls, including complete governance administration, remain outside the native app. Offline visit records and photos replay in order with retry identifiers; they only appear on the web after the server accepts them.

Voice recognition uses the device's native Android/iOS speech service and requires an EAS development or store build because it adds native code. Expo Go users can use the microphone button on the phone keyboard for dictation.

Foreground location, camera, photo-library, microphone and speech-recognition permission descriptions are declared for both store builds. An assigned caregiver opening today's scheduled visit starts its foreground arrival check after location permission; check-in starts an auditable foreground location trail for the active visit and checkout stops it. Photos can include capture time, coordinates and accuracy. A signed-in device checks its session and refreshes care data every five minutes while the app is active, and again when the app returns to the foreground. The user remains signed in until they sign out, an administrator revokes the device session, the account is disabled, or the organisation is suspended. Manual sign-out attempts to sync pending care records and warns before any remaining records are discarded.

Continuous/background location tracking and stored audio recordings remain disabled. Device notifications are opt-in and contain generic update text; their actual delivery depends on Apple/Google credentials configured for the signed build. Authentication is kept in the device keychain/keystore; assigned care profiles are fetched from the server. Pending offline visit entries are encrypted and must be synchronised before they appear on the web. Voice dictation converts speech to editable text and does not retain an audio recording.

## Local demo

- Admin: `admin@example.test`
- Carer: `carer@example.test`
- Sign-in is passwordless. Request a link, then open the newest message in the backend's local outbox.
- Scan `mobile-preview-qr.png` in Expo Go while the phone and this computer are on the same Wi-Fi.

## Browser preview for screen and role testing

Expo Web can show the same admin and caregiver screens at `http://localhost:8083`. Run it against an isolated local PGlite demo backend on port 8090 with `MAIL_MODE=outbox` and `CORS_ORIGINS=http://localhost:8083`; the seeded accounts above use fictional records. The browser preview keeps its demo session only within the current tab. When running this local preview, `EXPO_PUBLIC_API_URL` must be `http://127.0.0.1:8090` for the Expo process; the separate production build profiles still point to the hosted HTTPS backend.

The browser preview is for layout, role access, navigation and shared online API flows. It deliberately disables check-in, QR scanning, location tracking, camera capture, dictation, push notifications and device authentication. Encrypted offline care records and native email-to-app handoff also require an installed Android/iOS build. Do not use live client records in the demo database.
