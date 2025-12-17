-- ============================================================
-- TBA-WAAD System - PostgreSQL Permissions Fix
-- ============================================================
-- This script fixes permission issues for the postgres user
-- Run as superuser: psql -U postgres -d tba_waad_db -f fix-permissions.sql
-- ============================================================

-- Ensure postgres user has all permissions on public schema
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;

-- If using a different user (e.g., tba_waad_user), replace 'postgres' above

-- Verify permissions
\dp

SELECT 'Permissions fixed successfully!' AS status;
