export async function initializeRegistration(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS node_agencies (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    legal_name text,
    business_type text NOT NULL,
    registration_number text,
    phone text NOT NULL,
    website text,
    address_line1 text NOT NULL,
    address_line2 text,
    state text,
    city text NOT NULL,
    postcode text NOT NULL,
    country text NOT NULL,
    timezone text NOT NULL,
    status text NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','SUSPENDED')),
    terms_accepted_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.query("CREATE INDEX IF NOT EXISTS node_agencies_name ON node_agencies(lower(name))");
  await db.query(`ALTER TABLE node_agencies
    ADD COLUMN IF NOT EXISTS state text,
    ADD COLUMN IF NOT EXISTS logo_path text,
    ADD COLUMN IF NOT EXISTS support_email text,
    ADD COLUMN IF NOT EXISTS support_phone text,
    ADD COLUMN IF NOT EXISTS carer_app_message text,
    ADD COLUMN IF NOT EXISTS carer_app_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS updated_at timestamptz,
    ADD COLUMN IF NOT EXISTS updated_by uuid`);
}
