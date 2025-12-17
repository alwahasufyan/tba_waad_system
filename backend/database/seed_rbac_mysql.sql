-- ====================================================================
-- TBA-WAAD SYSTEM - COMPLETE RBAC SEED DATA (MySQL Version)
-- ====================================================================
-- This script initializes the complete RBAC system with roles, permissions, and users
-- Password for all users: Admin@123 (BCrypt hash)
-- Run this script AFTER the backend creates the schema (ddl-auto: update)
--
-- MySQL Specific Features:
-- - Uses ON DUPLICATE KEY UPDATE instead of ON CONFLICT
-- - Uses AUTO_INCREMENT for sequences
-- - Uses NOW() for timestamps
-- ====================================================================

START TRANSACTION;

-- ====================================================================
-- STEP 1: INSERT ROLES
-- ====================================================================
INSERT INTO roles (id, name, description, created_at, updated_at) VALUES
(1, 'ADMIN', 'System Administrator with full access to all modules', NOW(), NOW()),
(2, 'USER', 'Regular user with read-only access', NOW(), NOW()),
(3, 'MANAGER', 'Manager with create/update permissions but not delete', NOW(), NOW()),
(4, 'REVIEWER', 'Reviewer for claims and pre-authorizations only', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  description = VALUES(description),
  updated_at = NOW();

-- ====================================================================
-- STEP 2: INSERT ALL PERMISSIONS
-- ====================================================================
-- Total: 58 permissions across 14 modules

-- Members Module (11-14)
INSERT INTO permissions (id, name, description, module, created_at, updated_at) VALUES
(11, 'MEMBER_READ', 'View members', 'MEMBERS', NOW(), NOW()),
(12, 'MEMBER_CREATE', 'Create members', 'MEMBERS', NOW(), NOW()),
(13, 'MEMBER_UPDATE', 'Update members', 'MEMBERS', NOW(), NOW()),
(14, 'MEMBER_DELETE', 'Delete members', 'MEMBERS', NOW(), NOW()),

-- Employers Module (21-24)
(21, 'EMPLOYER_READ', 'View employers', 'EMPLOYERS', NOW(), NOW()),
(22, 'EMPLOYER_CREATE', 'Create employers', 'EMPLOYERS', NOW(), NOW()),
(23, 'EMPLOYER_UPDATE', 'Update employers', 'EMPLOYERS', NOW(), NOW()),
(24, 'EMPLOYER_DELETE', 'Delete employers', 'EMPLOYERS', NOW(), NOW()),

-- Medical Services Module (31-34)
(31, 'MEDICAL_SERVICE_READ', 'View medical services', 'MEDICAL_SERVICES', NOW(), NOW()),
(32, 'MEDICAL_SERVICE_CREATE', 'Create medical services', 'MEDICAL_SERVICES', NOW(), NOW()),
(33, 'MEDICAL_SERVICE_UPDATE', 'Update medical services', 'MEDICAL_SERVICES', NOW(), NOW()),
(34, 'MEDICAL_SERVICE_DELETE', 'Delete medical services', 'MEDICAL_SERVICES', NOW(), NOW()),

-- Medical Packages Module (41-44)
(41, 'MEDICAL_PACKAGE_READ', 'View medical packages', 'MEDICAL_PACKAGES', NOW(), NOW()),
(42, 'MEDICAL_PACKAGE_CREATE', 'Create medical packages', 'MEDICAL_PACKAGES', NOW(), NOW()),
(43, 'MEDICAL_PACKAGE_UPDATE', 'Update medical packages', 'MEDICAL_PACKAGES', NOW(), NOW()),
(44, 'MEDICAL_PACKAGE_DELETE', 'Delete medical packages', 'MEDICAL_PACKAGES', NOW(), NOW()),

-- Medical Categories Module (51-54)
(51, 'MEDICAL_CATEGORY_READ', 'View medical categories', 'MEDICAL_CATEGORIES', NOW(), NOW()),
(52, 'MEDICAL_CATEGORY_CREATE', 'Create medical categories', 'MEDICAL_CATEGORIES', NOW(), NOW()),
(53, 'MEDICAL_CATEGORY_UPDATE', 'Update medical categories', 'MEDICAL_CATEGORIES', NOW(), NOW()),
(54, 'MEDICAL_CATEGORY_DELETE', 'Delete medical categories', 'MEDICAL_CATEGORIES', NOW(), NOW()),

-- Policies Module (61-64)
(61, 'POLICY_READ', 'View policies', 'POLICIES', NOW(), NOW()),
(62, 'POLICY_CREATE', 'Create policies', 'POLICIES', NOW(), NOW()),
(63, 'POLICY_UPDATE', 'Update policies', 'POLICIES', NOW(), NOW()),
(64, 'POLICY_DELETE', 'Delete policies', 'POLICIES', NOW(), NOW()),

-- Benefit Packages Module (71-74)
(71, 'BENEFIT_PACKAGE_READ', 'View benefit packages', 'BENEFIT_PACKAGES', NOW(), NOW()),
(72, 'BENEFIT_PACKAGE_CREATE', 'Create benefit packages', 'BENEFIT_PACKAGES', NOW(), NOW()),
(73, 'BENEFIT_PACKAGE_UPDATE', 'Update benefit packages', 'BENEFIT_PACKAGES', NOW(), NOW()),
(74, 'BENEFIT_PACKAGE_DELETE', 'Delete benefit packages', 'BENEFIT_PACKAGES', NOW(), NOW()),

-- Claims Module (81-85)
(81, 'CLAIM_READ', 'View claims', 'CLAIMS', NOW(), NOW()),
(82, 'CLAIM_CREATE', 'Create claims', 'CLAIMS', NOW(), NOW()),
(83, 'CLAIM_UPDATE', 'Update claims', 'CLAIMS', NOW(), NOW()),
(84, 'CLAIM_DELETE', 'Delete claims', 'CLAIMS', NOW(), NOW()),
(85, 'CLAIM_APPROVE', 'Approve/Reject claims', 'CLAIMS', NOW(), NOW()),

-- Visits Module (91-94)
(91, 'VISIT_READ', 'View visits', 'VISITS', NOW(), NOW()),
(92, 'VISIT_CREATE', 'Create visits', 'VISITS', NOW(), NOW()),
(93, 'VISIT_UPDATE', 'Update visits', 'VISITS', NOW(), NOW()),
(94, 'VISIT_DELETE', 'Delete visits', 'VISITS', NOW(), NOW()),

-- Pre-Authorizations Module (101-105)
(101, 'PREAUTH_READ', 'View pre-authorizations', 'PREAUTHORIZATIONS', NOW(), NOW()),
(102, 'PREAUTH_CREATE', 'Create pre-authorizations', 'PREAUTHORIZATIONS', NOW(), NOW()),
(103, 'PREAUTH_UPDATE', 'Update pre-authorizations', 'PREAUTHORIZATIONS', NOW(), NOW()),
(104, 'PREAUTH_DELETE', 'Delete pre-authorizations', 'PREAUTHORIZATIONS', NOW(), NOW()),
(105, 'PREAUTH_APPROVE', 'Approve/Reject pre-authorizations', 'PREAUTHORIZATIONS', NOW(), NOW()),

-- Reviewer Companies Module (111-114)
(111, 'REVIEWER_COMPANY_READ', 'View reviewer companies', 'REVIEWER_COMPANIES', NOW(), NOW()),
(112, 'REVIEWER_COMPANY_CREATE', 'Create reviewer companies', 'REVIEWER_COMPANIES', NOW(), NOW()),
(113, 'REVIEWER_COMPANY_UPDATE', 'Update reviewer companies', 'REVIEWER_COMPANIES', NOW(), NOW()),
(114, 'REVIEWER_COMPANY_DELETE', 'Delete reviewer companies', 'REVIEWER_COMPANIES', NOW(), NOW()),

-- Users Module (121-124)
(121, 'USER_READ', 'View users', 'USERS', NOW(), NOW()),
(122, 'USER_CREATE', 'Create users', 'USERS', NOW(), NOW()),
(123, 'USER_UPDATE', 'Update users', 'USERS', NOW(), NOW()),
(124, 'USER_DELETE', 'Delete users', 'USERS', NOW(), NOW()),

-- Roles Module (131-134)
(131, 'ROLE_READ', 'View roles', 'ROLES', NOW(), NOW()),
(132, 'ROLE_CREATE', 'Create roles', 'ROLES', NOW(), NOW()),
(133, 'ROLE_UPDATE', 'Update roles', 'ROLES', NOW(), NOW()),
(134, 'ROLE_DELETE', 'Delete roles', 'ROLES', NOW(), NOW()),

-- System Settings Module (141-144)
(141, 'SYSTEM_SETTINGS_READ', 'View system settings', 'SYSTEM', NOW(), NOW()),
(142, 'SYSTEM_SETTINGS_UPDATE', 'Update system settings', 'SYSTEM', NOW(), NOW()),
(143, 'AUDIT_LOG_READ', 'View audit logs', 'SYSTEM', NOW(), NOW()),
(144, 'SYSTEM_ADMIN', 'Full system administration access', 'SYSTEM', NOW(), NOW())

ON DUPLICATE KEY UPDATE 
  description = VALUES(description),
  module = VALUES(module),
  updated_at = NOW();

-- ====================================================================
-- STEP 3: ASSIGN PERMISSIONS TO ROLES
-- ====================================================================

-- 3.1: ADMIN Role - Gets ALL 58 permissions
DELETE FROM role_permissions WHERE role_id = 1;
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- 3.2: USER Role - Gets only READ permissions (14 permissions)
DELETE FROM role_permissions WHERE role_id = 2;
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE name LIKE '%_READ';

-- 3.3: MANAGER Role - Gets READ, CREATE, UPDATE but NOT DELETE (42 permissions)
DELETE FROM role_permissions WHERE role_id = 3;
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions 
WHERE name LIKE '%_READ' 
   OR name LIKE '%_CREATE' 
   OR name LIKE '%_UPDATE';

-- 3.4: REVIEWER Role - Only claims and pre-auth review (6 permissions)
DELETE FROM role_permissions WHERE role_id = 4;
INSERT INTO role_permissions (role_id, permission_id) VALUES
(4, 81),  -- CLAIM_READ
(4, 85),  -- CLAIM_APPROVE
(4, 101), -- PREAUTH_READ
(4, 105), -- PREAUTH_APPROVE
(4, 91),  -- VISIT_READ
(4, 11);  -- MEMBER_READ

-- ====================================================================
-- STEP 4: CREATE USERS
-- ====================================================================
-- Password for ALL users: Admin@123
-- BCrypt hash (strength 10): $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

-- 4.1: Admin User
INSERT INTO users (id, username, email, password, full_name, is_active, email_verified, created_at, updated_at)
VALUES (
  1,
  'admin',
  'admin@tba.sa',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'System Administrator',
  true,
  true,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  password = VALUES(password),
  full_name = VALUES(full_name),
  is_active = VALUES(is_active),
  email_verified = VALUES(email_verified),
  updated_at = NOW();

-- 4.2: Regular User
INSERT INTO users (id, username, email, password, full_name, is_active, email_verified, created_at, updated_at)
VALUES (
  2,
  'user',
  'user@tba.sa',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Regular User',
  true,
  true,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  password = VALUES(password),
  full_name = VALUES(full_name),
  updated_at = NOW();

-- 4.3: Manager User
INSERT INTO users (id, username, email, password, full_name, is_active, email_verified, created_at, updated_at)
VALUES (
  3,
  'manager',
  'manager@tba.sa',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Manager User',
  true,
  true,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  password = VALUES(password),
  full_name = VALUES(full_name),
  updated_at = NOW();

-- 4.4: Reviewer User
INSERT INTO users (id, username, email, password, full_name, is_active, email_verified, created_at, updated_at)
VALUES (
  4,
  'reviewer',
  'reviewer@tba.sa',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Reviewer User',
  true,
  true,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  password = VALUES(password),
  full_name = VALUES(full_name),
  updated_at = NOW();

-- ====================================================================
-- STEP 5: ASSIGN ROLES TO USERS
-- ====================================================================

INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),  -- admin -> ADMIN
(2, 2),  -- user -> USER
(3, 3),  -- manager -> MANAGER
(4, 4)   -- reviewer -> REVIEWER
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);

-- ====================================================================
-- STEP 6: RESET AUTO_INCREMENT (MySQL specific)
-- ====================================================================

ALTER TABLE users AUTO_INCREMENT = 5;
ALTER TABLE roles AUTO_INCREMENT = 5;
ALTER TABLE permissions AUTO_INCREMENT = 145;

COMMIT;

-- ====================================================================
-- STEP 7: VERIFICATION QUERIES
-- ====================================================================

-- Show all roles with permission counts
SELECT 
  r.id,
  r.name as role_name,
  r.description,
  COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name, r.description
ORDER BY r.id;

-- Show all users with their roles
SELECT 
  u.id,
  u.username,
  u.email,
  u.full_name,
  GROUP_CONCAT(r.name SEPARATOR ', ') as roles,
  u.is_active,
  u.email_verified
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.username, u.email, u.full_name, u.is_active, u.email_verified
ORDER BY u.id;

-- ====================================================================
-- LOGIN CREDENTIALS
-- ====================================================================
/*
All users have the same password: Admin@123

Test Accounts:
--------------
1. Admin (Full Access):
   Username: admin
   Email: admin@tba.sa
   Password: Admin@123
   Permissions: ALL (58 permissions)

2. Regular User (Read-Only):
   Username: user
   Email: user@tba.sa
   Password: Admin@123
   Permissions: 14 READ permissions only

3. Manager (Create/Update):
   Username: manager
   Email: manager@tba.sa
   Password: Admin@123
   Permissions: 42 (READ + CREATE + UPDATE, no DELETE)

4. Reviewer (Claims/PreAuth):
   Username: reviewer
   Email: reviewer@tba.sa
   Password: Admin@123
   Permissions: 6 (claims and pre-auth review only)

Login via POST /api/auth/login with body:
{
  "identifier": "admin",
  "password": "Admin@123"
}
*/

-- ====================================================================
-- END OF SEED SCRIPT (MySQL Version)
-- ====================================================================
