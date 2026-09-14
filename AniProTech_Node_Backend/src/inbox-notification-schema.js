export async function initializeInboxNotifications(db) {
  await db.query(
    `ALTER TABLE node_inbox_preferences ADD COLUMN IF NOT EXISTS notifications_since timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  );
  await db.query(`CREATE TABLE IF NOT EXISTS node_notification_events (
    id text PRIMARY KEY,entry_id uuid NOT NULL REFERENCES node_client_entries(id),agency_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,expanded_at timestamptz)`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_notification_deliveries (
    id uuid PRIMARY KEY,event_id text NOT NULL REFERENCES node_notification_events(id),user_id uuid NOT NULL REFERENCES users(id),agency_id uuid NOT NULL,
    channel text NOT NULL CHECK(channel IN ('email','sms')),preference_key text NOT NULL,
    status text NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','PROCESSING','ACCEPTED','DELIVERED','FAILED','UNKNOWN','CANCELLED')),
    attempts integer NOT NULL DEFAULT 0,next_attempt_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lease_until timestamptz,provider_id text,error_code text,safe_retry boolean NOT NULL DEFAULT false,
    UNIQUE(event_id,user_id,channel))`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_notification_history (
    id uuid PRIMARY KEY,delivery_id uuid NOT NULL REFERENCES node_notification_deliveries(id),status text NOT NULL,
    description text NOT NULL,created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  await db.query(
    `CREATE INDEX IF NOT EXISTS node_notification_pending ON node_notification_deliveries(status,next_attempt_at)`,
  );
  await db.query(
    `CREATE INDEX IF NOT EXISTS node_notification_person ON node_notification_deliveries(agency_id,user_id,created_at)`,
  );
  await db.query(`CREATE INDEX IF NOT EXISTS node_notification_events_pending ON node_notification_events(created_at,id) WHERE expanded_at IS NULL`);
  await db.query(`CREATE INDEX IF NOT EXISTS node_notification_events_entry ON node_notification_events(entry_id,created_at DESC)`);
  await db.query(`CREATE INDEX IF NOT EXISTS node_notification_history_delivery ON node_notification_history(delivery_id,created_at)`);
  await db.query(`CREATE OR REPLACE FUNCTION node_capture_inbox_notification() RETURNS trigger AS $$
    BEGIN
      IF NEW.kind='ALERT' AND NEW.status='OPEN' THEN
        IF TG_OP='INSERT' OR OLD.status='RESOLVED' THEN
          INSERT INTO node_notification_events(id,entry_id,agency_id) VALUES(NEW.id::text||':'||NEW.revision::text,NEW.id,NEW.agency_id) ON CONFLICT DO NOTHING;
        END IF;
      END IF;
      RETURN NEW;
    END;
  $$ LANGUAGE plpgsql`);
  await db.query(
    `DROP TRIGGER IF EXISTS node_capture_inbox_notification_trigger ON node_client_entries`,
  );
  await db.query(
    `CREATE TRIGGER node_capture_inbox_notification_trigger AFTER INSERT OR UPDATE ON node_client_entries FOR EACH ROW EXECUTE FUNCTION node_capture_inbox_notification()`,
  );
}
