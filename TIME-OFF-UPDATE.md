# Time off — 8 September 2026

Team sidebar now includes Time off. The page follows the supplied reference with a year selector, holiday-year notice/settings, booking toolbar, Upcoming time off, Days taken and Cancelled time off.

Admins can book full-day or timed absences, select a leave type, record a reason, and cancel with confirmation. All schedule times use Europe/London. Existing absence records are reused, so bookings appear in Availability and prevent overlapping Roster visits. Booking also rejects overlaps with existing active absences. Cancellation now soft-deletes absences and preserves history; previously permanently deleted records cannot be recovered.

Holiday-year start month/day is agency-wide. Default display is January–December until configured. Leap-day starts are rejected; bookings crossing a year boundary appear in both relevant years. Existing dates are not moved by settings changes. Days taken lists completed absence periods; it does not calculate statutory holiday entitlement, working-day deductions or payroll balances. Caregivers can view their own records; booking/cancellation/settings remain admin actions. No employee approval-request workflow was added.

Validation: updated Roster and integration suites passed (27 tests), covering year boundaries, cancellation history, rebooking, permission restrictions, invalid dates and overlap checks. Frontend lint and build passed, with the existing bundle-size warning. Browser test uses a live read and fictional intercepted writes to avoid changing staff leave or agency settings. Screenshots are in time-off-checks; test script is backend/scripts/check-time-off.js.

The holiday-year table is initialized in the configured database and on future full schema initialization. The local backend has been restarted. No real staff leave was created during testing.

## Enhanced year selector
The custom dropdown shows full date ranges, newest first: next holiday year, current holiday year and the previous four. Show older years adds five at a time; Current holiday year uses the agency start date and London current date. Selected years are highlighted. Arrow keys, Home/End, Escape and outside clicks are supported. Custom holiday years display complete start/end dates. Section badges show booking counts, not entitlement balances. Frontend build and targeted lint passed. Repeatable browser check: scripts/check-time-off-years.js.

