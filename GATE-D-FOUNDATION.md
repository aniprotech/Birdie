# Gate D foundation

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

## Remaining Gate D work

- Full creation and editing forms for every register, policy distribution reminders and evidence-file uploads.
- Configurable escalation workflows and regulator-specific evidence templates.
- Family notification preferences and moderation/response service levels.
- Validated model evaluation datasets, bias and false-positive monitoring, model-change approval and production drift alerts before any external model is introduced.
- Broader metric lineage, period comparisons, scheduled report delivery and independent reconciliation against finance/payroll exports.
- User acceptance testing with care managers, carers, clients and authorised family members.
