-- ============================================================================
-- V10 - UI Visibility JSONB column for company_settings
-- TBA-WAAD System
-- Date: December 3, 2025
-- ============================================================================

ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS ui_visibility JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN company_settings.ui_visibility IS
'UI visibility configuration per employer (JSONB). Controls which tabs/sections are visible in the frontend.';
