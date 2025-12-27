-- Migration V21: RBAC Permissions for Provider Contracts Module
-- Last Updated: 2024-12-24

-- ═══════════════════════════════════════════════════════════════════════════
-- Insert Provider Contracts permissions
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO permissions (name, description, module, created_at, updated_at)
VALUES 
    ('provider_contracts.view', 'View provider contracts', 'provider_contracts', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('provider_contracts.create', 'Create provider contracts', 'provider_contracts', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('provider_contracts.update', 'Update provider contracts', 'provider_contracts', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('provider_contracts.delete', 'Delete provider contracts', 'provider_contracts', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('provider_contracts.activate', 'Activate/suspend/terminate contracts', 'provider_contracts', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('provider_contracts.pricing.view', 'View contract pricing items', 'provider_contracts', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('provider_contracts.pricing.manage', 'Manage contract pricing items', 'provider_contracts', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- Grant permissions to SUPER_ADMIN role
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r, permissions p
WHERE r.name = 'SUPER_ADMIN' 
  AND p.name IN (
    'provider_contracts.view',
    'provider_contracts.create',
    'provider_contracts.update',
    'provider_contracts.delete',
    'provider_contracts.activate',
    'provider_contracts.pricing.view',
    'provider_contracts.pricing.manage'
  )
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- Grant view permissions to ADMIN role
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r, permissions p
WHERE r.name = 'ADMIN' 
  AND p.name IN (
    'provider_contracts.view',
    'provider_contracts.create',
    'provider_contracts.update',
    'provider_contracts.activate',
    'provider_contracts.pricing.view',
    'provider_contracts.pricing.manage'
  )
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- Grant limited permissions to INSURANCE_COMPANY role
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r, permissions p
WHERE r.name = 'INSURANCE_COMPANY' 
  AND p.name IN (
    'provider_contracts.view',
    'provider_contracts.create',
    'provider_contracts.update',
    'provider_contracts.activate',
    'provider_contracts.pricing.view',
    'provider_contracts.pricing.manage'
  )
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- Grant view-only permissions to REVIEWER role
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r, permissions p
WHERE r.name = 'REVIEWER' 
  AND p.name IN (
    'provider_contracts.view',
    'provider_contracts.pricing.view'
  )
ON CONFLICT DO NOTHING;
