-- =============================================================================
-- Migration: Remove Insurance Companies Module
-- Date: 2025-12-24
-- Description: Drops the legacy insurance_companies table and removes related 
--              foreign key columns. The system now uses the unified 'organizations' 
--              table with type='INSURANCE' for insurance company data.
-- =============================================================================

-- =============================================================================
-- STEP 1: Drop foreign key constraints referencing insurance_companies
-- =============================================================================

-- Drop FK from members if exists
ALTER TABLE members DROP FOREIGN KEY IF EXISTS fk_member_insurance_company;
ALTER TABLE members DROP FOREIGN KEY IF EXISTS FK_MEMBER_INSURANCE_COMPANY;

-- Drop FK from claims if exists
ALTER TABLE claims DROP FOREIGN KEY IF EXISTS fk_claim_insurance_company;
ALTER TABLE claims DROP FOREIGN KEY IF EXISTS FK_CLAIM_INSURANCE_COMPANY;

-- Drop FK from policies if exists
ALTER TABLE policies DROP FOREIGN KEY IF EXISTS fk_policy_insurance_company;
ALTER TABLE policies DROP FOREIGN KEY IF EXISTS FK_POLICY_INSURANCE_COMPANY;

-- Drop FK from insurance_policies if exists
ALTER TABLE insurance_policies DROP FOREIGN KEY IF EXISTS fk_insurance_policy_company;
ALTER TABLE insurance_policies DROP FOREIGN KEY IF EXISTS FK_INSURANCE_POLICY_COMPANY;

-- =============================================================================
-- STEP 2: Drop columns referencing insurance_companies
-- =============================================================================

-- Drop insurance_company_id from members (legacy column, replaced by insurance_org_id)
ALTER TABLE members DROP COLUMN IF EXISTS insurance_company_id;

-- Drop insurance_company_id from claims (legacy column, replaced by insurance_org_id)
ALTER TABLE claims DROP COLUMN IF EXISTS insurance_company_id;

-- Drop insurance_company_id from policies (legacy column)
ALTER TABLE policies DROP COLUMN IF EXISTS insurance_company_id;

-- Drop insurance_company_id from insurance_policies (replaced by insurance_org_id)
ALTER TABLE insurance_policies DROP COLUMN IF EXISTS insurance_company_id;

-- =============================================================================
-- STEP 3: Add insurance_org_id column to insurance_policies if not exists
-- =============================================================================

-- Add insurance_org_id to insurance_policies referencing organizations
ALTER TABLE insurance_policies 
ADD COLUMN IF NOT EXISTS insurance_org_id BIGINT;

-- Add FK constraint for insurance_org_id
ALTER TABLE insurance_policies 
ADD CONSTRAINT fk_insurance_policy_org 
FOREIGN KEY (insurance_org_id) REFERENCES organizations(id);

-- =============================================================================
-- STEP 4: Drop the insurance_companies table
-- =============================================================================

DROP TABLE IF EXISTS insurance_companies;

-- =============================================================================
-- STEP 5: Clean up RBAC permissions related to insurance companies
-- =============================================================================

-- Remove insurance_companies related permissions
DELETE FROM role_permissions WHERE permission_id IN (
    SELECT id FROM permissions WHERE code LIKE '%insurance_compan%'
);

DELETE FROM permissions WHERE code LIKE '%insurance_compan%';

-- =============================================================================
-- Migration Complete
-- Note: The insurance company concept is now managed via the organizations 
-- table with type='INSURANCE'. Frontend and backend have been updated to use
-- Organization entity instead of InsuranceCompany.
-- =============================================================================
