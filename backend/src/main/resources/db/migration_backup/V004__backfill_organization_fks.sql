-- ============================================================================
-- V004: Backfill new organization FK columns using legacy FK data
-- ============================================================================

-- Strategy: Map legacy entity IDs to organization IDs using code matching
-- This creates a reliable mapping even if IDs don't align

-- Step 1: Create temporary mapping tables
CREATE TEMP TABLE employer_org_mapping AS
SELECT 
    e.id as legacy_employer_id,
    o.id as organization_id
FROM employers e
INNER JOIN organizations o ON o.code = e.code AND o.type = 'EMPLOYER';

CREATE TEMP TABLE insurance_org_mapping AS
SELECT 
    ic.id as legacy_insurance_id,
    o.id as organization_id
FROM insurance_companies ic
INNER JOIN organizations o ON (
    o.code = COALESCE(ic.code, 'INS-' || ic.id::TEXT)
    AND o.type = 'INSURANCE'
);

-- Step 2: Update members.employer_org_id
UPDATE members m
SET employer_org_id = mapping.organization_id
FROM employer_org_mapping mapping
WHERE m.employer_id = mapping.legacy_employer_id
  AND m.employer_org_id IS NULL;

-- Step 3: Update members.insurance_org_id
UPDATE members m
SET insurance_org_id = mapping.organization_id
FROM insurance_org_mapping mapping
WHERE m.insurance_company_id = mapping.legacy_insurance_id
  AND m.insurance_org_id IS NULL;

-- Step 4: Update policies.employer_org_id
UPDATE policies p
SET employer_org_id = mapping.organization_id
FROM employer_org_mapping mapping
WHERE p.employer_id = mapping.legacy_employer_id
  AND p.employer_org_id IS NULL;

-- Step 5: Update claims.insurance_org_id
UPDATE claims c
SET insurance_org_id = mapping.organization_id
FROM insurance_org_mapping mapping
WHERE c.insurance_company_id = mapping.legacy_insurance_id
  AND c.insurance_org_id IS NULL;

-- Step 6: Update visits.employer_org_id (via member relationship)
-- Visits don't have direct employer FK, they inherit from member
UPDATE visits v
SET employer_org_id = m.employer_org_id
FROM members m
WHERE v.member_id = m.id
  AND v.employer_org_id IS NULL
  AND m.employer_org_id IS NOT NULL;

-- Verification queries (log counts)
DO $$
DECLARE
    members_employer_count INT;
    members_insurance_count INT;
    policies_employer_count INT;
    claims_insurance_count INT;
BEGIN
    SELECT COUNT(*) INTO members_employer_count FROM members WHERE employer_org_id IS NOT NULL;
    SELECT COUNT(*) INTO members_insurance_count FROM members WHERE insurance_org_id IS NOT NULL;
    SELECT COUNT(*) INTO policies_employer_count FROM policies WHERE employer_org_id IS NOT NULL;
    SELECT COUNT(*) INTO claims_insurance_count FROM claims WHERE insurance_org_id IS NOT NULL;
    
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE '  - Members with employer_org_id: %', members_employer_count;
    RAISE NOTICE '  - Members with insurance_org_id: %', members_insurance_count;
    RAISE NOTICE '  - Policies with employer_org_id: %', policies_employer_count;
    RAISE NOTICE '  - Claims with insurance_org_id: %', claims_insurance_count;
END $$;
