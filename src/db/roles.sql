-- Schema rights for the app roles (S17), run once per database as a superuser or the owner.
-- aanch_migrate owns the schema and runs migrations; the app roles can use it but never change it.
-- Table and sequence grants are written in each migration, so every table states who may touch it.
ALTER SCHEMA public OWNER TO aanch_migrate;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO aanch_store, aanch_admin;
