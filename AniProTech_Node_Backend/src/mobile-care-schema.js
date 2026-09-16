export async function initializeMobileCare(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS node_visit_attendance (
    id uuid PRIMARY KEY, visit_id uuid NOT NULL REFERENCES node_roster_visits(id) ON DELETE CASCADE,
    actor_id uuid NOT NULL REFERENCES users(id), event text NOT NULL CHECK(event IN ('CHECK_IN','CHECK_OUT')),
    latitude double precision, longitude double precision, accuracy double precision,
    source text NOT NULL DEFAULT 'MOBILE', created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.query("CREATE INDEX IF NOT EXISTS node_visit_attendance_visit ON node_visit_attendance(visit_id,created_at)");
  await db.query("ALTER TABLE node_visit_attendance ADD COLUMN IF NOT EXISTS distance_metres integer, ADD COLUMN IF NOT EXISTS within_radius boolean");
  await db.query(`CREATE TABLE IF NOT EXISTS node_visit_attachments (
    id uuid PRIMARY KEY, agency_id uuid NOT NULL, visit_id uuid NOT NULL REFERENCES node_roster_visits(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES users(id), file_url text NOT NULL, file_name text NOT NULL, mime_type text NOT NULL,
    caption text NOT NULL DEFAULT '', created_by uuid NOT NULL REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.query("CREATE INDEX IF NOT EXISTS node_visit_attachments_visit ON node_visit_attachments(visit_id,created_at)");
  await db.query(`CREATE TABLE IF NOT EXISTS node_medication_administrations (
    id uuid PRIMARY KEY, agency_id uuid NOT NULL, client_event_id uuid NOT NULL,
    visit_id uuid NOT NULL REFERENCES node_roster_visits(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES users(id), medication_id uuid NOT NULL REFERENCES client_medications_scheduling(id),
    actor_id uuid NOT NULL REFERENCES users(id), outcome text NOT NULL CHECK(outcome IN ('ADMINISTERED','PRN_ADMINISTERED','REFUSED','NOT_AVAILABLE','OMITTED')),
    slot text NOT NULL, dose_given text NOT NULL DEFAULT '', reason text NOT NULL DEFAULT '', note text NOT NULL DEFAULT '',
    prn_effect text NOT NULL DEFAULT '', witnessed_by uuid REFERENCES users(id), occurred_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agency_id,client_event_id), UNIQUE(visit_id,medication_id,slot)
  )`);
  await db.query("CREATE INDEX IF NOT EXISTS node_medication_administrations_visit ON node_medication_administrations(visit_id,occurred_at,id)");
  await db.query("CREATE INDEX IF NOT EXISTS node_medication_administrations_client ON node_medication_administrations(client_id,occurred_at,id)");
}
