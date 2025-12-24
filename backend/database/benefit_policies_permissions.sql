-- ====================================================================
-- BENEFIT POLICIES MODULE - PERMISSIONS MIGRATION
-- ====================================================================
-- Run this script to add Benefit Policy permissions to the RBAC system
-- This extends the existing permissions (IDs 151-159)
-- ====================================================================

START TRANSACTION;

-- ====================================================================
-- STEP 1: INSERT BENEFIT POLICY PERMISSIONS
-- ====================================================================
-- Using ID range 151-159 for Benefit Policies module

INSERT INTO permissions (id, name, description, module, created_at, updated_at) VALUES
(151, 'benefit_policies.view', 'View benefit policies', 'BENEFIT_POLICIES', NOW(), NOW()),
(152, 'benefit_policies.create', 'Create benefit policies', 'BENEFIT_POLICIES', NOW(), NOW()),
(153, 'benefit_policies.update', 'Update benefit policies', 'BENEFIT_POLICIES', NOW(), NOW()),
(154, 'benefit_policies.delete', 'Delete benefit policies', 'BENEFIT_POLICIES', NOW(), NOW()),
(155, 'benefit_policies.activate', 'Activate benefit policies', 'BENEFIT_POLICIES', NOW(), NOW()),
(156, 'benefit_policies.deactivate', 'Deactivate benefit policies', 'BENEFIT_POLICIES', NOW(), NOW()),
(157, 'benefit_policies.suspend', 'Suspend benefit policies', 'BENEFIT_POLICIES', NOW(), NOW()),
(158, 'benefit_policies.cancel', 'Cancel benefit policies', 'BENEFIT_POLICIES', NOW(), NOW()),
(159, 'benefit_policies.admin', 'Admin operations on benefit policies', 'BENEFIT_POLICIES', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  description = VALUES(description),
  module = VALUES(module),
  updated_at = NOW();

-- ====================================================================
-- STEP 2: ASSIGN TO ADMIN ROLE (Role ID 1)
-- ====================================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE id BETWEEN 151 AND 159
ON DUPLICATE KEY UPDATE role_id = role_id;

-- ====================================================================
-- STEP 3: ASSIGN VIEW TO USER ROLE (Role ID 2)
-- ====================================================================
INSERT INTO role_permissions (role_id, permission_id)
VALUES (2, 151)  -- benefit_policies.view only
ON DUPLICATE KEY UPDATE role_id = role_id;

-- ====================================================================
-- STEP 4: ASSIGN VIEW/CREATE/UPDATE TO MANAGER ROLE (Role ID 3)
-- ====================================================================
INSERT INTO role_permissions (role_id, permission_id)
VALUES 
  (3, 151),  -- benefit_policies.view
  (3, 152),  -- benefit_policies.create
  (3, 153),  -- benefit_policies.update
  (3, 155),  -- benefit_policies.activate
  (3, 156)   -- benefit_policies.deactivate
ON DUPLICATE KEY UPDATE role_id = role_id;

COMMIT;

-- Verification query (run to check):
-- SELECT p.name, p.description, p.module 
-- FROM permissions p 
-- WHERE p.module = 'BENEFIT_POLICIES' 
-- ORDER BY p.id;
