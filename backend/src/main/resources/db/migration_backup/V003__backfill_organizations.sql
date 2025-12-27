-- ============================================================================
-- V003: Backfill organizations table from legacy tables
-- ============================================================================

-- Step 1: Migrate employers to organizations
INSERT INTO organizations (name, name_en, code, type, active, created_at, updated_at)
SELECT 
    name_ar as name,
    name_en,
    code,
    'EMPLOYER' as type,
    COALESCE(active, true) as active,
    COALESCE(created_at, CURRENT_TIMESTAMP) as created_at,
    COALESCE(updated_at, CURRENT_TIMESTAMP) as updated_at
FROM employers
WHERE NOT EXISTS (
    SELECT 1 FROM organizations o 
    WHERE o.code = employers.code AND o.type = 'EMPLOYER'
)
ON CONFLICT (code) DO NOTHING;

-- Step 2: Migrate insurance companies to organizations
INSERT INTO organizations (name, name_en, code, type, active, created_at, updated_at)
SELECT 
    name as name,
    name as name_en, -- insurance_companies table doesn't have name_en, use name
    COALESCE(code, 'INS-' || id::TEXT) as code, -- generate code if missing
    'INSURANCE' as type,
    COALESCE(active, true) as active,
    COALESCE(created_at, CURRENT_TIMESTAMP) as created_at,
    COALESCE(updated_at, CURRENT_TIMESTAMP) as updated_at
FROM insurance_companies
WHERE NOT EXISTS (
    SELECT 1 FROM organizations o 
    WHERE (o.code = COALESCE(insurance_companies.code, 'INS-' || insurance_companies.id::TEXT))
    AND o.type = 'INSURANCE'
)
ON CONFLICT (code) DO NOTHING;

-- Step 3: Migrate reviewer companies to organizations (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviewer_companies') THEN
        INSERT INTO organizations (name, name_en, code, type, active, created_at, updated_at)
        SELECT 
            name as name,
            name as name_en, -- reviewer_companies lacks name_en
            COALESCE(code, 'REV-' || id::TEXT) as code,
            'REVIEWER' as type,
            COALESCE(active, true) as active,
            COALESCE(created_at, CURRENT_TIMESTAMP) as created_at,
            COALESCE(updated_at, CURRENT_TIMESTAMP) as updated_at
        FROM reviewer_companies
        WHERE NOT EXISTS (
            SELECT 1 FROM organizations o 
            WHERE (o.code = COALESCE(reviewer_companies.code, 'REV-' || reviewer_companies.id::TEXT))
            AND o.type = 'REVIEWER'
        )
        ON CONFLICT (code) DO NOTHING;
    END IF;
END $$;

-- Step 4: Migrate companies table to TPA (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
        INSERT INTO organizations (name, name_en, code, type, active, created_at, updated_at)
        SELECT 
            name as name,
            name_en,
            COALESCE(code, 'TPA-' || id::TEXT) as code,
            'TPA' as type,
            COALESCE(active, true) as active,
            COALESCE(created_at, CURRENT_TIMESTAMP) as created_at,
            COALESCE(updated_at, CURRENT_TIMESTAMP) as updated_at
        FROM companies
        WHERE NOT EXISTS (
            SELECT 1 FROM organizations o 
            WHERE (o.code = COALESCE(companies.code, 'TPA-' || companies.id::TEXT))
            AND o.type = 'TPA'
        )
        ON CONFLICT (code) DO NOTHING;
    END IF;
END $$;

-- Step 5: Ensure required organizations exist (seed data)
-- TPA: Waad Medical Expenses Management
INSERT INTO organizations (name, name_en, code, type, active)
VALUES ('وعد لإدارة النفقات الطبية', 'Waad Medical Expenses Management', 'TPA-WAAD', 'TPA', true)
ON CONFLICT (code) DO NOTHING;

-- EMPLOYER: Bank
INSERT INTO organizations (name, name_en, code, type, active)
VALUES ('المصرف', 'The Bank', 'EMP-BANK', 'EMPLOYER', true)
ON CONFLICT (code) DO NOTHING;

-- EMPLOYER: Customs Authority
INSERT INTO organizations (name, name_en, code, type, active)
VALUES ('مصلحة الجمارك', 'Customs Authority', 'EMP-CUSTOMS', 'EMPLOYER', true)
ON CONFLICT (code) DO NOTHING;

-- EMPLOYER: Juliana Area
INSERT INTO organizations (name, name_en, code, type, active)
VALUES ('منطقة جليانة', 'Juliana Area', 'EMP-JULIANA', 'EMPLOYER', true)
ON CONFLICT (code) DO NOTHING;

-- EMPLOYER: Libyan Cement Company
INSERT INTO organizations (name, name_en, code, type, active)
VALUES ('الشركة الليبية للأسمنت', 'Libyan Cement Company', 'EMP-CEMENT', 'EMPLOYER', true)
ON CONFLICT (code) DO NOTHING;

-- EMPLOYER + INSURANCE: Al-Wahah Insurance (dual role)
INSERT INTO organizations (name, name_en, code, type, active)
VALUES ('الواحة للتأمين', 'Al-Wahah Insurance', 'EMP-WAHAH', 'EMPLOYER', true)
ON CONFLICT (code) DO NOTHING;

-- INSURANCE: Al-Wahah Insurance
INSERT INTO organizations (name, name_en, code, type, active)
VALUES ('الواحة للتأمين', 'Al-Wahah Insurance', 'INS-WAHAH', 'INSURANCE', true)
ON CONFLICT (code) DO NOTHING;
