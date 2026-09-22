export async function initializeSharing(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS node_share_grants (
  id uuid PRIMARY KEY,client_id uuid NOT NULL UNIQUE REFERENCES users(id),agency_id uuid NOT NULL,
  code_hash text NOT NULL,code_cipher text NOT NULL,scopes jsonb NOT NULL,revision integer NOT NULL DEFAULT 1,
  expires_at timestamptz NOT NULL,revoked_at timestamptz,created_by uuid NOT NULL REFERENCES users(id),
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,last_email_at timestamptz,
  failed_attempts integer NOT NULL DEFAULT 0,attempt_window timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
 )`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_share_links (
  id uuid PRIMARY KEY,grant_id uuid NOT NULL REFERENCES node_share_grants(id),revision integer NOT NULL,
  secret_hash text NOT NULL UNIQUE,email text NOT NULL,expires_at timestamptz NOT NULL,used_at timestamptz
 )`);
  await db.query(`ALTER TABLE node_share_links
    ADD COLUMN IF NOT EXISTS recipient_name text,
    ADD COLUMN IF NOT EXISTS access_level text NOT NULL DEFAULT 'FULL',
    ADD COLUMN IF NOT EXISTS scopes jsonb`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_share_sessions (
  id uuid PRIMARY KEY,grant_id uuid NOT NULL REFERENCES node_share_grants(id),revision integer NOT NULL,
  secret_hash text NOT NULL UNIQUE,viewer_name text NOT NULL,viewer_email text NOT NULL,method text NOT NULL,
  expires_at timestamptz NOT NULL,revoked_at timestamptz
 )`);
  await db.query("ALTER TABLE node_share_sessions ADD COLUMN IF NOT EXISTS scopes jsonb");
  await db.query(`CREATE TABLE IF NOT EXISTS node_share_history (
  id uuid PRIMARY KEY,grant_id uuid NOT NULL REFERENCES node_share_grants(id),action text NOT NULL,
  actor_name text NOT NULL,actor_email text NOT NULL DEFAULT '',created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
 )`);
  await db.query(
    "CREATE INDEX IF NOT EXISTS node_share_history_grant ON node_share_history(grant_id,created_at)",
  );
}
