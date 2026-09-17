export async function initializeSecurity(db) {
  for (const sql of [
    "ALTER TABLE node_sessions ADD COLUMN IF NOT EXISTS device_name text",
    "ALTER TABLE node_sessions ADD COLUMN IF NOT EXISTS ip_address text",
    "ALTER TABLE node_sessions ADD COLUMN IF NOT EXISTS user_agent text",
    "ALTER TABLE node_sessions ADD COLUMN IF NOT EXISTS created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP",
    "ALTER TABLE node_sessions ADD COLUMN IF NOT EXISTS last_seen_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP",
    "ALTER TABLE node_sessions ADD COLUMN IF NOT EXISTS mfa_verified_at timestamp",
  ]) await db.query(sql);
  await db.query(`CREATE TABLE IF NOT EXISTS node_mfa_settings (
    user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    secret_cipher text NOT NULL,
    enabled boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    enabled_at timestamp,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_privacy_requests (
    id uuid PRIMARY KEY, agency_id uuid NOT NULL, subject_user_id uuid NOT NULL REFERENCES users(id),
    kind text NOT NULL CHECK(kind IN ('EXPORT','CORRECTION','ERASURE')),
    status text NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN','IN_REVIEW','APPROVED','REJECTED','COMPLETED')),
    reason text NOT NULL, decision_reason text, requested_by uuid NOT NULL REFERENCES users(id),
    decided_by uuid REFERENCES users(id), created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_legal_holds (
    id uuid PRIMARY KEY, agency_id uuid NOT NULL, subject_user_id uuid NOT NULL REFERENCES users(id),
    reason text NOT NULL, active boolean NOT NULL DEFAULT true, created_by uuid NOT NULL REFERENCES users(id),
    released_by uuid REFERENCES users(id), created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    released_at timestamp
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_retention_policies (
    agency_id uuid PRIMARY KEY, care_records_days integer NOT NULL DEFAULT 2922,
    audit_days integer NOT NULL DEFAULT 2557, finance_days integer NOT NULL DEFAULT 2557,
    inactive_accounts_days integer NOT NULL DEFAULT 2557, updated_by uuid REFERENCES users(id),
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.query("CREATE INDEX IF NOT EXISTS node_privacy_requests_agency ON node_privacy_requests(agency_id,status,created_at)");
  await db.query("CREATE INDEX IF NOT EXISTS node_legal_holds_subject ON node_legal_holds(agency_id,subject_user_id,active)");
}
