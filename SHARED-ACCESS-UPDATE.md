# Share Access — 8 September 2026

Implemented in the existing React frontend and Express backend. The configured PostgreSQL database has the sharing tables, and the local backend has been restarted.

## Using it

Open a client > Share Access. Select Basic information, Medical history and allergies, and/or Care notes, observations and activities. Choose an expiry, confirm authority to share, then generate a code. Copy the website link and access code to give the recipient access to the read-only AniProTech portal.

Admins can replace a code, revoke all access, print access details (including Save as PDF through the browser), and review the latest 100 access events. Replacing a code invalidates earlier codes, email links and portal sessions. Revocation is enforced on every portal request; an already open page checks again every minute.

Client email links use the client's saved address and require an explicit Send email action. Links expire after 15 minutes and can be used once. Dummy .test addresses are disabled. Email generation and redemption were tested using captured mail, without delivering client emails.

## Limits and controls

- Sharing expiry: 1–30 days, seven days by default. Portal sessions: at most one hour and never beyond the sharing expiry.
- Agency admins manage sharing. Portal credentials cannot access staff APIs. Records are restricted to the client and sections selected in the grant.
- Basic details exclude property access instructions and geolocation. Medical sharing exposes the medical history and allergies fields. Care log excludes internal alerts and actions.
- Codes are randomly generated, hashed for verification and encrypted for admin recovery. Email and portal session tokens are stored as hashes. Repeated failed attempts are limited.
- Names and email addresses supplied by code users are self-reported; the history labels them accordingly.
- The current 127.0.0.1 website link works on this computer only. External sharing requires reachable hosted frontend/backend addresses and an updated frontend URL configuration. Public deployment has not been performed.
- Printing is available through the browser; generating a code does not automatically download a PDF.

## Verification

- Backend: 59 tests passed, including sharing scope restrictions, agency isolation, expiry, replay rejection, replacement, revocation, attempt limits and logout.
- Route compatibility: all 210 original Java routes retained; 250 Express routes detected.
- Frontend production build and targeted sharing component lint passed. Existing bundle-size warning remains.
- Chrome check against the configured database: generated dummy access, opened scoped records, checked desktop/mobile layout, verified access history and rejected access after revocation. No browser JavaScript errors.
- Test sharing was revoked afterwards. No real client details were changed and no client email was sent.

Files: frontend `src/pages/Clients/ViewClients/ShareAccessPanel.jsx`, `src/pages/Portal/ClientPortal.jsx`; backend `src/services/share-access.js`, `src/share-schema.js`. Repeatable browser check: backend `scripts/check-share-access.js` (uses only the dummy client). Screenshots: `sharing-screen-checks/`.
