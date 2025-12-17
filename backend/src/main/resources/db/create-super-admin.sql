-- ============================================================
-- TBA-WAAD System - Create SUPER_ADMIN User
-- ============================================================
-- Creates a SUPER_ADMIN user if it doesn't exist
-- Password: Admin@123 (bcrypt hash)
-- Email: superadmin@tba.sa
-- ============================================================

-- Insert SUPER_ADMIN role if not exists
INSERT INTO roles (id, name, created_at, updated_at)
VALUES (1, 'SUPER_ADMIN', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert super admin user if not exists
-- Password: Admin@123 (bcrypt hash: $2a$10$...)
INSERT INTO users (
    id,
    username,
    email,
    password,
    full_name,
    is_active,
    created_at,
    updated_at
)
VALUES (
    1,
    'superadmin',
    'superadmin@tba.sa',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye7IX96VR3BmJhV/AnULMiELHK5sOGdWu', -- Admin@123
    'Super Admin',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    is_active = true,
    updated_at = NOW();

-- Assign SUPER_ADMIN role to user
INSERT INTO user_roles (user_id, role_id)
VALUES (1, 1)
ON CONFLICT DO NOTHING;

-- Verify creation
SELECT u.id, u.username, u.email, r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'superadmin@tba.sa';

SELECT 'SUPER_ADMIN user created successfully!' AS status;
