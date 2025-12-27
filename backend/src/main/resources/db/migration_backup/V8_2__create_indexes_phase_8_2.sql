-- ============================================================================
-- Phase 8.2 - Performance Optimization Indexes
-- TBA-WAAD System
-- Date: December 2, 2025
-- ============================================================================
-- 
-- This script creates database indexes to optimize query performance
-- for data-level security filtering and audit trail operations.
--
-- ===========================================================================

-- Members Table Indexes
-- ----------------------------------------------------------------------------
-- Optimize employer-based filtering (EMPLOYER_ADMIN access)
CREATE INDEX IF NOT EXISTS idx_members_employer_id 
ON members(employer_id);

-- Optimize insurance company filtering (INSURANCE_ADMIN access)
CREATE INDEX IF NOT EXISTS idx_members_insurance_company_id 
ON members(insurance_company_id);

-- Optimize member lookups by civil ID and card number
CREATE INDEX IF NOT EXISTS idx_members_civil_id 
ON members(civil_id);

CREATE INDEX IF NOT EXISTS idx_members_card_number 
ON members(card_number);

-- Optimize member status queries
CREATE INDEX IF NOT EXISTS idx_members_status 
ON members(status);

-- Claims Table Indexes
-- ----------------------------------------------------------------------------
-- Optimize provider filtering (createdBy field for PROVIDER access)
CREATE INDEX IF NOT EXISTS idx_claims_created_by 
ON claims(created_by);

-- Optimize member-based claim lookups
CREATE INDEX IF NOT EXISTS idx_claims_member_id 
ON claims(member_id);

-- Optimize claim status queries
CREATE INDEX IF NOT EXISTS idx_claims_status 
ON claims(status);

-- Optimize visit date queries
CREATE INDEX IF NOT EXISTS idx_claims_visit_date 
ON claims(visit_date);

-- Visits Table Indexes
-- ----------------------------------------------------------------------------
-- Optimize member-based visit lookups
CREATE INDEX IF NOT EXISTS idx_visits_member_id 
ON visits(member_id);

-- Optimize visit date queries
CREATE INDEX IF NOT EXISTS idx_visits_visit_date 
ON visits(visit_date);

-- Users Table Indexes
-- ----------------------------------------------------------------------------
-- Optimize employer filtering lookups
CREATE INDEX IF NOT EXISTS idx_users_employer_id 
ON users(employer_id);

-- Optimize company filtering lookups
CREATE INDEX IF NOT EXISTS idx_users_company_id 
ON users(company_id);

-- Audit Logs Table Indexes
-- ----------------------------------------------------------------------------
-- Note: These are already defined in @Table(indexes={...}) annotation
-- Included here for documentation purposes

-- Username lookups for user activity tracking
-- CREATE INDEX IF NOT EXISTS idx_audit_username ON audit_logs(username);

-- Action type filtering
-- CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- Entity history tracking
-- CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);

-- Time-based audit queries
-- CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);

-- Composite Indexes for Complex Queries
-- ----------------------------------------------------------------------------
-- Optimize employer + status filtering
CREATE INDEX IF NOT EXISTS idx_members_employer_status 
ON members(employer_id, status);

-- Optimize member + status for claims
CREATE INDEX IF NOT EXISTS idx_claims_member_status 
ON claims(member_id, status);

-- Optimize date queries for claims
CREATE INDEX IF NOT EXISTS idx_claims_visit_date_status 
ON claims(visit_date, status);

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check all indexes on members table
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'members' 
-- ORDER BY indexname;

-- Check all indexes on claims table
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'claims' 
-- ORDER BY indexname;

-- Check all indexes on visits table
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'visits' 
-- ORDER BY indexname;

-- Check all indexes on audit_logs table
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'audit_logs' 
-- ORDER BY indexname;

-- ============================================================================
-- Performance Testing Queries
-- ============================================================================

-- Test employer filtering performance
-- EXPLAIN ANALYZE 
-- SELECT * FROM members WHERE employer_id = 1;

-- Test insurance company filtering performance
-- EXPLAIN ANALYZE 
-- SELECT * FROM members WHERE insurance_company_id = 1;

-- Test provider filtering performance
-- EXPLAIN ANALYZE 
-- SELECT * FROM claims WHERE created_by = 'username';

-- Test audit log queries
-- EXPLAIN ANALYZE 
-- SELECT * FROM audit_logs WHERE username = 'admin' AND timestamp > NOW() - INTERVAL '30 days';

-- ============================================================================
-- Index Maintenance
-- ============================================================================

-- Analyze tables to update statistics after creating indexes
ANALYZE members;
ANALYZE claims;
ANALYZE visits;
ANALYZE audit_logs;
ANALYZE users;

-- ============================================================================
-- End of Index Creation Script
-- ============================================================================
