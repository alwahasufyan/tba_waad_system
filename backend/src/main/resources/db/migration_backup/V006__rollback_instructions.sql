-- ============================================================================
-- V006: Rollback instructions (NOT executed, for emergency use only)
-- ============================================================================

-- This file documents the rollback procedure if migration needs to be reverted
-- DO NOT EXECUTE THIS IN PRODUCTION WITHOUT APPROVAL

/*

-- ROLLBACK STEP 1: Remove FK constraints
ALTER TABLE members DROP CONSTRAINT IF EXISTS fk_members_employer_org;
ALTER TABLE members DROP CONSTRAINT IF EXISTS fk_members_insurance_org;
ALTER TABLE policies DROP CONSTRAINT IF EXISTS fk_policies_employer_org;
ALTER TABLE claims DROP CONSTRAINT IF EXISTS fk_claims_insurance_org;
ALTER TABLE visits DROP CONSTRAINT IF EXISTS fk_visits_employer_org;

-- ROLLBACK STEP 2: Drop indexes
DROP INDEX IF EXISTS idx_members_employer_org;
DROP INDEX IF EXISTS idx_members_insurance_org;
DROP INDEX IF EXISTS idx_policies_employer_org;
DROP INDEX IF EXISTS idx_claims_insurance_org;
DROP INDEX IF EXISTS idx_visits_employer_org;

-- ROLLBACK STEP 3: Drop new columns (only after confirming legacy columns have data)
ALTER TABLE members DROP COLUMN IF EXISTS employer_org_id;
ALTER TABLE members DROP COLUMN IF EXISTS insurance_org_id;
ALTER TABLE policies DROP COLUMN IF EXISTS employer_org_id;
ALTER TABLE claims DROP COLUMN IF EXISTS insurance_org_id;
ALTER TABLE visits DROP COLUMN IF EXISTS employer_org_id;

-- ROLLBACK STEP 4: Keep organizations table (valuable data), but application will ignore it

-- NOTE: To fully rollback, also need to revert code changes to use legacy entities

*/

-- This is a documentation file only
SELECT 'Rollback instructions available in V006__rollback_instructions.sql' as message;
