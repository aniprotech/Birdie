# Client profile and feed update — 8 September 2026

The supplied screenshots were used as workflow references. Their real client and care information was not copied into AniProTech. Testing uses the existing Dummy Client record.

## Available locally

- Shared Add/Edit Client form with direct-URL loading, middle name, contact details, multiple addresses, optional photograph, and multi-paragraph Highlights/past history (20,000 characters).
- Phone numbers preserve leading zeros. Email, date of birth, phone type, photograph, map coordinates and radius are validated. Only profile fields are submitted, so editing the profile does not replace care contacts or other related records.
- Basic Information displays the photograph, middle name, age, complete primary address, additional addresses, map link, access details, configured check-in radius and past history.
- Client Information → Agency Admin includes editable client, NHS and local-authority identifiers. Partial identifier updates retain other client information. Information displays preserve free text and paragraph breaks, display boolean values correctly, and show all saved contacts.
- Client Feed reads saved roster visits and notes, alerts and actions. It has counts, search, date filters and pagination. A selected visit has Details, Alerts, Activities, Observations, Care team and Timeline tabs.
- Details shows planned/actual attendance and address. Start/complete record actual timestamps. Administrators can correct past attendance with a reason, retained in the timeline.
- Notes, observations, alerts, actions and activities can be created and edited. Every saved version is retained with author/time; stale edits are rejected. Alerts/actions can be resolved; activities can be pending, completed or not completed.
- Care team shows the assigned carer and client care-team links. Administrators can choose an alternative for draft/scheduled visits; roster availability, absence and overlap checks still apply.
- Timeline records new schedule changes, status changes, attendance corrections and visit entry changes. Historical events that were never recorded are not fabricated.
- All times display in Europe/London. Ambiguous/nonexistent local times during clock changes are rejected by manual attendance entry.
- Small screens use a client-section selector instead of a sidebar that consumes the available width.

## Verification

- Full backend suite: 41 passing tests, including profile round trips, cross-agency/client permissions, all entry types, history, stale edits, attendance and timestamp serialization.
- Frontend production build passed; existing large-bundle warning remains.
- Targeted lint passed for the new profile, identifiers and feed components.
- Browser checks against the configured PostgreSQL backend exercised direct profile editing, identifier saving, six visit tabs and note-history display. Screenshots are in `client-screen-checks`.
- The additive schema update has been applied and the backend restarted.
- Retained demo: Dummy Client, an unassigned DRAFT visit named “DUMMY TEST — client feed preview”, and clearly labelled fictional note, alert, action, activity and observation. The draft is not eligible for completed-visit invoicing.

## Boundaries for the next iteration

This implements the visible workflows, not every Birdie capability. Check-in zone settings are stored, but GPS enforcement is not connected yet. Attendance is manual. Alerts are manually recorded; an automatic late/missed-visit rule engine is not included. Activities are entered per visit rather than automatically generated from recurring task or medication plans. Visits currently have one assigned carer; multiple simultaneous carers, preferred-carer ranking and 90-day matching statistics remain separate work. No production deployment or native mobile build was performed in this update.

## Development entry points

- Frontend: `AniProTech_UI-main/src/pages/Clients/CreateClients/ClientForm.jsx`
- Feed UI: `AniProTech_UI-main/src/pages/Clients/ViewClients/CarerFeed/LiveClientFeed.jsx`
- Feed API: `AniProTech_Node_Backend/src/services/client-feed.js`
- Schema: `AniProTech_Node_Backend/src/client-feed-schema.js`
- Tests: `AniProTech_Node_Backend/test/client-feed.test.js`
- Local demo/browser check: `AniProTech_Node_Backend/scripts/check-client-screens.js` (uses a separate test session, sends no email).

## Visit-selection follow-up

Clicking a feed card highlights it and loads only that record into the right-hand panel. The first available record opens automatically. Switching clears the previous details, closes record-specific dialogs and returns to Details; cancelled requests cannot overwrite the new selection. Loading failures have a Retry control. On phones, selection scrolls to the details panel.

Details now includes separate Planned/Actuals, Client location, Alerts, Care team, Check in and Check out cards. Manual attendance controls use the selected visit and existing permissions. Missing attendance is shown as not recorded, never as GPS-verified attendance.

Focused browser verification passed for three existing dummy-client visits with different dates and observations, rapid switching with a delayed request, and retry after a simulated failed load. The frontend build and targeted lint passed.
