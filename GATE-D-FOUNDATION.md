# Gate D production implementation

Gate D begins the product's quality, compliance, family-engagement, responsible-assistance and governed-reporting work. This first package is deliberately auditable and tenant scoped.

## Delivered

- Quality register for incidents, safeguarding matters, complaints and audit findings, with severity, ownership, due dates, revision-safe status changes and corrective actions.
- Policy register with versions, review dates, approval state and staff acknowledgements.
- Staff credential register with expiry and evidence references.
- Downloadable JSON evidence pack covering quality cases, policies, credentials, AI decisions and recent data-quality checks.
- Shared client portal scopes for secure two-way messages and consent-based feedback. Access remains time limited and revocable, and portal activity is recorded.
- Assistance review queue that cites source care-entry identifiers and records its method and limitations. Suggestions stay pending until an administrator approves or rejects them. A decision never changes a clinical record.
- Metric dictionary with owners and fixed definitions for visit completion, actual delivered hours, open quality cases and credential compliance.
- Repeatable checks for completed visits missing actual times, overdue quality cases and expired staff credentials.
- Governance dashboard at `/admin/governance` with evidence export and data-quality execution.

## Safety boundaries

- Every organisation query is scoped by `agency_id`.
- Portal capabilities require an explicit scope selected by an administrator after confirming permission to share.
- AI output is decision support only. It does not diagnose, assign risk, update care notes or trigger actions automatically.
- Existing API authentication, role checks, transactions and audit logging remain in force.

## Production controls delivered

- Working administration forms for cases, policies, credentials, evidence, review decisions, report schedules and release sign-offs.
- Revision-safe edits, corrective actions, configurable escalation targets and deduplicated reminder delivery.
- Private PDF, image and Word evidence uploads using the existing signed-download controls.
- Family portal messages, feedback consent, notification preferences and measurable response targets.
- AI model register, evaluation results, subgroup evidence, false-positive rates and approval gates. No external model is enabled by this change.
- Metric dictionary, period comparisons, completed-visit/finance reconciliation and scheduled email reports without client details.
- Care-manager, caregiver, client and family acceptance sign-off register so production approval cannot be implied without recorded evidence.

## Operational release evidence still required

Software completion does not manufacture real-world acceptance evidence. Before production promotion, authorised users must record passing sign-offs for all four personas, complete physical Android and iOS checks, confirm durable private file storage, and verify the deployed commit. Failed or blocked sign-offs must remain visible and prevent an internal release decision.
