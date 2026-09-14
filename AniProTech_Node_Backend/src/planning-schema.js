export async function initializePlanning(db) {
  await db.query(
    `CREATE TABLE IF NOT EXISTS node_roster_assets(id uuid PRIMARY KEY,agency_id uuid NOT NULL,kind text NOT NULL,name text NOT NULL,payload jsonb NOT NULL,created_by uuid REFERENCES users(id),created_at timestamptz DEFAULT CURRENT_TIMESTAMP)`,
  );
  await db.query(
    `CREATE TABLE IF NOT EXISTS node_roster_previews(id uuid PRIMARY KEY,agency_id uuid NOT NULL,actor_id uuid NOT NULL,payload jsonb NOT NULL,expires_at timestamptz NOT NULL,used_at timestamptz)`,
  );
  await db.query(
    "CREATE INDEX IF NOT EXISTS node_roster_assets_agency ON node_roster_assets(agency_id,name)",
  );
  await db.query(
    "CREATE INDEX IF NOT EXISTS node_roster_previews_expiry ON node_roster_previews(expires_at)",
  );
}
