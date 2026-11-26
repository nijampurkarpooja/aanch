#!/usr/bin/env bash
# Recreates the throwaway aanch_test database and the three app roles (S17), then applies the
# schema rights. Local and CI only. Connection comes from the usual PG* variables.
set -euo pipefail

export PGHOST="${PGHOST:-127.0.0.1}"
case "$PGHOST" in
  127.0.0.1 | localhost | /*) ;;
  *) echo "db:test drops a database, so it only runs against a local server (PGHOST=$PGHOST)" >&2; exit 1 ;;
esac

DB=aanch_test
psql -v ON_ERROR_STOP=1 -q -d postgres <<SQL
DROP DATABASE IF EXISTS $DB WITH (FORCE);
DO \$\$
BEGIN
  -- Roles are cluster-wide, so they're created once and kept. Local trust auth: no passwords.
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'aanch_migrate') THEN CREATE ROLE aanch_migrate LOGIN; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'aanch_store') THEN CREATE ROLE aanch_store LOGIN; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'aanch_admin') THEN CREATE ROLE aanch_admin LOGIN; END IF;
END
\$\$;
CREATE DATABASE $DB OWNER aanch_migrate;
SQL
psql -v ON_ERROR_STOP=1 -q -d "$DB" -f src/db/roles.sql
echo "Recreated $DB on $PGHOST"
