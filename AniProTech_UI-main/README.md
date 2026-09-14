# AniProTech Care Monitor dashboard

React/Vite administration dashboard for clients, care plans, staff, roster, visits, inbox, care log, finance and reporting.

## Local development

Copy `.env.example` to `.env.development.local`, use a local API URL, then run `npm ci` and `npm run dev`.

## Production

The dashboard address is `https://caremonitor.aniprotech.com` and the API is `https://backend.aniprotech.com`.

Set these Railway variables before deployment:

- `VITE_APP_BASE_LIVE_URL=https://backend.aniprotech.com`
- `VITE_APP_MAP_API_KEY` using a Google Maps browser key restricted to `https://caremonitor.aniprotech.com/*`
- `VITE_APP_SECRET_KEY` using a generated application storage key

Railway builds the supplied Dockerfile and serves the SPA through nginx. Browser routes fall back to `index.html`; `/health` is available for service checks.

Run `npm ci`, `npm run lint`, and `npm run build` before release.

Every `VITE_` value is visible in the final JavaScript bundle. Never place database, SMTP, JWT or signing credentials in these variables.
