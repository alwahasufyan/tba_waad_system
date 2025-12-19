-- ============================================================================
-- V002: Add new organization FK columns to domain tables
-- ============================================================================

-- Members table: add organization FKs
ALTER TABLE members ADD COLUMN IF NOT EXISTS employer_org_id BIGINT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS insurance_org_id BIGINT;

-- Policies table: add organization FK
ALTER TABLE policies ADD COLUMN IF NOT EXISTS employer_org_id BIGINT;

-- Claims table: add organization FK
ALTER TABLE claims ADD COLUMN IF NOT EXISTS insurance_org_id BIGINT;

-- Visits table: add organization FK (if visits reference employer)
ALTER TABLE visits ADD COLUMN IF NOT EXISTS employer_org_id BIGINT;

COMMENT ON COLUMN members.employer_org_id IS 'New FK to organizations table (replaces employer_id)';
COMMENT ON COLUMN members.insurance_org_id IS 'New FK to organizations table (replaces insurance_company_id)';
COMMENT ON COLUMN policies.employer_org_id IS 'New FK to organizations table (replaces employer_id)';
COMMENT ON COLUMN claims.insurance_org_id IS 'New FK to organizations table (replaces insurance_company_id)';
COMMENT ON COLUMN visits.employer_org_id IS 'New FK to organizations table (replaces legacy employer reference)';
