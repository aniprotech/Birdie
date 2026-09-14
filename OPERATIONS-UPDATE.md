# Team Operations — 8 September 2026

Operations now matches the reference: centred Travel information and Rates sections, simple bordered rows and separate Edit buttons. Editors load from the backend even on direct navigation or refresh, permit clearing optional values, retain unrelated section data, and show save errors. Rate labels accept reusable existing suggestions or a custom label; they do not change the separate Finance pay amounts.

Backend changes restrict operations to staff records, enforce admin writes, validate lengths and transport methods, allowlist editable fields, and lock the user row when creating/updating the singleton. No schema migration required.

Validation: 15 integration tests passed including travel/rate round trips, partial-update preservation, clearing optional fields and invalid-value rejection. Frontend lint and production build passed (existing bundle warning). Browser verification uses a live read and intercepted fictional save values to avoid altering staff records; see backend scripts/check-operations.js and operations-checks screenshots.
