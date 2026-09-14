# AniProTech Mobile

React Native / Expo SDK 57 app for Android and iOS. Shares the Express backend and PostgreSQL accounts with the web application.

## Run on the same Wi-Fi

1. Keep the Express backend running with `HOST=0.0.0.0` and port 8080.
2. Set `EXPO_PUBLIC_API_URL` in `.env` to a reachable backend address. Prefer a hosted HTTPS address for phone testing.
3. Run `npm install` then `npx expo start --go --lan --port 8082`.
4. On the same Wi-Fi, open Expo Go and scan the QR code shown by Expo. The prepared QR is `mobile-preview-qr.png`.
5. Request a sign-in link. For Expo Go, paste the complete emailed link into the app if tapping the link does not open it. Installed native builds register `aniprotech://login`.

The API address contains no secret. Never put database, SMTP or JWT credentials in this app or in EXPO_PUBLIC variables. Native access tokens use Expo SecureStore; client records are not stored offline. The web fallback, if added later, keeps tokens only in memory.

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

Log in directly in your terminal; never put your password in chat or source code. The preview profile currently embeds the local Wi-Fi API address. It will only work on that network while this PC is running. Change the profile environment to your reachable HTTPS API for remote testers. The preview build does not require Metro.

Preview and production EAS builds use `https://backend.aniprotech.com`. The config rejects a local/plain-HTTP API in production. Android application id and iOS bundle identifier are `com.aniprotech.care`; confirm these before the first store release.

## iOS

The same source exports for iOS. A signed device build requires Apple signing configuration through EAS; a local iOS build requires macOS/Xcode. There is no Apple Developer account configured yet. iOS Expo Go testing can be done before store distribution is set up.

## Current mobile scope

The shared Android/iOS app includes assigned daily visits, authorised client and address details, required foreground-location check-in/check-out with configured-radius verification, admin arrival alerts and a non-clinical client arrival email, due care tasks, active medication instructions, visit notes, incident alerts, reviewed voice-to-text dictation, reviewable assistive summaries, private camera photo uploads, team directory, internal messaging, secure sign-in/out, and read-only administrator summaries. Full finance and roster management remain on the web.

Voice recognition uses the device's native Android/iOS speech service and requires an EAS development or store build because it adds native code. Expo Go users can use the microphone button on the phone keyboard for dictation.

Continuous/background location tracking, offline clinical record synchronisation, stored audio recordings and remote push delivery remain disabled until purpose, consent, retention, device-management, notification credentials, battery-use and conflict policies are approved. Authentication is kept in the device keychain/keystore; assigned care records are fetched from the server. Voice dictation converts speech to editable text and does not retain an audio recording.

## Local demo

- Admin: `admin@example.test`
- Carer: `carer@example.test`
- Sign-in is passwordless. Request a link, then open the newest message in the backend's local outbox.
- Scan `mobile-preview-qr.png` in Expo Go while the phone and this computer are on the same Wi-Fi.
