-- V15: Claims Module Migration

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    insurance_company_id BIGINT NOT NULL REFERENCES insurance_companies(id) ON DELETE RESTRICT,
    insurance_policy_id BIGINT REFERENCES insurance_policies(id) ON DELETE RESTRICT,
    benefit_package_id BIGINT REFERENCES policy_benefit_packages(id) ON DELETE RESTRICT,
    pre_approval_id BIGINT REFERENCES pre_approvals(id) ON DELETE RESTRICT,
    
    provider_name VARCHAR(255),
    doctor_name VARCHAR(255),
    diagnosis TEXT,
    visit_date DATE,
    
    requested_amount NUMERIC(15,2) NOT NULL CHECK (requested_amount > 0),
    approved_amount NUMERIC(15,2) CHECK (approved_amount >= 0),
    difference_amount NUMERIC(15,2),
    
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW',
    reviewer_comment TEXT,
    reviewed_at TIMESTAMP,
    
    service_count INTEGER DEFAULT 0,
    attachments_count INTEGER DEFAULT 0,
    
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Create claim_lines table
CREATE TABLE IF NOT EXISTS claim_lines (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    
    service_code VARCHAR(50),
    description TEXT,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(15,2) NOT NULL,
    total_price NUMERIC(15,2) NOT NULL
);

-- Create claim_attachments table
CREATE TABLE IF NOT EXISTS claim_attachments (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    
    file_name VARCHAR(500) NOT NULL,
    file_url VARCHAR(1000),
    file_type VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for claims table
CREATE INDEX IF NOT EXISTS idx_claims_member_id ON claims(member_id);
CREATE INDEX IF NOT EXISTS idx_claims_insurance_company_id ON claims(insurance_company_id);
CREATE INDEX IF NOT EXISTS idx_claims_insurance_policy_id ON claims(insurance_policy_id);
CREATE INDEX IF NOT EXISTS idx_claims_benefit_package_id ON claims(benefit_package_id);
CREATE INDEX IF NOT EXISTS idx_claims_pre_approval_id ON claims(pre_approval_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_active ON claims(active);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at);
CREATE INDEX IF NOT EXISTS idx_claims_visit_date ON claims(visit_date);
CREATE INDEX IF NOT EXISTS idx_claims_provider_name ON claims(provider_name);

-- Create indexes for claim_lines table
CREATE INDEX IF NOT EXISTS idx_claim_lines_claim_id ON claim_lines(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_lines_service_code ON claim_lines(service_code);

-- Create indexes for claim_attachments table
CREATE INDEX IF NOT EXISTS idx_claim_attachments_claim_id ON claim_attachments(claim_id);

-- Create trigger for updated_at on claims
CREATE OR REPLACE FUNCTION update_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_claims_updated_at ON claims;
CREATE TRIGGER trigger_update_claims_updated_at
    BEFORE UPDATE ON claims
    FOR EACH ROW
    EXECUTE FUNCTION update_claims_updated_at();

-- Add comments
COMMENT ON TABLE claims IS 'Medical claims submitted for reimbursement';
COMMENT ON COLUMN claims.id IS 'Unique identifier';
COMMENT ON COLUMN claims.member_id IS 'Reference to member who submitted claim';
COMMENT ON COLUMN claims.insurance_company_id IS 'Reference to insurance company';
COMMENT ON COLUMN claims.insurance_policy_id IS 'Reference to insurance policy (optional)';
COMMENT ON COLUMN claims.benefit_package_id IS 'Reference to benefit package (optional)';
COMMENT ON COLUMN claims.pre_approval_id IS 'Reference to pre-approval (optional)';
COMMENT ON COLUMN claims.provider_name IS 'Name of healthcare provider';
COMMENT ON COLUMN claims.doctor_name IS 'Name of treating doctor';
COMMENT ON COLUMN claims.diagnosis IS 'ICD10 diagnosis codes';
COMMENT ON COLUMN claims.visit_date IS 'Date of medical visit';
COMMENT ON COLUMN claims.requested_amount IS 'Total amount requested';
COMMENT ON COLUMN claims.approved_amount IS 'Amount approved for payment';
COMMENT ON COLUMN claims.difference_amount IS 'Difference between requested and approved';
COMMENT ON COLUMN claims.status IS 'Claim status (PENDING_REVIEW, PREAPPROVED, APPROVED, PARTIALLY_APPROVED, REJECTED, RETURNED_FOR_INFO, CANCELLED)';
COMMENT ON COLUMN claims.reviewer_comment IS 'Comment from reviewer';
COMMENT ON COLUMN claims.reviewed_at IS 'Date and time of review';
COMMENT ON COLUMN claims.service_count IS 'Number of service lines';
COMMENT ON COLUMN claims.attachments_count IS 'Number of attachments';
COMMENT ON COLUMN claims.active IS 'Soft delete flag';
COMMENT ON COLUMN claims.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN claims.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN claims.created_by IS 'User who created the record';
COMMENT ON COLUMN claims.updated_by IS 'User who last updated the record';

COMMENT ON TABLE claim_lines IS 'Individual service lines within a claim';
COMMENT ON COLUMN claim_lines.id IS 'Unique identifier';
COMMENT ON COLUMN claim_lines.claim_id IS 'Reference to parent claim';
COMMENT ON COLUMN claim_lines.service_code IS 'CPT or service code';
COMMENT ON COLUMN claim_lines.description IS 'Service description';
COMMENT ON COLUMN claim_lines.quantity IS 'Number of units';
COMMENT ON COLUMN claim_lines.unit_price IS 'Price per unit';
COMMENT ON COLUMN claim_lines.total_price IS 'Total line amount (quantity * unit_price)';

COMMENT ON TABLE claim_attachments IS 'Supporting documents for claims';
COMMENT ON COLUMN claim_attachments.id IS 'Unique identifier';
COMMENT ON COLUMN claim_attachments.claim_id IS 'Reference to parent claim';
COMMENT ON COLUMN claim_attachments.file_name IS 'Original file name';
COMMENT ON COLUMN claim_attachments.file_url IS 'URL or path to file';
COMMENT ON COLUMN claim_attachments.file_type IS 'MIME type of file';
COMMENT ON COLUMN claim_attachments.created_at IS 'Upload timestamp';
