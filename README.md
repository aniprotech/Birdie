# AniProTech Care Platform

Production-oriented care management platform containing:

- `AniProTech_UI-main`: React/Vite administration dashboard for `caremonitor.aniprotech.com`
- `AniProTech_Node_Backend`: Node.js/Express API for `backend.aniprotech.com`
- `AniProTech_Mobile`: Expo/React Native carer app for Android and iOS

Start with [the production readiness report](PRODUCTION-READINESS.md), then follow [the Railway deployment guide](RAILWAY-DEPLOYMENT.md) and [release checklist](RELEASE-CHECKLIST.md).

Local `.env` files, databases, uploads, mail outboxes, signing credentials and generated builds are excluded from Git. Use the `.env.example` files as variable inventories and store real production values in Railway and EAS.
