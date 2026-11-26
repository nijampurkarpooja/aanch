-- Schema rights for the app roles (S17), run once per database as a superuser or the owner.
-- aanch_migrate owns the schema and runs migrations; the app roles can use it but never change it.
-- Table and sequence grants are written in each migration, so every table states who may touch it.
DO $$
BEGIN
  -- Only the three roles may connect, and none may create temporary tables.
  EXECUTE format('REVOKE ALL ON DATABASE %I FROM PUBLIC', current_database());
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO aanch_migrate, aanch_store, aanch_admin', current_database());
END
$$;
-- Postgres 16+: handing the schema to aanch_migrate needs the right to act as it (not its rights).
GRANT aanch_migrate TO CURRENT_USER WITH SET TRUE, INHERIT FALSE;
ALTER SCHEMA public OWNER TO aanch_migrate;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO aanch_store, aanch_admin;
