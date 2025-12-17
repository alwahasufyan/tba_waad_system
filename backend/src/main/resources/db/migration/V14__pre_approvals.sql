-- Migration V14: Pre-Approvals Module
-- Description: Creates pre_approvals table for managing medical pre-approval requests
-- Supports: Chronic conditions, Exceed limits, VIP approvals, High-cost services

-- Create pre_approvals table
CREATE TABLE IF NOT EXISTS pre_approvals (
    id BIGSERIAL PRIMARY KEY,
    
    -- Approval Number (unique identifier)
    approval_number VARCHAR(100) NOT NULL UNIQUE,
    
    -- Approval Type
    type VARCHAR(30) NOT NULL,
    
    -- Foreign Keys
    member_id BIGINT NOT NULL,
    visit_id BIGINT,
    provider_id BIGINT NOT NULL,
    member_chronic_condition_id BIGINT,
    medical_reviewer_id BIGINT,
    manager_approver_id BIGINT,
    created_by_user_id BIGINT,
    
    -- Provider Information
    provider_name VARCHAR(200),
    
    -- Service Information
    service_code VARCHAR(50),
    service_description VARCHAR(500),
    diagnosis_code VARCHAR(20),
    diagnosis_description VARCHAR(500),
    
    -- Financial Information
    requested_amount NUMERIC(15, 2) NOT NULL,
    approved_amount NUMERIC(15, 2),
    rejected_amount NUMERIC(15, 2),
    member_remaining_balance NUMERIC(15, 2),
    exceed_amount NUMERIC(15, 2),
    
    -- Approval Status
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    required_level VARCHAR(30),
    
    -- Request Information
    request_date DATE NOT NULL,
    expected_service_date DATE,
    request_reason VARCHAR(2000),
    
    -- Review Information
    medical_reviewed_at TIMESTAMP,
    medical_review_notes VARCHAR(2000),
    manager_approved_at TIMESTAMP,
    manager_notes VARCHAR(2000),
    
    -- Approval Validity
    valid_from DATE,
    valid_until DATE,
    expired BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Rejection Information
    rejection_reason VARCHAR(2000),
    
    -- Auto Approval
    auto_approved BOOLEAN NOT NULL DEFAULT FALSE,
    auto_approval_rule VARCHAR(500),
    
    -- Additional Information
    notes VARCHAR(2000),
    attachments VARCHAR(2000),
    
    -- Company Reference
    company_id BIGINT NOT NULL,
    
    -- Status
    active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Audit Fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_pre_approvals_member 
        FOREIGN KEY (member_id) 
        REFERENCES members(id) 
        ON DELETE RESTRICT,
    
    -- Check Constraints
    CONSTRAINT chk_requested_amount_positive 
        CHECK (requested_amount > 0),
    
    CONSTRAINT chk_approved_amount_non_negative 
        CHECK (approved_amount IS NULL OR approved_amount >= 0),
    
    CONSTRAINT chk_type_valid 
        CHECK (type IN ('CHRONIC_CONDITION', 'EXCEED_LIMIT', 'SPECIAL_VIP', 'HIGH_COST_SERVICE', 
                        'EXPERIMENTAL_TREATMENT', 'OUT_OF_NETWORK', 'EMERGENCY_OVERRIDE', 'OTHER')),
    
    CONSTRAINT chk_status_valid 
        CHECK (status IN ('PENDING', 'UNDER_MEDICAL_REVIEW', 'UNDER_MANAGER_REVIEW', 'APPROVED', 
                          'PARTIALLY_APPROVED', 'REJECTED', 'EXPIRED', 'USED', 'CANCELLED')),
    
    CONSTRAINT chk_required_level_valid
        CHECK (required_level IS NULL OR required_level IN ('AUTO', 'MEDICAL', 'MANAGER', 'DIRECTOR'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pre_approvals_approval_number ON pre_approvals(approval_number);
CREATE INDEX IF NOT EXISTS idx_pre_approvals_member_id ON pre_approvals(member_id);
CREATE INDEX IF NOT EXISTS idx_pre_approvals_visit_id ON pre_approvals(visit_id);
CREATE INDEX IF NOT EXISTS idx_pre_approvals_provider_id ON pre_approvals(provider_id);
CREATE INDEX IF NOT EXISTS idx_pre_approvals_company_id ON pre_approvals(company_id);
CREATE INDEX IF NOT EXISTS idx_pre_approvals_type ON pre_approvals(type);
CREATE INDEX IF NOT EXISTS idx_pre_approvals_status ON pre_approvals(status);
CREATE INDEX IF NOT EXISTS idx_pre_approvals_active ON pre_approvals(active);
CREATE INDEX IF NOT EXISTS idx_pre_approvals_created_at ON pre_approvals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pre_approvals_request_date ON pre_approvals(request_date);
CREATE INDEX IF NOT EXISTS idx_pre_approvals_expired ON pre_approvals(expired);
CREATE INDEX IF NOT EXISTS idx_pre_approvals_auto_approved ON pre_approvals(auto_approved);

-- Create trigger for updated_at auto-update
CREATE OR REPLACE FUNCTION update_pre_approvals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pre_approvals_updated_at ON pre_approvals;
CREATE TRIGGER trigger_update_pre_approvals_updated_at
    BEFORE UPDATE ON pre_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_pre_approvals_updated_at();

-- Add table and column comments for documentation
COMMENT ON TABLE pre_approvals IS 'Pre-approval requests for medical services - supports chronic conditions, exceed limits, VIP, and high-cost services';

COMMENT ON COLUMN pre_approvals.id IS 'Primary key';
COMMENT ON COLUMN pre_approvals.approval_number IS 'Unique approval number for tracking';
COMMENT ON COLUMN pre_approvals.type IS 'Type: CHRONIC_CONDITION, EXCEED_LIMIT, SPECIAL_VIP, HIGH_COST_SERVICE, etc.';
COMMENT ON COLUMN pre_approvals.member_id IS 'Reference to the member requesting pre-approval';
COMMENT ON COLUMN pre_approvals.visit_id IS 'Optional reference to related visit';
COMMENT ON COLUMN pre_approvals.provider_id IS 'ID of provider where service will be performed';
COMMENT ON COLUMN pre_approvals.provider_name IS 'Name of hospital/clinic';
COMMENT ON COLUMN pre_approvals.service_code IS 'CPT or service code';
COMMENT ON COLUMN pre_approvals.service_description IS 'Description of service requested';
COMMENT ON COLUMN pre_approvals.diagnosis_code IS 'ICD10 diagnosis code';
COMMENT ON COLUMN pre_approvals.diagnosis_description IS 'Description of diagnosis';
COMMENT ON COLUMN pre_approvals.requested_amount IS 'Amount requested for pre-approval';
COMMENT ON COLUMN pre_approvals.approved_amount IS 'Amount approved (if approved)';
COMMENT ON COLUMN pre_approvals.rejected_amount IS 'Amount rejected';
COMMENT ON COLUMN pre_approvals.member_remaining_balance IS 'Member remaining balance at time of request';
COMMENT ON COLUMN pre_approvals.exceed_amount IS 'Amount exceeding member limit';
COMMENT ON COLUMN pre_approvals.status IS 'Status: PENDING, UNDER_MEDICAL_REVIEW, APPROVED, REJECTED, etc.';
COMMENT ON COLUMN pre_approvals.required_level IS 'Required approval level: AUTO, MEDICAL, MANAGER, DIRECTOR';
COMMENT ON COLUMN pre_approvals.request_date IS 'Date request was submitted';
COMMENT ON COLUMN pre_approvals.expected_service_date IS 'Expected date of service';
COMMENT ON COLUMN pre_approvals.request_reason IS 'Reason for pre-approval request';
COMMENT ON COLUMN pre_approvals.medical_reviewer_id IS 'User ID of medical reviewer';
COMMENT ON COLUMN pre_approvals.medical_reviewed_at IS 'Timestamp of medical review';
COMMENT ON COLUMN pre_approvals.medical_review_notes IS 'Notes from medical reviewer';
COMMENT ON COLUMN pre_approvals.manager_approver_id IS 'User ID of manager approver';
COMMENT ON COLUMN pre_approvals.manager_approved_at IS 'Timestamp of manager approval';
COMMENT ON COLUMN pre_approvals.manager_notes IS 'Notes from manager';
COMMENT ON COLUMN pre_approvals.valid_from IS 'Approval valid from date';
COMMENT ON COLUMN pre_approvals.valid_until IS 'Approval valid until date';
COMMENT ON COLUMN pre_approvals.expired IS 'Flag indicating if approval has expired';
COMMENT ON COLUMN pre_approvals.rejection_reason IS 'Reason for rejection';
COMMENT ON COLUMN pre_approvals.auto_approved IS 'Flag indicating if auto-approved';
COMMENT ON COLUMN pre_approvals.auto_approval_rule IS 'Rule used for auto-approval';
COMMENT ON COLUMN pre_approvals.notes IS 'Additional notes';
COMMENT ON COLUMN pre_approvals.attachments IS 'Attached documents info';
COMMENT ON COLUMN pre_approvals.company_id IS 'Reference to TPA company';
COMMENT ON COLUMN pre_approvals.active IS 'Soft delete flag';
COMMENT ON COLUMN pre_approvals.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN pre_approvals.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN pre_approvals.created_by_user_id IS 'User who created the record';
