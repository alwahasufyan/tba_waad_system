-- Medical Packages Module Migration
-- Date: 2024-11-27
-- Purpose: Create medical_packages table and many-to-many relationship with medical_services

-- Create medical_packages table
CREATE TABLE IF NOT EXISTS medical_packages (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    total_coverage_limit NUMERIC(15, 2),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_medical_package_code UNIQUE (code)
);

-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS medical_package_services (
    package_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    
    PRIMARY KEY (package_id, service_id),
    
    CONSTRAINT fk_package_services_package FOREIGN KEY (package_id)
        REFERENCES medical_packages(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_package_services_service FOREIGN KEY (service_id)
        REFERENCES medical_services(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_medical_packages_code ON medical_packages(code);
CREATE INDEX idx_medical_packages_active ON medical_packages(active);
CREATE INDEX idx_medical_package_services_package ON medical_package_services(package_id);
CREATE INDEX idx_medical_package_services_service ON medical_package_services(service_id);

-- Insert RBAC permissions for medical packages
INSERT INTO permissions (name, description, module, created_at, updated_at) 
VALUES 
    ('MEDICAL_PACKAGE_READ', 'View medical packages', 'MEDICAL_PACKAGES', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('MEDICAL_PACKAGE_CREATE', 'Create medical packages', 'MEDICAL_PACKAGES', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('MEDICAL_PACKAGE_UPDATE', 'Update medical packages', 'MEDICAL_PACKAGES', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('MEDICAL_PACKAGE_DELETE', 'Delete medical packages', 'MEDICAL_PACKAGES', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- Grant permissions to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ADMIN' 
  AND p.name IN ('MEDICAL_PACKAGE_READ', 'MEDICAL_PACKAGE_CREATE', 'MEDICAL_PACKAGE_UPDATE', 'MEDICAL_PACKAGE_DELETE')
ON CONFLICT DO NOTHING;

-- Sample data (optional)
-- INSERT INTO medical_packages (code, name_ar, name_en, description, total_coverage_limit, active)
-- VALUES 
--     ('PKG-BASIC', 'الباقة الأساسية', 'Basic Package', 'Basic medical services package', 1000.00, true),
--     ('PKG-PREMIUM', 'الباقة المميزة', 'Premium Package', 'Premium medical services with extended coverage', 5000.00, true),
--     ('PKG-VIP', 'باقة VIP', 'VIP Package', 'Comprehensive VIP medical coverage', 10000.00, true);

COMMENT ON TABLE medical_packages IS 'Medical packages containing groups of medical services';
COMMENT ON TABLE medical_package_services IS 'Junction table linking packages to services (many-to-many)';
COMMENT ON COLUMN medical_packages.code IS 'Unique package code identifier';
COMMENT ON COLUMN medical_packages.total_coverage_limit IS 'Total coverage limit for all services in this package (LYD)';
