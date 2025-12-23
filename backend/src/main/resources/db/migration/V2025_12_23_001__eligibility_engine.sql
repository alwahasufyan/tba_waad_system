-- ============================================================================
-- PHASE E1: Eligibility Engine - Database Schema
-- Version: 2025.12.23.001
-- 
-- Purpose: Audit table for eligibility check decisions
-- This table logs every eligibility check for audit and analytics purposes.
-- 
-- ⚠️ IMPORTANT: This is an AUDIT/LOG table, NOT a transactional table.
-- ============================================================================

-- Eligibility Check Log Table
-- Records every eligibility check performed by the system
CREATE TABLE IF NOT EXISTS eligibility_checks (
    id BIGSERIAL PRIMARY KEY,
    
    -- Request Context
    request_id VARCHAR(64) NOT NULL,           -- UUID for request tracking
    check_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Input Parameters
    member_id BIGINT NOT NULL,
    policy_id BIGINT,                          -- May be auto-resolved
    provider_id BIGINT,                        -- Optional
    service_date DATE NOT NULL,
    service_code VARCHAR(50),                  -- Optional, for future phases
    
    -- Decision Output
    eligible BOOLEAN NOT NULL,
    status VARCHAR(20) NOT NULL,               -- ELIGIBLE, NOT_ELIGIBLE, WARNING
    
    -- Reason Details (JSON array for multiple reasons)
    reasons JSONB,
    
    -- Snapshot at time of check (denormalized for audit)
    member_name VARCHAR(200),
    member_civil_id VARCHAR(50),
    member_status VARCHAR(20),
    policy_number VARCHAR(100),
    policy_status VARCHAR(20),
    policy_start_date DATE,
    policy_end_date DATE,
    employer_id BIGINT,
    employer_name VARCHAR(200),
    
    -- Security Context
    checked_by_user_id BIGINT,
    checked_by_username VARCHAR(100),
    company_scope_id BIGINT,                   -- Organization scope at time of check
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Processing Metrics
    processing_time_ms INTEGER,
    rules_evaluated INTEGER,
    
    -- Audit Fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for common queries
    CONSTRAINT chk_eligibility_status CHECK (status IN ('ELIGIBLE', 'NOT_ELIGIBLE', 'WARNING'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_member ON eligibility_checks(member_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_policy ON eligibility_checks(policy_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_timestamp ON eligibility_checks(check_timestamp);
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_request ON eligibility_checks(request_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_user ON eligibility_checks(checked_by_user_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_company ON eligibility_checks(company_scope_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_eligible ON eligibility_checks(eligible, check_timestamp);

-- Comment on table
COMMENT ON TABLE eligibility_checks IS 'Audit log for all eligibility checks performed by the system. Each row represents one eligibility decision.';

-- ============================================================================
-- Add new permission for eligibility checks
-- ============================================================================
INSERT INTO permissions (name, description, module, created_at, updated_at)
SELECT 'eligibility.check', 'Check member eligibility for medical services - التحقق من أحقية العضو', 'ELIGIBILITY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'eligibility.check');

INSERT INTO permissions (name, description, module, created_at, updated_at)
SELECT 'eligibility.view_logs', 'View eligibility check history and logs - عرض سجل التحقق من الأحقية', 'ELIGIBILITY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'eligibility.view_logs');

-- Assign permissions to relevant roles
-- ADMIN role gets eligibility.check
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'ADMIN' AND p.name = 'eligibility.check'
AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);

-- REVIEWER role gets eligibility.check (for claims review)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'REVIEWER' AND p.name = 'eligibility.check'
AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);

-- EMPLOYER role gets eligibility.check (for their members)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'EMPLOYER' AND p.name = 'eligibility.check'
AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);
