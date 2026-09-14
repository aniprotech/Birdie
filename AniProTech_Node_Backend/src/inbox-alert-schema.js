import {initializeInboxNotifications} from './inbox-notification-schema.js';
export async function initializeInboxAlerts(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS node_inbox_preferences (user_id uuid PRIMARY KEY REFERENCES users(id),agency_id uuid NOT NULL,preferences jsonb NOT NULL,revision integer NOT NULL DEFAULT 1)`);
  await db.query(`CREATE TABLE IF NOT EXISTS node_inbox_details (
 entry_id uuid PRIMARY KEY REFERENCES node_client_entries(id),state text NOT NULL DEFAULT 'OPEN',severity text NOT NULL DEFAULT 'UNDEFINED',
 assigned_to uuid REFERENCES users(id),due_date date,archived boolean NOT NULL DEFAULT false,entry_revision integer NOT NULL)`);
  await db.query(
    `CREATE TABLE IF NOT EXISTS node_inbox_comments (id uuid PRIMARY KEY,entry_id uuid NOT NULL REFERENCES node_client_entries(id),actor_id uuid NOT NULL REFERENCES users(id),body text NOT NULL,created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  );
  await db.query(
    `CREATE TABLE IF NOT EXISTS node_inbox_events (id uuid PRIMARY KEY,entry_id uuid NOT NULL REFERENCES node_client_entries(id),actor_id uuid NOT NULL REFERENCES users(id),description text NOT NULL,created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  );
  await db.query(
    "CREATE INDEX IF NOT EXISTS node_inbox_comments_entry ON node_inbox_comments(entry_id,created_at)",
  );
  await db.query(
    "CREATE INDEX IF NOT EXISTS node_inbox_events_entry ON node_inbox_events(entry_id,created_at)",
  );
  await initializeInboxNotifications(db);
}
