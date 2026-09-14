export async function initializeRoster(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS node_team_groups (
    user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    groups jsonb NOT NULL DEFAULT '[]'::jsonb
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_team_feed (
    id uuid PRIMARY KEY, agency_id uuid NOT NULL, user_id uuid NOT NULL REFERENCES users(id),
    kind text NOT NULL CHECK(kind IN ('NOTE','CONCERN','ACTION')), body text NOT NULL,
    status text NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN','RESOLVED')),
    created_by uuid NOT NULL REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_by uuid REFERENCES users(id), resolved_at timestamptz
  )`);
  await db.query(
    "CREATE INDEX IF NOT EXISTS node_team_feed_user ON node_team_feed(agency_id,user_id,created_at)",
  );
  await db.query(`CREATE TABLE IF NOT EXISTS node_roster_visits (
    id uuid PRIMARY KEY, agency_id uuid NOT NULL, client_id uuid NOT NULL REFERENCES users(id),
    staff_id uuid REFERENCES users(id), visit_date date NOT NULL,
    start_time time NOT NULL, end_time time NOT NULL CHECK(end_time > start_time),
    title text NOT NULL, notes text NOT NULL DEFAULT '',
    status text NOT NULL CHECK(status IN ('DRAFT','SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED')),
    revision integer NOT NULL DEFAULT 1, created_by uuid NOT NULL REFERENCES users(id),
    updated_by uuid NOT NULL REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK(status NOT IN ('SCHEDULED','IN_PROGRESS','COMPLETED') OR staff_id IS NOT NULL)
  )`);
  await db.query(
    "CREATE INDEX IF NOT EXISTS node_roster_agency_date ON node_roster_visits(agency_id,visit_date)",
  );
}
