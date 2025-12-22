-- ====================================================================
-- TBA-WAAD SYSTEM - SUPER_ADMIN Permission Synchronization (MySQL)
-- ====================================================================
-- This migration ensures that the SUPER_ADMIN role has ALL permissions
-- in the system. It is idempotent and safe to run multiple times.
-- 
-- CRITICAL BUSINESS RULE:
-- SUPER_ADMIN must NEVER be blocked by missing permissions.
-- 
-- HOW IT WORKS:
-- 1. Gets the SUPER_ADMIN role ID
-- 2. Inserts all permissions that SUPER_ADMIN doesn't have yet
-- 3. Uses INSERT IGNORE to avoid duplicate errors
-- 
-- WHEN TO RUN:
-- - After adding new permissions to the system
-- - As part of deployment migrations
-- - Manually if SUPER_ADMIN access issues occur
-- ====================================================================

-- Sync SUPER_ADMIN with all permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 
    r.id AS role_id,
    p.id AS permission_id,
    NOW() AS created_at,
    NOW() AS updated_at
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'SUPER_ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = r.id 
    AND rp.permission_id = p.id
);

-- Verification query (run this to confirm)
-- SELECT 
--     r.name AS role_name,
--     COUNT(rp.permission_id) AS permission_count,
--     (SELECT COUNT(*) FROM permissions) AS total_permissions
-- FROM roles r
-- LEFT JOIN role_permissions rp ON r.id = rp.role_id
-- WHERE r.name = 'SUPER_ADMIN'
-- GROUP BY r.id, r.name;

-- ====================================================================
-- Expected Result:
-- SUPER_ADMIN should have permission_count = total_permissions
-- ====================================================================
