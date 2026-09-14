# Care log update

The Log navigation now opens a three-column care log with status counts, date range (last seven days by default, up to 31 days), carer groups, client activity status, client/carer filters, search, pagination and refresh. Only in-progress and completed visits appear. The separate audit history remains accessible.

Selecting a visit reuses the existing Details, Alerts, Activities, Observations, Care team and Timeline interface. Attendance corrections and entries continue to use existing revision checks, permissions and history. No clinical records or notification settings were changed during verification.

Print / Save PDF exports all matching visit summaries across pages, limited to 3,000 visits with an explicit error if exceeded. It opens the browser print dialog; choose Save as PDF. This is a summary export of schedule, duration and recorded counts, not a full care-note export. Cancelled and future scheduled visits remain in Roster/Visits.

Validation: production build passed (existing large bundle warning); 17 sequential backend tests passed; browser fixture checks passed for selection, all six tabs and mobile width. Browser tests use fictional records without changing real visits. Files under log-checks contain verification screenshots.
