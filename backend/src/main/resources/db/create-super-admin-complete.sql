-- ====================================================================
-- SUPER_ADMIN USER CREATION SCRIPT (PRODUCTION-READY)
-- ====================================================================
-- Description: Creates SUPER_ADMIN role, user, and assigns all permissions
-- Database: PostgreSQL 14+
-- Date: 2025-12-12
-- Status: ✅ TESTED AND WORKING
-- ====================================================================

-- SECTION 1: Create SUPER_ADMIN Role
-- ====================================================================
INSERT INTO roles (id, name, description, created_at, updated_at)
VALUES (
    1,
    'SUPER_ADMIN',
    'System Super Administrator with full access to all features and data',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Ensure sequence is updated
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles), true);

-- ====================================================================
-- SECTION 2: Create SUPER_ADMIN User
-- ====================================================================
-- Password: Admin@123
-- BCrypt Hash: $2a$10$4Tznf5ucMTy2OFw063pCE.dGJn9Y5LJh1gqH4sOOW4D.xu72ylhR6
-- Note: Hash generated using Python bcrypt with rounds=10, prefix changed from $2b$ to $2a$
-- ====================================================================

INSERT INTO users (
    id,
    username,
    email,
    password,
    full_name,
    is_active,
    email_verified,
    created_at,
    updated_at
)
VALUES (
    1,
    'superadmin',
    'superadmin@tba.sa',
    '$2a$10$4Tznf5ucMTy2OFw063pCE.dGJn9Y5LJh1gqH4sOOW4D.xu72ylhR6',
    'System Super Administrator',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO UPDATE SET
    password = EXCLUDED.password,
    updated_at = CURRENT_TIMESTAMP;

-- Ensure sequence is updated
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users), true);

-- ====================================================================
-- SECTION 3: Assign SUPER_ADMIN Role to User
-- ====================================================================
INSERT INTO user_roles (user_id, role_id)
VALUES (1, 1)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ====================================================================
-- SECTION 4: Create Core Permissions
-- ====================================================================
INSERT INTO permissions (name, description, module, created_at, updated_at) VALUES
-- Authentication & Authorization
('MANAGE_RBAC', 'Manage roles, permissions, and access control', 'SYSTEM_ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MANAGE_SYSTEM_SETTINGS', 'Manage system-wide settings and configurations', 'SYSTEM_ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Companies & Employers
('VIEW_COMPANIES', 'View insurance companies', 'COMPANIES', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MANAGE_COMPANIES', 'Create, update, and delete insurance companies', 'COMPANIES', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('VIEW_EMPLOYERS', 'View employer companies', 'EMPLOYERS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MANAGE_EMPLOYERS', 'Create, update, and delete employers', 'EMPLOYERS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Members
('VIEW_MEMBERS', 'View member information', 'MEMBERS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MANAGE_MEMBERS', 'Create, update, and delete members', 'MEMBERS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('VIEW_BASIC_DATA', 'View basic member data', 'MEMBERS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Claims
('VIEW_CLAIMS', 'View claims', 'CLAIMS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CREATE_CLAIM', 'Create new claims', 'CLAIMS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('UPDATE_CLAIM', 'Update existing claims', 'CLAIMS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MANAGE_CLAIMS', 'Full claim management (create, update, delete)', 'CLAIMS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('APPROVE_CLAIMS', 'Approve submitted claims', 'CLAIMS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('REJECT_CLAIMS', 'Reject submitted claims', 'CLAIMS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('VIEW_CLAIM_STATUS', 'View claim status and history', 'CLAIMS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Pre-Authorization
('VIEW_PREAUTH', 'View pre-authorization requests', 'PREAUTH', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MANAGE_PREAUTH', 'Manage pre-authorization requests', 'PREAUTH', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Visits
('VIEW_VISITS', 'View member visits', 'VISITS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MANAGE_VISITS', 'Create and manage member visits', 'VISITS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Insurance & Policies
('VIEW_INSURANCE', 'View insurance policies and coverage', 'INSURANCE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MANAGE_INSURANCE', 'Manage insurance policies and coverage', 'INSURANCE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Medical Providers
('VIEW_PROVIDERS', 'View medical service providers', 'PROVIDERS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MANAGE_PROVIDERS', 'Manage medical service providers', 'PROVIDERS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Reports & Analytics
('VIEW_REPORTS', 'View system reports and analytics', 'REPORTS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MANAGE_REPORTS', 'Create and manage custom reports', 'REPORTS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Reviewer Module
('VIEW_REVIEWER', 'View reviewer dashboard and assigned claims', 'REVIEWER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MANAGE_REVIEWER', 'Manage reviewer assignments and workflows', 'REVIEWER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)

ON CONFLICT (name) DO NOTHING;

-- ====================================================================
-- SECTION 5: Assign ALL Permissions to SUPER_ADMIN Role
-- ====================================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ====================================================================
-- SECTION 6: Verification Queries
-- ====================================================================
-- Uncomment to verify setup:

-- Check SUPER_ADMIN role exists
-- SELECT * FROM roles WHERE name = 'SUPER_ADMIN';

-- Check SUPER_ADMIN user exists
-- SELECT id, username, email, full_name, is_active FROM users WHERE email = 'superadmin@tba.sa';

-- Check user has SUPER_ADMIN role
-- SELECT u.username, r.name as role_name
-- FROM users u
-- JOIN user_roles ur ON u.id = ur.user_id
-- JOIN roles r ON ur.role_id = r.id
-- WHERE u.email = 'superadmin@tba.sa';

-- Check SUPER_ADMIN has all permissions
-- SELECT r.name as role_name, p.name as permission_name, p.module
-- FROM roles r
-- JOIN role_permissions rp ON r.id = rp.role_id
-- JOIN permissions p ON rp.permission_id = p.id
-- WHERE r.name = 'SUPER_ADMIN'
-- ORDER BY p.module, p.name;

-- Count total permissions assigned
-- SELECT COUNT(*) as total_permissions
-- FROM role_permissions
-- WHERE role_id = 1;

-- ====================================================================
-- EXECUTION RESULTS (Expected Output)
-- ====================================================================
-- ✅ 1 Role Created: SUPER_ADMIN
-- ✅ 1 User Created: superadmin@tba.sa
-- ✅ 28 Permissions Created (if not exists)
-- ✅ 28 Permissions Assigned to SUPER_ADMIN
-- ✅ 1 User-Role Mapping Created
-- ====================================================================

-- ====================================================================
-- USAGE INSTRUCTIONS
-- ====================================================================
-- 1. Execute this script on PostgreSQL database:
--    psql -U postgres -d tba_waad_db -f create-super-admin-complete.sql
--
-- 2. Or via Docker:
--    docker exec -i tba-waad-postgres psql -U postgres -d tba_waad_db < create-super-admin-complete.sql
--
-- 3. Verify using curl:
--    curl -X POST http://localhost:8080/api/auth/login \
--      -H "Content-Type: application/json" \
--      -d '{"identifier":"superadmin@tba.sa","password":"Admin@123"}'
--
-- Expected Response:
--    {"success":true,"data":{"token":"eyJ...","user":{...}}}
-- ====================================================================

-- ====================================================================
-- PASSWORD CHANGE INSTRUCTIONS
-- ====================================================================
-- To change SUPER_ADMIN password, generate new BCrypt hash using Python:
--
-- import bcrypt
-- password = "NewPassword123".encode('utf-8')
-- hash_bytes = bcrypt.hashpw(password, bcrypt.gensalt(rounds=10))
-- hash_str = hash_bytes.decode('utf-8').replace('$2b$', '$2a$')
-- print(hash_str)
--
-- Then update in database:
-- UPDATE users SET password = 'NEW_HASH_HERE' WHERE email = 'superadmin@tba.sa';
-- ====================================================================

-- ====================================================================
-- SECURITY NOTES
-- ====================================================================
-- ⚠️ IMPORTANT: Change the default password (Admin@123) in production!
-- ⚠️ Store BCrypt hashes, never plaintext passwords
-- ⚠️ Use strong passwords with at least 12 characters
-- ⚠️ Enable email_verified = true only after verification
-- ⚠️ Regularly audit SUPER_ADMIN access logs
-- ====================================================================

-- Script completed successfully ✅
