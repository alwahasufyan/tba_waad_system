-- ====================================================================
-- BENEFIT POLICIES MODULE - PERMISSIONS MIGRATION (PostgreSQL)
-- ====================================================================
-- This migration adds RBAC permissions for the Benefit Policies module
-- Safe for re-run (idempotent using ON CONFLICT)
-- Compatible with Flyway
-- ====================================================================

BEGIN;

-- ====================================================================
-- STEP 1: INSERT / UPDATE BENEFIT POLICY PERMISSIONS
-- ID Range: 151 - 159
-- ====================================================================

INSERT INTO permissions (id, name, description, module, created_at, updated_at)
VALUES
  (151, 'benefit_policies.view',       'View benefit policies',        'BENEFIT_POLICIES', NOW(), NOW()),
  (152, 'benefit_policies.create',     'Create benefit policies',      'BENEFIT_POLICIES', NOW(), NOW()),
  (153, 'benefit_policies.update',     'Update benefit policies',      'BENEFIT_POLICIES', NOW(), NOW()),
  (154, 'benefit_policies.delete',     'Delete benefit policies',      'BENEFIT_POLICIES', NOW(), NOW()),
  (155, 'benefit_policies.activate',   'Activate benefit policies',    'BENEFIT_POLICIES', NOW(), NOW()),
  (156, 'benefit_policies.deactivate', 'Deactivate benefit policies',  'BENEFIT_POLICIES', NOW(), NOW()),
  (157, 'benefit_policies.suspend',    'Suspend benefit policies',     'BENEFIT_POLICIES', NOW(), NOW()),
  (158, 'benefit_policies.cancel',     'Cancel benefit policies',      'BENEFIT_POLICIES', NOW(), NOW()),
  (159, 'benefit_policies.admin',      'Admin operations on benefit policies', 'BENEFIT_POLICIES', NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  module      = EXCLUDED.module,
  updated_at  = NOW();

-- ====================================================================
-- STEP 2: ASSIGN ALL BENEFIT POLICY PERMISSIONS TO ADMIN ROLE
-- Assumes:
--   ADMIN role_id = 1
-- ====================================================================

INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id
FROM permissions
WHERE id BETWEEN 151 AND 159
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ====================================================================
-- STEP 3: ASSIGN VIEW PERMISSION TO USER ROLE
-- Assumes:
--   USER role_id = 2
-- ====================================================================

INSERT INTO role_permissions (role_id, permission_id)
VALUES (2, 151)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ====================================================================
-- STEP 4: ASSIGN LIMITED PERMISSIONS TO MANAGER ROLE
-- Assumes:
--   MANAGER role_id = 3
-- ====================================================================

INSERT INTO role_permissions (role_id, permission_id)
VALUES
  (3, 151), -- view
  (3, 152), -- create
  (3, 153), -- update
  (3, 155), -- activate
  (3, 156)  -- deactivate
ON CONFLICT (role_id, permission_id) DO NOTHING;

COMMIT;

-- ====================================================================
-- VERIFICATION QUERIES (OPTIONAL)
-- ====================================================================
-- SELECT id, name, description, module
-- FROM permissions
-- WHERE module = 'BENEFIT_POLICIES'
-- ORDER BY id;
--
-- SELECT r.name AS role, p.name AS permission
-- FROM role_permissions rp
-- JOIN roles r ON r.id = rp.role_id
-- JOIN permissions p ON p.id = rp.permission_id
-- WHERE p.module = 'BENEFIT_POLICIES'
-- ORDER BY r.id, p.id;
