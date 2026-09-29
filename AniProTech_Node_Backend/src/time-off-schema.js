export async function initializeTimeOff(db) {
 await db.query(`CREATE TABLE IF NOT EXISTS node_holiday_year (agency_id uuid PRIMARY KEY,start_month integer NOT NULL,start_day integer NOT NULL,updated_by uuid REFERENCES users(id),updated_at timestamptz DEFAULT CURRENT_TIMESTAMP)`);
 await db.query(`CREATE TABLE IF NOT EXISTS node_time_off_requests (
  id uuid PRIMARY KEY,agency_id uuid NOT NULL,staff_id uuid NOT NULL REFERENCES users(id),
  start_date date NOT NULL,end_date date NOT NULL,start_time time NOT NULL,end_time time NOT NULL,
  type text NOT NULL,reason text NOT NULL DEFAULT '',status text NOT NULL DEFAULT 'PENDING',
  decided_by uuid REFERENCES users(id),decision_note text,absence_id uuid,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT node_time_off_request_dates CHECK(end_date>=start_date),
  CONSTRAINT node_time_off_request_status CHECK(status IN ('PENDING','APPROVED','DECLINED'))
 )`);
 await db.query("CREATE INDEX IF NOT EXISTS node_time_off_requests_agency_status ON node_time_off_requests(agency_id,status,created_at DESC)");
 await db.query(`CREATE TABLE IF NOT EXISTS node_availability_requests (
  id uuid PRIMARY KEY,agency_id uuid NOT NULL,staff_id uuid NOT NULL REFERENCES users(id),
  start_date date NOT NULL,end_date date NOT NULL,start_time time NOT NULL,end_time time NOT NULL,
  reason text NOT NULL DEFAULT '',status text NOT NULL DEFAULT 'PENDING',
  decided_by uuid REFERENCES users(id),decision_note text,availability_id uuid,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT node_availability_request_dates CHECK(end_date>=start_date),
  CONSTRAINT node_availability_request_status CHECK(status IN ('PENDING','APPROVED','DECLINED'))
 )`);
 await db.query("CREATE INDEX IF NOT EXISTS node_availability_requests_agency_status ON node_availability_requests(agency_id,status,created_at DESC)");
}
