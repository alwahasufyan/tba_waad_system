-- ====================================================================
-- TBA-WAAD SYSTEM - COMPLETE RBAC FIX (MySQL)
-- ====================================================================
-- DESCRIPTION: 
-- This migration ensures the RBAC system is correctly configured with:
-- 1. SUPER_ADMIN role exists
-- 2. All required permissions exist (MANAGE_*/VIEW_* format)
-- 3. SUPER_ADMIN has ALL permissions
-- 4. superadmin user exists with SUPER_ADMIN role
--
-- SAFE TO RUN: Idempotent - can be run multiple times
-- ====================================================================

START TRANSACTION;

-- ====================================================================
-- STEP 1: CREATE SUPER_ADMIN ROLE (if not exists)
-- ====================================================================
INSERT INTO roles (name, description, created_at, updated_at)
SELECT 'SUPER_ADMIN', 'System Super Administrator with full access to all features', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'SUPER_ADMIN');

-- ====================================================================
-- STEP 2: CREATE ALL REQUIRED PERMISSIONS (Enterprise Format)
-- ====================================================================
-- Using MANAGE_* for CUD operations, VIEW_* for Read
-- These names match backend @PreAuthorize annotations

-- System Admin
INSERT IGNORE INTO permissions (name, description, module, created_at, updated_at) VALUES
('MANAGE_RBAC', 'Manage roles, permissions, and access control', 'SYSTEM', NOW(), NOW()),
('MANAGE_SYSTEM_SETTINGS', 'Manage system-wide settings', 'SYSTEM', NOW(), NOW()),
('VIEW_AUDIT_LOGS', 'View audit logs', 'SYSTEM', NOW(), NOW());

-- Employers Module
INSERT IGNORE INTO permissions (name, description, module, created_at, updated_at) VALUES
('VIEW_EMPLOYERS', 'View employers list and details', 'EMPLOYERS', NOW(), NOW()),
('MANAGE_EMPLOYERS', 'Create, update, delete employers', 'EMPLOYERS', NOW(), NOW());

-- Members Module
INSERT IGNORE INTO permissions (name, description, module, created_at, updated_at) VALUES
('VIEW_MEMBERS', 'View members list and details', 'MEMBERS', NOW(), NOW()),
('MANAGE_MEMBERS', 'Create, update, delete members', 'MEMBERS', NOW(), NOW()),
('IMPORT_MEMBERS', 'Bulk import members from Excel', 'MEMBERS', NOW(), NOW());

-- Providers Module
INSERT IGNORE INTO permissions (name, description, module, created_at, updated_at) VALUES
('VIEW_PROVIDERS', 'View providers list and details', 'PROVIDERS', NOW(), NOW()),
('MANAGE_PROVIDERS', 'Create, update, delete providers', 'PROVIDERS', NOW(), NOW());

-- Medical Categories Module
INSERT IGNORE INTO permissions (name, description, module, created_at, updated_at) VALUES
('VIEW_MEDICAL_CATEGORIES', 'View medical categories', 'MEDICAL', NOW(), NOW()),
('MANAGE_MEDICAL_CATEGORIES', 'Create, update, delete medical categories', 'MEDICAL', NOW(), NOW());

-- Medical Services Module
INSERT IGNORE INTO permissions (name, description, module, created_at, updated_at) VALUES
('VIEW_MEDICAL_SERVICES', 'View medical services', 'MEDICAL', NOW(), NOW()),
('MANAGE_MEDICAL_SERVICES', 'Create, update, delete medical services', 'MEDICAL', NOW(), NOW());

-- Medical Packages Module  
INSERT IGNORE INTO permissions (name, description, module, created_at, updated_at) VALUES
('VIEW_MEDICAL_PACKAGES', 'View medical packages', 'MEDICAL', NOW(), NOW()),
('MANAGE_MEDICAL_PACKAGES', 'Create, update, delete medical packages', 'MEDICAL', NOW(), NOW());

-- Benefit Packages Module
INSERT IGNORE INTO permissions (name, description, module, created_at, updated_at) VALUES
('VIEW_BENEFIT_PACKAGES', 'View benefit packages', 'BENEFITS', NOW(), NOW()),
('MANAGE_BENEFIT_PACKAGES', 'Create, update, delete benefit packages', 'BENEFITS', NOW(), NOW());

-- Benefit Policies Module
INSERT IGNORE INTO permissions (name, description, module, created_at, updated_at) VALUES
('VIEW_BENEFIT_POLICIES', 'View benefit policies', 'BENEFITS', NOW(), NOW()),
('MANAGE_BENEFIT_POLICIES', 'Create, update, delete benefit policies', 'BENEFITS', NOW(), NOW());

-- Policies Module
INSERT IGNORE INTO permissions (name, description, module, created_at, updated_at) VALUES
('VIEW_POLICIES', 'View insurance policies', 'POLICIES', NOW(), NOW()),
('MANAGE_POLICIES', 'Create, update, delete policies', 'POLICIES', NOW(), NOW());

-- Insurance Companies Module
INSERT IGNORE INTO permissions (name, description, module, created_at, updated_at) VALUES
('VIEW_INSURANCE_COMPANIES', 'View insurance companies', 'INSURANCE', NOW(), NOW()),
('MANAGE_INSURANCE_COMPANIES', 'Manage insurance companies', 'INSURANCE', NOW(), NOW());

-- Claims Module
INSERT IGNORE INTO permissions (name, description, module, created_at, updated_at) VALUES
('VIEW_CLAIMS', 'View claims', 'CLAIMS', NOW(), NOW()),
('MANAGE_CLAIMS', 'Create, update claims', 'CLAIMS', NOW(), NOW()),
('PROCESS_CLAIMS', 'Process and review claims', 'CLAIMS', NOW(), NOW()),
('APPROVE_CLAIMS', 'Approve claims', 'CLAIMS', NOW(), NOW()),
('REJECT_CLAIMS', 'Reject claims', 'CLAIMS', NOW(), NOW());

-- Pre-Approvals Module
INSERT IGNORE INTO permissions (name, description, module, created_at, updated_at) VALUES
('VIEW_PRE_APPROVALS', 'View pre-approvals', 'PREAUTH', NOW(), NOW()),
('MANAGE_PRE_APPROVALS', 'Manage pre-approvals', 'PREAUTH', NOW(), NOW()),
('PROCESS_PRE_APPROVALS', 'Process pre-approvals', 'PREAUTH', NOW(), NOW());

-- Visits Module
INSERT IGNORE INTO permissions (name, description, module, created_at, updated_at) VALUES
('VIEW_VISITS', 'View visits', 'VISITS', NOW(), NOW()),
('MANAGE_VISITS', 'Manage visits', 'VISITS', NOW(), NOW());

-- Users & Roles Module
INSERT IGNORE INTO permissions (name, description, module, created_at, updated_at) VALUES
('VIEW_USERS', 'View users', 'USERS', NOW(), NOW()),
('MANAGE_USERS', 'Manage users', 'USERS', NOW(), NOW()),
('VIEW_ROLES', 'View roles', 'ROLES', NOW(), NOW()),
('MANAGE_ROLES', 'Manage roles', 'ROLES', NOW(), NOW());

-- Reports Module
INSERT IGNORE INTO permissions (name, description, module, created_at, updated_at) VALUES
('VIEW_REPORTS', 'View reports', 'REPORTS', NOW(), NOW()),
('MANAGE_REPORTS', 'Create and manage reports', 'REPORTS', NOW(), NOW());

-- ====================================================================
-- STEP 3: ASSIGN ALL PERMISSIONS TO SUPER_ADMIN ROLE
-- ====================================================================
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'SUPER_ADMIN';

-- ====================================================================
-- STEP 4: CREATE/UPDATE SUPER_ADMIN USER
-- ====================================================================
-- Password: Admin@123
-- BCrypt hash compatible with Spring Security

INSERT INTO users (username, email, password, full_name, is_active, email_verified, created_at, updated_at)
SELECT 
    'superadmin',
    'superadmin@tba.sa',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'System Super Administrator',
    1,
    1,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'superadmin@tba.sa');

-- Update existing user password if needed
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    is_active = 1,
    email_verified = 1,
    updated_at = NOW()
WHERE email = 'superadmin@tba.sa';

-- ====================================================================
-- STEP 5: ASSIGN SUPER_ADMIN ROLE TO superadmin USER
-- ====================================================================
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'superadmin@tba.sa'
  AND r.name = 'SUPER_ADMIN';

-- ====================================================================
-- STEP 6: CREATE ADMIN ROLE WITH SAME PERMISSIONS (legacy support)
-- ====================================================================
INSERT INTO roles (name, description, created_at, updated_at)
SELECT 'ADMIN', 'Legacy Administrator role', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ADMIN');

-- Assign all permissions to ADMIN role as well
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ADMIN';

COMMIT;

-- ====================================================================
-- VERIFICATION QUERIES (Run these to confirm setup)
-- ====================================================================

-- Check roles
SELECT id, name, description FROM roles ORDER BY id;

-- Check SUPER_ADMIN user
SELECT id, username, email, full_name, is_active FROM users WHERE email = 'superadmin@tba.sa';

-- Check user has SUPER_ADMIN role
SELECT u.username, r.name as role_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'superadmin@tba.sa';

-- Count permissions per role
SELECT r.name, COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY r.id;

-- Total permissions in system
SELECT COUNT(*) as total_permissions FROM permissions;

-- ====================================================================
-- LOGIN CREDENTIALS
-- ====================================================================
-- Email: superadmin@tba.sa
-- Password: Admin@123
-- ====================================================================
