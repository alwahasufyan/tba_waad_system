-- ============================================================================
-- MEMBER ATTRIBUTES & IMPORT AUDIT SCHEMA
-- Version: 2025.12.23.002
-- 
-- Purpose: Flexible member attributes and bulk import tracking
-- Compatible with Odoo hr.employee.public exports
-- ============================================================================

-- ============================================================================
-- 1. MEMBER ATTRIBUTES TABLE
-- Flexible key-value storage for dynamic member properties
-- ============================================================================

CREATE TABLE IF NOT EXISTS member_attributes (
    id BIGSERIAL PRIMARY KEY,
    
    -- Reference to member
    member_id BIGINT NOT NULL,
    
    -- Attribute key-value pair
    attribute_code VARCHAR(100) NOT NULL,     -- e.g., 'job_title', 'department', 'grade'
    attribute_value TEXT,                      -- The value (can be large text)
    
    -- Data source tracking
    source VARCHAR(50) DEFAULT 'MANUAL',       -- MANUAL, IMPORT, ODOO, API
    source_reference VARCHAR(200),             -- Reference ID from source system
    
    -- Audit fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    
    -- Constraints
    CONSTRAINT fk_member_attribute_member 
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    
    -- Unique constraint: one attribute_code per member
    CONSTRAINT uk_member_attribute_code 
        UNIQUE (member_id, attribute_code)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_member_attr_member ON member_attributes(member_id);
CREATE INDEX IF NOT EXISTS idx_member_attr_code ON member_attributes(attribute_code);
CREATE INDEX IF NOT EXISTS idx_member_attr_source ON member_attributes(source);
CREATE INDEX IF NOT EXISTS idx_member_attr_value ON member_attributes(attribute_value) WHERE attribute_value IS NOT NULL;

COMMENT ON TABLE member_attributes IS 'Flexible key-value attributes for members. Supports dynamic fields from imports.';
COMMENT ON COLUMN member_attributes.attribute_code IS 'Attribute key: job_title, department, location, grade, etc.';
COMMENT ON COLUMN member_attributes.source IS 'Data origin: MANUAL, IMPORT, ODOO, API';


-- ============================================================================
-- 2. MEMBER IMPORT LOGS TABLE
-- Audit trail for bulk imports
-- ============================================================================

CREATE TABLE IF NOT EXISTS member_import_logs (
    id BIGSERIAL PRIMARY KEY,
    
    -- Import identification
    import_batch_id VARCHAR(64) NOT NULL UNIQUE,  -- UUID for batch tracking
    file_name VARCHAR(500),                        -- Original file name
    file_size_bytes BIGINT,                        -- File size
    
    -- Import statistics
    total_rows INTEGER DEFAULT 0,
    created_count INTEGER DEFAULT 0,
    updated_count INTEGER DEFAULT 0,
    skipped_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',  -- PENDING, PROCESSING, COMPLETED, FAILED
    error_message TEXT,
    
    -- Processing details
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    processing_time_ms BIGINT,
    
    -- Security context
    imported_by_user_id BIGINT,
    imported_by_username VARCHAR(100),
    company_scope_id BIGINT,                        -- Organization scope
    ip_address VARCHAR(45),
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_import_log_batch ON member_import_logs(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_import_log_user ON member_import_logs(imported_by_user_id);
CREATE INDEX IF NOT EXISTS idx_import_log_status ON member_import_logs(status);
CREATE INDEX IF NOT EXISTS idx_import_log_date ON member_import_logs(created_at);

COMMENT ON TABLE member_import_logs IS 'Audit log for bulk member imports. Tracks who imported what and when.';


-- ============================================================================
-- 3. MEMBER IMPORT ERRORS TABLE
-- Detailed error records for failed rows
-- ============================================================================

CREATE TABLE IF NOT EXISTS member_import_errors (
    id BIGSERIAL PRIMARY KEY,
    
    -- Reference to import batch
    import_log_id BIGINT NOT NULL,
    
    -- Row details
    row_number INTEGER NOT NULL,
    row_data JSONB,                               -- Original row data as JSON
    
    -- Error details
    error_type VARCHAR(50),                       -- VALIDATION, DUPLICATE, MAPPING, SYSTEM
    error_field VARCHAR(100),                     -- Which field caused error
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_import_error_log 
        FOREIGN KEY (import_log_id) REFERENCES member_import_logs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_import_error_log ON member_import_errors(import_log_id);
CREATE INDEX IF NOT EXISTS idx_import_error_type ON member_import_errors(error_type);

COMMENT ON TABLE member_import_errors IS 'Detailed error records for failed import rows.';


-- ============================================================================
-- 4. ATTRIBUTE DEFINITIONS TABLE (Optional - for UI metadata)
-- Defines available attributes for forms and validation
-- ============================================================================

CREATE TABLE IF NOT EXISTS member_attribute_definitions (
    id BIGSERIAL PRIMARY KEY,
    
    -- Attribute definition
    attribute_code VARCHAR(100) NOT NULL UNIQUE,
    display_name_en VARCHAR(200),
    display_name_ar VARCHAR(200),
    description TEXT,
    
    -- Type and validation
    data_type VARCHAR(30) DEFAULT 'TEXT',         -- TEXT, NUMBER, DATE, BOOLEAN, SELECT
    validation_regex VARCHAR(500),
    allowed_values TEXT,                          -- JSON array for SELECT type
    default_value VARCHAR(500),
    
    -- UI configuration
    is_required BOOLEAN DEFAULT FALSE,
    is_searchable BOOLEAN DEFAULT TRUE,
    is_visible BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    
    -- Import mapping
    odoo_field_name VARCHAR(100),                 -- Mapping to Odoo hr.employee.public field
    excel_column_name VARCHAR(200),               -- Expected Excel column header
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed common attribute definitions
INSERT INTO member_attribute_definitions (attribute_code, display_name_en, display_name_ar, odoo_field_name, excel_column_name, data_type, display_order)
VALUES 
    ('job_title', 'Job Title', 'المسمى الوظيفي', 'job_title', 'Job Title', 'TEXT', 1),
    ('department', 'Department', 'القسم', 'department_id', 'Department', 'TEXT', 2),
    ('work_location', 'Work Location', 'موقع العمل', 'work_location_id', 'Work Location', 'TEXT', 3),
    ('grade', 'Grade/Level', 'الدرجة', 'x_grade', 'Grade', 'TEXT', 4),
    ('manager', 'Manager Name', 'المدير', 'parent_id', 'Manager', 'TEXT', 5),
    ('cost_center', 'Cost Center', 'مركز التكلفة', 'x_cost_center', 'Cost Center', 'TEXT', 6),
    ('work_email', 'Work Email', 'البريد الإلكتروني للعمل', 'work_email', 'Work Email', 'TEXT', 7),
    ('work_phone', 'Work Phone', 'هاتف العمل', 'work_phone', 'Work Phone', 'TEXT', 8),
    ('mobile_phone', 'Mobile Phone', 'الجوال', 'mobile_phone', 'Mobile', 'TEXT', 9),
    ('badge_id', 'Badge ID', 'رقم البطاقة', 'barcode', 'Badge ID', 'TEXT', 10),
    ('hire_date', 'Hire Date', 'تاريخ التعيين', 'x_hire_date', 'Hire Date', 'DATE', 11),
    ('contract_type', 'Contract Type', 'نوع العقد', 'x_contract_type', 'Contract Type', 'TEXT', 12)
ON CONFLICT (attribute_code) DO NOTHING;


-- ============================================================================
-- 5. ADD IMPORT PERMISSIONS
-- ============================================================================

INSERT INTO permissions (name, description, module, created_at, updated_at)
SELECT 'members.import', 'Import members from Excel - استيراد الأعضاء من Excel', 'MEMBERS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'members.import');

INSERT INTO permissions (name, description, module, created_at, updated_at)
SELECT 'members.export', 'Export members to Excel - تصدير الأعضاء إلى Excel', 'MEMBERS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'members.export');

INSERT INTO permissions (name, description, module, created_at, updated_at)
SELECT 'members.import_logs', 'View import history logs - عرض سجل الاستيراد', 'MEMBERS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'members.import_logs');

-- Assign import permission to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'ADMIN' AND p.name = 'members.import'
AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'ADMIN' AND p.name = 'members.export'
AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'ADMIN' AND p.name = 'members.import_logs'
AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);


-- ============================================================================
-- DONE
-- ============================================================================
