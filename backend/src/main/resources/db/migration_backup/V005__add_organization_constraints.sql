-- ============================================================================
-- V005: Add FK constraints and indexes for organization references
-- ============================================================================

-- Add foreign key constraints
ALTER TABLE members 
    ADD CONSTRAINT fk_members_employer_org 
    FOREIGN KEY (employer_org_id) 
    REFERENCES organizations(id) 
    ON DELETE SET NULL;

ALTER TABLE members 
    ADD CONSTRAINT fk_members_insurance_org 
    FOREIGN KEY (insurance_org_id) 
    REFERENCES organizations(id) 
    ON DELETE SET NULL;

ALTER TABLE policies 
    ADD CONSTRAINT fk_policies_employer_org 
    FOREIGN KEY (employer_org_id) 
    REFERENCES organizations(id) 
    ON DELETE SET NULL;

ALTER TABLE claims 
    ADD CONSTRAINT fk_claims_insurance_org 
    FOREIGN KEY (insurance_org_id) 
    REFERENCES organizations(id) 
    ON DELETE SET NULL;

ALTER TABLE visits 
    ADD CONSTRAINT fk_visits_employer_org 
    FOREIGN KEY (employer_org_id) 
    REFERENCES organizations(id) 
    ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX idx_members_employer_org ON members(employer_org_id);
CREATE INDEX idx_members_insurance_org ON members(insurance_org_id);
CREATE INDEX idx_policies_employer_org ON policies(employer_org_id);
CREATE INDEX idx_claims_insurance_org ON claims(insurance_org_id);
CREATE INDEX idx_visits_employer_org ON visits(employer_org_id);

-- Mark legacy columns as deprecated (comment only, keep for 1 release)
COMMENT ON COLUMN members.employer_id IS 'DEPRECATED: Use employer_org_id instead';
COMMENT ON COLUMN members.insurance_company_id IS 'DEPRECATED: Use insurance_org_id instead';
COMMENT ON COLUMN policies.employer_id IS 'DEPRECATED: Use employer_org_id instead';
COMMENT ON COLUMN claims.insurance_company_id IS 'DEPRECATED: Use insurance_org_id instead';
