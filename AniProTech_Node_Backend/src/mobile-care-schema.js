export async function initializeMobileCare(db) {
  await db.query(`ALTER TABLE client_medications_scheduling
    ADD COLUMN IF NOT EXISTS is_controlled_drug boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS requires_witness boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS stock_tracking_enabled boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS stock_quantity numeric NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS stock_unit text NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS low_stock_threshold numeric NOT NULL DEFAULT 0`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_visit_attendance (
    id uuid PRIMARY KEY, visit_id uuid NOT NULL REFERENCES node_roster_visits(id) ON DELETE CASCADE,
    actor_id uuid NOT NULL REFERENCES users(id), event text NOT NULL CHECK(event IN ('CHECK_IN','CHECK_OUT')),
    latitude double precision, longitude double precision, accuracy double precision,
    source text NOT NULL DEFAULT 'MOBILE', created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.query("CREATE INDEX IF NOT EXISTS node_visit_attendance_visit ON node_visit_attendance(visit_id,created_at)");
  await db.query("ALTER TABLE node_visit_attendance ADD COLUMN IF NOT EXISTS distance_metres integer, ADD COLUMN IF NOT EXISTS within_radius boolean, ADD COLUMN IF NOT EXISTS client_event_id uuid");
  await db.query("CREATE UNIQUE INDEX IF NOT EXISTS node_visit_attendance_event ON node_visit_attendance(client_event_id) WHERE client_event_id IS NOT NULL");
  await db.query("ALTER TABLE node_client_entries ADD COLUMN IF NOT EXISTS client_event_id uuid");
  await db.query("CREATE UNIQUE INDEX IF NOT EXISTS node_client_entries_event ON node_client_entries(agency_id,client_event_id) WHERE client_event_id IS NOT NULL");
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
    prn_effect text NOT NULL DEFAULT '', witnessed_by uuid REFERENCES users(id), quantity_given numeric,
    stock_before numeric, stock_after numeric, occurred_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agency_id,client_event_id), UNIQUE(visit_id,medication_id,slot)
  )`);
  await db.query("CREATE INDEX IF NOT EXISTS node_medication_administrations_visit ON node_medication_administrations(visit_id,occurred_at,id)");
  await db.query("CREATE INDEX IF NOT EXISTS node_medication_administrations_client ON node_medication_administrations(client_id,occurred_at,id)");
  await db.query("ALTER TABLE node_medication_administrations ADD COLUMN IF NOT EXISTS quantity_given numeric, ADD COLUMN IF NOT EXISTS stock_before numeric, ADD COLUMN IF NOT EXISTS stock_after numeric");
  await db.query(`CREATE TABLE IF NOT EXISTS node_medication_administration_corrections (
    id uuid PRIMARY KEY, administration_id uuid NOT NULL REFERENCES node_medication_administrations(id),
    agency_id uuid NOT NULL, actor_id uuid NOT NULL REFERENCES users(id), reason text NOT NULL,
    replacement jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.query("CREATE INDEX IF NOT EXISTS node_medication_corrections_administration ON node_medication_administration_corrections(administration_id,created_at,id)");
}
