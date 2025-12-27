-- Migration V23: Seed Provider Contracts with Sample Data
-- Creates sample provider contracts for testing and development
-- Last Updated: 2024-12-24

-- ═══════════════════════════════════════════════════════════════════════════
-- NOTE: This migration inserts sample provider contracts data
-- Depends on: V20__enhanced_provider_contracts.sql, V16__provider_network.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- Check if we have any providers first
DO $$
DECLARE
    provider_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO provider_count FROM providers WHERE active = true;
    IF provider_count = 0 THEN
        RAISE NOTICE 'No providers found. Creating sample providers first...';
        
        -- Insert sample providers if none exist
        INSERT INTO providers (name_ar, name_en, type, city, address, phone, email, active, created_at, updated_at)
        VALUES 
            ('مستشفى السلام الطبي', 'Al Salam Medical Hospital', 'HOSPITAL', 'طرابلس', 'شارع الجمهورية، طرابلس', '+218-21-555-0101', 'info@alsalam-hospital.ly', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('مركز النور الطبي', 'Al Nour Medical Center', 'CLINIC', 'طرابلس', 'شارع عمر المختار، طرابلس', '+218-21-555-0102', 'info@alnour-clinic.ly', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('مختبرات الأمل للتحاليل', 'Al Amal Laboratories', 'LAB', 'بنغازي', 'شارع جمال عبد الناصر، بنغازي', '+218-61-555-0103', 'info@alamal-labs.ly', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('مركز الشفاء للأسنان', 'Al Shefa Dental Center', 'DENTAL', 'مصراتة', 'شارع الوحدة، مصراتة', '+218-51-555-0104', 'info@alshefa-dental.ly', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('صيدليات الحياة', 'Al Hayat Pharmacies', 'PHARMACY', 'طرابلس', 'شارع النصر، طرابلس', '+218-21-555-0105', 'info@alhayat-pharmacy.ly', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1: Insert Provider Contracts
-- ═══════════════════════════════════════════════════════════════════════════

-- Insert sample contracts (only if they don't exist)
INSERT INTO provider_contracts (
    contract_code, 
    provider_id, 
    start_date, 
    end_date, 
    status, 
    pricing_model, 
    discount_percent, 
    total_value,
    currency,
    payment_terms,
    contact_person,
    contact_phone,
    contact_email,
    notes, 
    active, 
    created_at, 
    updated_at
)
SELECT * FROM (VALUES
    (
        'CON-2024-001',
        (SELECT id FROM providers WHERE name_en = 'Al Salam Medical Hospital' LIMIT 1),
        '2024-01-01'::DATE,
        '2024-12-31'::DATE,
        'ACTIVE',
        'DISCOUNT',
        15.00,
        500000.00,
        'LYD',
        'Net 30',
        'محمد أحمد',
        '+218-21-555-0110',
        'm.ahmed@alsalam.ly',
        'عقد شامل للخدمات الطبية والجراحية. يشمل العمليات الجراحية والإقامة والعيادات الخارجية.',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'CON-2024-002',
        (SELECT id FROM providers WHERE name_en = 'Al Nour Medical Center' LIMIT 1),
        '2024-03-01'::DATE,
        '2025-02-28'::DATE,
        'ACTIVE',
        'FIXED',
        10.00,
        150000.00,
        'LYD',
        'Net 45',
        'فاطمة علي',
        '+218-21-555-0120',
        'f.ali@alnour.ly',
        'عقد العيادات الخارجية والاستشارات الطبية المتخصصة.',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'CON-2024-003',
        (SELECT id FROM providers WHERE name_en = 'Al Amal Laboratories' LIMIT 1),
        '2024-02-15'::DATE,
        '2025-02-14'::DATE,
        'ACTIVE',
        'TIERED',
        20.00,
        200000.00,
        'LYD',
        'Net 30',
        'خالد محمود',
        '+218-61-555-0130',
        'k.mahmoud@alamal.ly',
        'عقد التحاليل المخبرية والأشعة. خصومات متدرجة حسب حجم الفحوصات.',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'CON-2024-004',
        (SELECT id FROM providers WHERE name_en = 'Al Shefa Dental Center' LIMIT 1),
        '2024-06-01'::DATE,
        '2025-05-31'::DATE,
        'DRAFT',
        'NEGOTIATED',
        12.50,
        75000.00,
        'LYD',
        'Net 60',
        'سارة حسن',
        '+218-51-555-0140',
        's.hassan@alshefa.ly',
        'مسودة عقد خدمات الأسنان - قيد المراجعة.',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'CON-2024-005',
        (SELECT id FROM providers WHERE name_en = 'Al Hayat Pharmacies' LIMIT 1),
        '2024-04-01'::DATE,
        '2025-03-31'::DATE,
        'ACTIVE',
        'DISCOUNT',
        8.00,
        300000.00,
        'LYD',
        'Net 15',
        'عمر يوسف',
        '+218-21-555-0150',
        'o.youssef@alhayat.ly',
        'عقد الصرف الدوائي وتوفير الأدوية.',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'CON-2023-001',
        (SELECT id FROM providers WHERE name_en = 'Al Salam Medical Hospital' LIMIT 1),
        '2023-01-01'::DATE,
        '2023-12-31'::DATE,
        'EXPIRED',
        'DISCOUNT',
        12.00,
        450000.00,
        'LYD',
        'Net 30',
        'محمد أحمد',
        '+218-21-555-0110',
        'm.ahmed@alsalam.ly',
        'عقد العام السابق - منتهي.',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'CON-2024-006',
        (SELECT id FROM providers WHERE name_en = 'Al Nour Medical Center' LIMIT 1),
        '2024-01-01'::DATE,
        '2024-06-30'::DATE,
        'SUSPENDED',
        'FIXED',
        5.00,
        50000.00,
        'LYD',
        'Net 30',
        'أحمد كريم',
        '+218-21-555-0125',
        'a.karim@alnour.ly',
        'عقد موقوف بسبب مراجعة الأسعار.',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
) AS t(contract_code, provider_id, start_date, end_date, status, pricing_model, discount_percent, total_value, currency, payment_terms, contact_person, contact_phone, contact_email, notes, active, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM provider_contracts WHERE contract_code = t.contract_code);

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2: Insert Pricing Items for Active Contracts
-- ═══════════════════════════════════════════════════════════════════════════

-- First, ensure we have some medical services to reference
DO $$
DECLARE
    service_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO service_count FROM medical_services WHERE active = true;
    IF service_count = 0 THEN
        RAISE NOTICE 'No medical services found. Skipping pricing items insertion.';
    ELSE
        RAISE NOTICE 'Found % medical services. Will create pricing items.', service_count;
    END IF;
END $$;

-- Insert pricing items for contract CON-2024-001 (Al Salam Hospital)
INSERT INTO provider_contract_pricing_items (
    contract_id,
    medical_service_id,
    medical_category_id,
    base_price,
    contract_price,
    discount_percent,
    unit,
    currency,
    effective_from,
    effective_to,
    notes,
    active,
    created_at,
    updated_at
)
SELECT 
    c.id,
    ms.id,
    ms.category_id,
    CASE 
        WHEN ms.code LIKE 'CONS%' THEN 50.00
        WHEN ms.code LIKE 'LAB%' THEN 25.00
        WHEN ms.code LIKE 'RAD%' THEN 150.00
        WHEN ms.code LIKE 'SURG%' THEN 500.00
        ELSE 75.00
    END as base_price,
    CASE 
        WHEN ms.code LIKE 'CONS%' THEN 42.50
        WHEN ms.code LIKE 'LAB%' THEN 20.00
        WHEN ms.code LIKE 'RAD%' THEN 127.50
        WHEN ms.code LIKE 'SURG%' THEN 425.00
        ELSE 63.75
    END as contract_price,
    15.00,
    'service',
    'LYD',
    c.start_date,
    c.end_date,
    'Auto-generated pricing item',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM provider_contracts c
CROSS JOIN medical_services ms
WHERE c.contract_code = 'CON-2024-001'
  AND ms.active = true
  AND NOT EXISTS (
      SELECT 1 FROM provider_contract_pricing_items pi 
      WHERE pi.contract_id = c.id AND pi.medical_service_id = ms.id
  )
LIMIT 20;

-- Insert pricing items for contract CON-2024-003 (Al Amal Labs)
INSERT INTO provider_contract_pricing_items (
    contract_id,
    medical_service_id,
    medical_category_id,
    base_price,
    contract_price,
    discount_percent,
    unit,
    currency,
    effective_from,
    effective_to,
    notes,
    active,
    created_at,
    updated_at
)
SELECT 
    c.id,
    ms.id,
    ms.category_id,
    CASE 
        WHEN ms.code LIKE 'LAB%' THEN 30.00
        WHEN ms.code LIKE 'RAD%' THEN 200.00
        ELSE 50.00
    END as base_price,
    CASE 
        WHEN ms.code LIKE 'LAB%' THEN 24.00
        WHEN ms.code LIKE 'RAD%' THEN 160.00
        ELSE 40.00
    END as contract_price,
    20.00,
    'test',
    'LYD',
    c.start_date,
    c.end_date,
    'Lab services pricing',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM provider_contracts c
CROSS JOIN medical_services ms
WHERE c.contract_code = 'CON-2024-003'
  AND ms.active = true
  AND (ms.code LIKE 'LAB%' OR ms.code LIKE 'RAD%')
  AND NOT EXISTS (
      SELECT 1 FROM provider_contract_pricing_items pi 
      WHERE pi.contract_id = c.id AND pi.medical_service_id = ms.id
  )
LIMIT 15;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3: Summary
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
    contract_count INTEGER;
    pricing_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO contract_count FROM provider_contracts WHERE active = true;
    SELECT COUNT(*) INTO pricing_count FROM provider_contract_pricing_items WHERE active = true;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Provider Contracts Seed Complete';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Contracts: %', contract_count;
    RAISE NOTICE 'Total Pricing Items: %', pricing_count;
    RAISE NOTICE '========================================';
END $$;
