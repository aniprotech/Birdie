export async function initializeTimeOff(db) {
 await db.query(`CREATE TABLE IF NOT EXISTS node_holiday_year (agency_id uuid PRIMARY KEY,start_month integer NOT NULL,start_day integer NOT NULL,updated_by uuid REFERENCES users(id),updated_at timestamptz DEFAULT CURRENT_TIMESTAMP)`);
}
