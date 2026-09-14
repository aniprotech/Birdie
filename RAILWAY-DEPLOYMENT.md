# Railway deployment

Create one Railway project with two services connected to the Git repository.

## API service

- Root directory: `/AniProTech_Node_Backend`
- Railway config file: `/AniProTech_Node_Backend/railway.json`
- Custom domain: `backend.aniprotech.com`
- Health check: `/api/health`
- Add Railway PostgreSQL and use its `DATABASE_URL`.
- Set `NODE_ENV=production`, `DB_DRIVER=postgres`, `HOST=0.0.0.0`, `FRONTEND_URL=https://caremonitor.aniprotech.com`, `CORS_ORIGINS=https://caremonitor.aniprotech.com`, `TRUST_PROXY=true`, a random `JWT_SECRET` of at least 32 characters, and the SMTP variables.
- Mount a persistent volume at `UPLOAD_DIR`, or configure durable object storage before live file uploads.

## Dashboard service

- Root directory: `/AniProTech_UI-main`
- Railway config file: `/AniProTech_UI-main/railway.json`
- Custom domain: `caremonitor.aniprotech.com`
- Health check: `/health`
- Set `VITE_APP_BASE_LIVE_URL=https://backend.aniprotech.com`, a domain-restricted `VITE_APP_MAP_API_KEY`, and a generated `VITE_APP_SECRET_KEY`.

## DNS and verification

Add the DNS records Railway provides for both domains. After Railway issues TLS certificates, verify:

- `https://backend.aniprotech.com/api/health`
- `https://caremonitor.aniprotech.com/login`
- Passwordless email login and return link
- Authenticated clients, team, roster, inbox, logs, finance and reporting
- Android/iOS preview build login and visit workflow

Never copy local `.env` files into Railway or Git. Enter rotated production values through Railway variables.
