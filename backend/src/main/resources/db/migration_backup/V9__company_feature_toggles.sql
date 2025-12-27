-- ============================================================================
-- Phase 9 - Company Feature Toggles Migration
-- TBA-WAAD System
-- Date: December 2, 2025
-- ============================================================================
-- 
-- This migration creates the company_settings table to enable feature
-- toggles per employer. This allows flexible control over what features
-- each employer can access.
--
-- Features controlled:
-- - canViewClaims: Allow EMPLOYER_ADMIN to view claims
-- - canViewVisits: Allow EMPLOYER_ADMIN to view visits
-- - canEditMembers: Allow EMPLOYER_ADMIN to edit members
-- - canDownloadAttachments: Allow downloading attachments
--
-- ===========================================================================

-- Create company_settings table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_settings (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    employer_id BIGINT NOT NULL,
    can_view_claims BOOLEAN NOT NULL DEFAULT FALSE,
    can_view_visits BOOLEAN NOT NULL DEFAULT FALSE,
    can_edit_members BOOLEAN NOT NULL DEFAULT TRUE,
    can_download_attachments BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT uk_company_employer_settings UNIQUE (company_id, employer_id)
);

-- Create indexes for performance
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_company_settings_employer 
ON company_settings(employer_id);

CREATE INDEX IF NOT EXISTS idx_company_settings_company 
ON company_settings(company_id);

-- Add comments to table and columns
-- ----------------------------------------------------------------------------
COMMENT ON TABLE company_settings IS 'Phase 9: Feature toggles for each employer. Controls what features EMPLOYER_ADMIN users can access.';

COMMENT ON COLUMN company_settings.id IS 'Primary key';
COMMENT ON COLUMN company_settings.company_id IS 'Reference to the TPA company';
COMMENT ON COLUMN company_settings.employer_id IS 'Reference to the employer - each employer has unique settings';
COMMENT ON COLUMN company_settings.can_view_claims IS 'Allow EMPLOYER_ADMIN to view claims (default: false - hidden)';
COMMENT ON COLUMN company_settings.can_view_visits IS 'Allow EMPLOYER_ADMIN to view visits (default: false - hidden)';
COMMENT ON COLUMN company_settings.can_edit_members IS 'Allow EMPLOYER_ADMIN to edit members (default: true - editable)';
COMMENT ON COLUMN company_settings.can_download_attachments IS 'Allow downloading attachments (default: true - downloadable)';
COMMENT ON COLUMN company_settings.created_at IS 'Timestamp when settings were created';
COMMENT ON COLUMN company_settings.updated_at IS 'Timestamp when settings were last updated';

-- Create trigger to update updated_at timestamp
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_company_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_company_settings_updated_at ON company_settings;
CREATE TRIGGER trigger_update_company_settings_updated_at
    BEFORE UPDATE ON company_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_company_settings_updated_at();

-- ============================================================================
-- Sample Data (Optional - for testing)
-- ============================================================================

-- Insert default settings for existing employers
-- This assumes employers table exists and has data
-- Uncomment the following lines if you want to create default settings
-- for all existing employers:

-- INSERT INTO company_settings (company_id, employer_id, can_view_claims, can_view_visits, can_edit_members, can_download_attachments)
-- SELECT 
--     COALESCE(e.company_id, 1) as company_id,
--     e.id as employer_id,
--     FALSE as can_view_claims,        -- Claims hidden by default
--     FALSE as can_view_visits,        -- Visits hidden by default
--     TRUE as can_edit_members,        -- Members editable by default
--     TRUE as can_download_attachments -- Attachments downloadable by default
-- FROM employers e
-- WHERE NOT EXISTS (
--     SELECT 1 FROM company_settings cs WHERE cs.employer_id = e.id
-- );

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check table structure
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'company_settings'
-- ORDER BY ordinal_position;

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'company_settings'
-- ORDER BY indexname;

-- Check constraints
-- SELECT constraint_name, constraint_type
-- FROM information_schema.table_constraints
-- WHERE table_name = 'company_settings';

-- Count settings records
-- SELECT COUNT(*) as total_settings FROM company_settings;

-- View all settings with feature summary
-- SELECT 
--     employer_id,
--     can_view_claims,
--     can_view_visits,
--     can_edit_members,
--     can_download_attachments,
--     CASE 
--         WHEN can_view_claims AND can_view_visits AND can_edit_members AND can_download_attachments 
--         THEN 'All Features Enabled'
--         WHEN NOT can_view_claims AND NOT can_view_visits AND NOT can_edit_members AND NOT can_download_attachments
--         THEN 'All Features Disabled'
--         ELSE 'Partial Features'
--     END as feature_status
-- FROM company_settings
-- ORDER BY employer_id;

-- ============================================================================
-- Analytics Queries (Optional)
-- ============================================================================

-- Count employers with each feature enabled
-- SELECT 
--     COUNT(*) FILTER (WHERE can_view_claims = TRUE) as employers_with_claims,
--     COUNT(*) FILTER (WHERE can_view_visits = TRUE) as employers_with_visits,
--     COUNT(*) FILTER (WHERE can_edit_members = TRUE) as employers_with_edit,
--     COUNT(*) FILTER (WHERE can_download_attachments = TRUE) as employers_with_downloads,
--     COUNT(*) as total_employers
-- FROM company_settings;

-- Find employers with restricted access (both claims and visits disabled)
-- SELECT employer_id, company_id
-- FROM company_settings
-- WHERE can_view_claims = FALSE 
--   AND can_view_visits = FALSE
-- ORDER BY employer_id;

-- ============================================================================
-- Rollback Instructions (if needed)
-- ============================================================================
-- To rollback this migration:
-- DROP TRIGGER IF EXISTS trigger_update_company_settings_updated_at ON company_settings;
-- DROP FUNCTION IF EXISTS update_company_settings_updated_at();
-- DROP TABLE IF EXISTS company_settings CASCADE;

-- ============================================================================
-- End of Migration
-- ============================================================================
