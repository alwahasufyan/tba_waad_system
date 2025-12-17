-- ============================================
-- TBA-WAAD RBAC System Database Schema (PostgreSQL)
-- Spring Boot 3.x + JPA + PostgreSQL
-- ============================================

-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;

-- ============================================
-- 1. PERMISSIONS TABLE
-- ============================================
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for better performance
CREATE INDEX idx_permissions_name ON permissions(name);

-- ============================================
-- 2. ROLES TABLE
-- ============================================
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for better performance
CREATE INDEX idx_roles_name ON roles(name);

-- ============================================
-- 3. ROLE_PERMISSIONS TABLE (Many-to-Many)
-- ============================================
CREATE TABLE role_permissions (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role_id, permission_id)
);

-- Add indexes for better performance
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_role_permissions_active ON role_permissions(active);

-- ============================================
-- 4. USER_ROLES TABLE (Many-to-Many with User)
-- ============================================
CREATE TABLE user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE(user_id, role_id)
);

-- Add indexes for better performance
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_roles_active ON user_roles(active);

-- ============================================
-- 5. UPDATE TRIGGER FOR TIMESTAMPS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_role_permissions_updated_at BEFORE UPDATE ON role_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. SEED DATA - PERMISSIONS
-- ============================================
INSERT INTO permissions (name, description) VALUES
    ('CREATE_USER', 'إنشاء مستخدم جديد'),
    ('READ_USER', 'عرض بيانات المستخدمين'),
    ('UPDATE_USER', 'تحديث بيانات المستخدم'),
    ('DELETE_USER', 'حذف مستخدم'),
    
    ('CREATE_MEMBER', 'إنشاء عضو جديد'),
    ('READ_MEMBER', 'عرض بيانات الأعضاء'),
    ('UPDATE_MEMBER', 'تحديث بيانات العضو'),
    ('DELETE_MEMBER', 'حذف عضو'),
    
    ('CREATE_CLAIM', 'إنشاء مطالبة جديدة'),
    ('READ_CLAIM', 'عرض المطالبات'),
    ('UPDATE_CLAIM', 'تحديث المطالبة'),
    ('DELETE_CLAIM', 'حذف مطالبة'),
    ('APPROVE_CLAIM', 'الموافقة على المطالبة'),
    ('REJECT_CLAIM', 'رفض المطالبة'),
    
    ('CREATE_ROLE', 'إنشاء دور جديد'),
    ('READ_ROLE', 'عرض الأدوار'),
    ('UPDATE_ROLE', 'تحديث الدور'),
    ('DELETE_ROLE', 'حذف دور'),
    
    ('CREATE_PERMISSION', 'إنشاء صلاحية جديدة'),
    ('READ_PERMISSION', 'عرض الصلاحيات'),
    ('UPDATE_PERMISSION', 'تحديث الصلاحية'),
    ('DELETE_PERMISSION', 'حذف صلاحية'),
    
    ('MANAGE_SYSTEM', 'إدارة النظام الكاملة'),
    
    ('VIEW_REPORTS', 'عرض التقارير'),
    ('CREATE_REPORTS', 'إنشاء التقارير'),
    ('EXPORT_DATA', 'تصدير البيانات'),
    ('IMPORT_DATA', 'استيراد البيانات'),
    
    ('MANAGE_ORGANIZATIONS', 'إدارة المنظمات'),
    ('MANAGE_PROVIDERS', 'إدارة مزودي الخدمة'),
    ('MANAGE_INSURANCE_COMPANIES', 'إدارة شركات التأمين')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 7. SEED DATA - ROLES
-- ============================================
INSERT INTO roles (name, description) VALUES
    ('ADMIN', 'مدير النظام الكامل - صلاحيات كاملة'),
    ('REVIEW', 'شركة المراجعة الطبية (وعد) - مراجعة وموافقة المطالبات'),
    ('INSURANCE', 'شركة التأمين (الواحة) - إدارة الأعضاء والمطالبات'),
    ('EMPLOYER', 'صاحب العمل - عرض الأعضاء والتقارير'),
    ('PROVIDER', 'مزود الخدمة (مستشفى/عيادة) - إنشاء المطالبات'),
    ('MEMBER', 'العضو المؤمن عليه - عرض مطالباته الشخصية')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 8. SEED DATA - ROLE PERMISSIONS MAPPING
-- ============================================

-- ADMIN Role - All Permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- REVIEW Role Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'REVIEW' AND p.name IN (
    'READ_USER', 'READ_MEMBER', 'READ_CLAIM', 'APPROVE_CLAIM', 'REJECT_CLAIM',
    'READ_ROLE', 'READ_PERMISSION', 'VIEW_REPORTS'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- INSURANCE Role Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'INSURANCE' AND p.name IN (
    'READ_USER', 'CREATE_MEMBER', 'READ_MEMBER', 'UPDATE_MEMBER',
    'READ_CLAIM', 'APPROVE_CLAIM', 'REJECT_CLAIM', 'VIEW_REPORTS',
    'MANAGE_ORGANIZATIONS'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- EMPLOYER Role Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'EMPLOYER' AND p.name IN (
    'READ_MEMBER', 'READ_CLAIM', 'VIEW_REPORTS'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- PROVIDER Role Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'PROVIDER' AND p.name IN (
    'CREATE_CLAIM', 'READ_CLAIM', 'UPDATE_CLAIM'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- MEMBER Role Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'MEMBER' AND p.name IN (
    'READ_CLAIM'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================
-- 9. VERIFICATION QUERIES
-- ============================================

-- Count permissions
SELECT 'Total Permissions' as info, COUNT(*) as count FROM permissions;

-- Count roles
SELECT 'Total Roles' as info, COUNT(*) as count FROM roles;

-- Count role-permission mappings
SELECT 'Total Role-Permission Mappings' as info, COUNT(*) as count FROM role_permissions;

-- Show role permissions summary
SELECT 
    r.name as role_name, 
    r.description as role_description,
    COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id AND rp.active = true
GROUP BY r.id, r.name, r.description
ORDER BY r.name;

-- Show detailed role permissions
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.description as permission_description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id AND rp.active = true
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.name, p.name;

-- ============================================
-- 10. SECURITY NOTES
-- ============================================

/*
SECURITY CONSIDERATIONS:

1. Role Hierarchy:
   - ADMIN: Full system access
   - REVIEW: Medical review company (WAAD)
   - INSURANCE: Insurance company (WAHDA) 
   - EMPLOYER: Organization/company HR
   - PROVIDER: Healthcare providers
   - MEMBER: Insured individuals

2. Permission Design:
   - Granular permissions for fine-grained access control
   - Resource-based permissions (CREATE_X, READ_X, UPDATE_X, DELETE_X)
   - Business-specific permissions (APPROVE_CLAIM, REJECT_CLAIM)

3. Data Integrity:
   - Foreign key constraints ensure referential integrity
   - Unique constraints prevent duplicate assignments
   - Active flag for soft disable without data loss

4. Performance:
   - Indexes on frequently queried columns
   - Efficient junction table design
   - Optimized for Spring Security integration

5. Extensibility:
   - Easy to add new permissions
   - Easy to add new roles
   - Supports complex role hierarchies
   - JWT integration ready
*/