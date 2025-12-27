-- V22__seed_benefit_policies.sql
-- Seed sample benefit policies for development/testing
-- This migration inserts demo data into the benefit_policies table

-- First, ensure we have an employer organization to reference
-- Check for existing organization or insert a demo one
INSERT INTO organizations (id, name, type, active, created_at, updated_at)
SELECT 1000, 'شركة الوحدة للتأمين (Demo Employer)', 'EMPLOYER', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE id = 1000);

-- Insert sample benefit policies
INSERT INTO benefit_policies (
    name, 
    policy_code, 
    description, 
    employer_org_id, 
    start_date, 
    end_date, 
    annual_limit, 
    default_coverage_percent, 
    per_member_limit, 
    per_family_limit, 
    status, 
    covered_members_count, 
    notes,
    active,
    created_at, 
    updated_at
) VALUES 
-- Policy 1: Active Gold Plan
(
    'خطة التأمين الذهبية 2025',
    'BP-2025-GOLD-001',
    'خطة تأمين صحي شاملة للموظفين وعائلاتهم تغطي جميع الخدمات الطبية الأساسية والمتقدمة',
    1000,
    '2025-01-01',
    '2025-12-31',
    500000.00,
    80,
    50000.00,
    150000.00,
    'ACTIVE',
    125,
    'الخطة الرئيسية للعام 2025 - تمت الموافقة عليها من مجلس الإدارة',
    true,
    NOW(),
    NOW()
),
-- Policy 2: Active Silver Plan
(
    'خطة التأمين الفضية 2025',
    'BP-2025-SILVER-001',
    'خطة تأمين صحي متوسطة للموظفين تغطي الخدمات الطبية الأساسية',
    1000,
    '2025-01-01',
    '2025-12-31',
    250000.00,
    70,
    25000.00,
    75000.00,
    'DRAFT',
    0,
    'خطة قيد التحضير للموظفين الجدد',
    true,
    NOW(),
    NOW()
),
-- Policy 3: Expired 2024 Plan
(
    'خطة التأمين الشاملة 2024',
    'BP-2024-COMP-001',
    'خطة تأمين صحي شاملة للعام 2024 - منتهية',
    1000,
    '2024-01-01',
    '2024-12-31',
    400000.00,
    75,
    40000.00,
    120000.00,
    'EXPIRED',
    118,
    'خطة العام السابق - تم تجديدها بالخطة الذهبية 2025',
    true,
    NOW(),
    NOW()
),
-- Policy 4: Suspended Plan
(
    'خطة التأمين التكميلية',
    'BP-2025-SUP-001',
    'خطة تأمين تكميلية للمنافع الإضافية',
    1000,
    '2025-06-01',
    '2025-12-31',
    100000.00,
    60,
    10000.00,
    30000.00,
    'SUSPENDED',
    45,
    'معلقة مؤقتاً بسبب مراجعة الميزانية',
    true,
    NOW(),
    NOW()
),
-- Policy 5: Cancelled Plan
(
    'خطة التأمين التجريبية',
    'BP-2025-TRIAL-001',
    'خطة تجريبية ملغاة',
    1000,
    '2025-03-01',
    '2025-06-30',
    50000.00,
    50,
    5000.00,
    15000.00,
    'CANCELLED',
    0,
    'تم إلغاؤها لعدم الحاجة إليها',
    true,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Add a second employer for variety
INSERT INTO organizations (id, name, type, active, created_at, updated_at)
SELECT 1001, 'مجموعة النجاح للصناعات (Demo Employer 2)', 'EMPLOYER', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE id = 1001);

-- Add policies for second employer
INSERT INTO benefit_policies (
    name, 
    policy_code, 
    description, 
    employer_org_id, 
    start_date, 
    end_date, 
    annual_limit, 
    default_coverage_percent, 
    per_member_limit, 
    per_family_limit, 
    status, 
    covered_members_count, 
    notes,
    active,
    created_at, 
    updated_at
) VALUES 
(
    'خطة رعاية الموظفين',
    'BP-2025-EMP-002',
    'خطة رعاية صحية أساسية للموظفين',
    1001,
    '2025-01-01',
    '2025-12-31',
    300000.00,
    75,
    30000.00,
    90000.00,
    'ACTIVE',
    89,
    'الخطة الرئيسية لمجموعة النجاح',
    true,
    NOW(),
    NOW()
),
(
    'خطة المديرين التنفيذيين',
    'BP-2025-EXEC-002',
    'خطة تأمين متميزة للمديرين التنفيذيين',
    1001,
    '2025-01-01',
    '2025-12-31',
    1000000.00,
    90,
    100000.00,
    300000.00,
    'ACTIVE',
    12,
    'خطة VIP للإدارة العليا',
    true,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Benefit policies seed data inserted successfully';
END $$;
