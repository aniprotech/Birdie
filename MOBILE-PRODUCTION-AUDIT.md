# Caremonitor Android and iOS production audit

## Verified in source and automated checks

- Expo SDK 57 dependencies match the versions required by the installed SDK.
- Android package and iOS bundle identifier are `com.aniprotech.care`.
- Production API is `https://backend.aniprotech.com`; clear-text traffic is disabled in production.
- Access tokens use the native keychain/keystore through Expo SecureStore.
- Five-minute inactivity expiry is enforced by the backend and both clients. Mobile background time counts as inactivity.
- Inactivity logout retains encrypted, caregiver-owned offline visit mutations. Manual logout clears them.
- Foreground location is requested only for visit check-in and check-out.
- Camera/photo access is requested when attaching authorised visit evidence.
- Voice dictation converts speech to editable text and does not retain audio.
- Native permission descriptions exist for location, camera, photos, microphone and speech recognition.
- Android and iOS JavaScript/Hermes exports complete successfully.
- TypeScript, offline queue tests and all 21 Expo Doctor checks pass.

## Deliberately disabled

- Continuous or background location tracking.
- Stored voice recordings.
- Automatic clinical decisions or unsupervised AI changes.
- Remote push delivery until store credentials and notification policies are configured.

## External release evidence still required

- Install and exercise a signed Android build on supported physical devices.
- Install and exercise a signed iOS build on supported physical devices.
- Verify camera, location, speech recognition, deep links and five-minute expiry on both platforms.
- Complete accessibility checks with TalkBack and VoiceOver.
- Configure Apple and Google signing, privacy declarations and store listings.
- Record caregiver and administrator acceptance evidence in Governance release sign-offs.

`npm audit --omit=dev` reports moderate findings in Expo build/configuration tooling. It reports no high or critical findings. Its suggested automatic fixes downgrade or jump to incompatible Expo versions, so they were not applied. Reassess these findings during the next supported Expo SDK upgrade.
