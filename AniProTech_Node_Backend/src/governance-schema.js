export async function initializeGovernance(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS node_quality_cases (
    id uuid PRIMARY KEY, agency_id uuid NOT NULL, client_id uuid REFERENCES users(id),
    kind text NOT NULL CHECK(kind IN ('INCIDENT','SAFEGUARDING','COMPLAINT','AUDIT_FINDING')),
    severity text NOT NULL CHECK(severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    title text NOT NULL, description text NOT NULL,
    status text NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN','INVESTIGATING','ACTION_REQUIRED','CLOSED')),
    owner_id uuid REFERENCES users(id), due_at timestamptz, revision integer NOT NULL DEFAULT 1,
    created_by uuid NOT NULL REFERENCES users(id), closed_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at timestamptz
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_quality_actions (
    id uuid PRIMARY KEY, case_id uuid NOT NULL REFERENCES node_quality_cases(id) ON DELETE CASCADE,
    title text NOT NULL, owner_id uuid REFERENCES users(id), due_at timestamptz,
    status text NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN','DONE','VOID')),
    evidence text, created_by uuid NOT NULL REFERENCES users(id), completed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_policy_register (
    id uuid PRIMARY KEY, agency_id uuid NOT NULL, title text NOT NULL, version text NOT NULL,
    status text NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','ACTIVE','RETIRED')),
    effective_at date, review_at date, document_url text, approved_by uuid REFERENCES users(id),
    approved_at timestamptz, created_by uuid NOT NULL REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_policy_acknowledgements (
    policy_id uuid NOT NULL REFERENCES node_policy_register(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id), acknowledged_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(policy_id,user_id)
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_staff_credentials (
    id uuid PRIMARY KEY, agency_id uuid NOT NULL, staff_id uuid NOT NULL REFERENCES users(id),
    kind text NOT NULL, reference text, issued_at date, expires_at date,
    status text NOT NULL DEFAULT 'VALID' CHECK(status IN ('VALID','SUSPENDED','REVOKED')),
    evidence_url text, revision integer NOT NULL DEFAULT 1, created_by uuid NOT NULL REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_ai_reviews (
    id uuid PRIMARY KEY, agency_id uuid NOT NULL, client_id uuid NOT NULL REFERENCES users(id),
    kind text NOT NULL CHECK(kind IN ('NOTE_SUMMARY','RISK_SIGNAL')),
    suggestion text NOT NULL, evidence jsonb NOT NULL, model_info jsonb NOT NULL,
    status text NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','APPROVED','REJECTED')),
    created_by uuid NOT NULL REFERENCES users(id), reviewed_by uuid REFERENCES users(id),
    decision_reason text, created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, reviewed_at timestamptz
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_metric_definitions (
    agency_id uuid NOT NULL, metric_key text NOT NULL, label text NOT NULL, definition text NOT NULL,
    owner text NOT NULL, active boolean NOT NULL DEFAULT true, updated_by uuid REFERENCES users(id),
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(agency_id,metric_key)
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_data_quality_runs (
    id uuid PRIMARY KEY, agency_id uuid NOT NULL, status text NOT NULL,
    findings jsonb NOT NULL, created_by uuid NOT NULL REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_portal_messages (
    id uuid PRIMARY KEY, grant_id uuid NOT NULL REFERENCES node_share_grants(id) ON DELETE CASCADE,
    agency_id uuid NOT NULL, client_id uuid NOT NULL REFERENCES users(id), sender_type text NOT NULL,
    sender_name text NOT NULL, body text NOT NULL, created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_portal_feedback (
    id uuid PRIMARY KEY, grant_id uuid NOT NULL REFERENCES node_share_grants(id) ON DELETE CASCADE,
    agency_id uuid NOT NULL, client_id uuid NOT NULL REFERENCES users(id), rating integer NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment text, consented_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  for (const sql of [
    "CREATE INDEX IF NOT EXISTS node_quality_cases_agency ON node_quality_cases(agency_id,status,due_at)",
    "CREATE INDEX IF NOT EXISTS node_credentials_agency ON node_staff_credentials(agency_id,expires_at)",
    "CREATE INDEX IF NOT EXISTS node_ai_reviews_agency ON node_ai_reviews(agency_id,status,created_at)",
    "CREATE INDEX IF NOT EXISTS node_portal_messages_grant ON node_portal_messages(grant_id,created_at)"
  ]) await db.query(sql);
}
