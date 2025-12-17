-- ==============================
-- MEDICAL CATEGORIES MODULE
-- Database Migration Script
-- Date: 2025-11-23
-- ==============================

-- Create medical_categories table
CREATE TABLE IF NOT EXISTS medical_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name_ar VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    INDEX idx_name_en (name_en),
    INDEX idx_name_ar (name_ar)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add category_id foreign key to medical_services table
ALTER TABLE medical_services 
ADD COLUMN IF NOT EXISTS category_id BIGINT,
ADD CONSTRAINT fk_medical_service_category 
    FOREIGN KEY (category_id) 
    REFERENCES medical_categories(id) 
    ON DELETE RESTRICT;

-- Create index on category_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_medical_services_category_id 
ON medical_services(category_id);

-- ==============================
-- SEED DATA - Common Medical Categories
-- ==============================

INSERT INTO medical_categories (code, name_ar, name_en, description) VALUES
('LAB', 'التحاليل المخبرية', 'Laboratory Tests', 'Blood tests, urinalysis, cultures, and other diagnostic laboratory tests'),
('RAD', 'الأشعة', 'Radiology', 'X-rays, CT scans, MRI, ultrasound, and other imaging services'),
('DENT', 'طب الأسنان', 'Dental', 'Dental procedures, cleaning, fillings, extractions, and orthodontics'),
('SURG', 'الجراحة', 'Surgery', 'Surgical procedures including minor and major operations'),
('EMER', 'الطوارئ', 'Emergency', 'Emergency room services and urgent care'),
('OP', 'العيادات الخارجية', 'Outpatient', 'Outpatient consultations and follow-up visits'),
('IP', 'التنويم', 'Inpatient', 'Hospital admission and inpatient care'),
('CONS', 'الاستشارات', 'Consultation', 'Doctor consultations and specialist reviews'),
('PATH', 'علم الأمراض', 'Pathology', 'Tissue analysis, biopsies, and pathology services'),
('PROC', 'الإجراءات الطبية', 'Medical Procedures', 'Medical procedures and interventions'),
('PHARM', 'الصيدلة', 'Pharmacy', 'Medications and pharmaceutical services'),
('PHYS', 'العلاج الطبيعي', 'Physiotherapy', 'Physical therapy and rehabilitation')
ON DUPLICATE KEY UPDATE 
    name_ar = VALUES(name_ar),
    name_en = VALUES(name_en),
    description = VALUES(description);

-- ==============================
-- DATA MIGRATION (Optional)
-- Migrate existing medical_services.category string values to new category_id references
-- ==============================

-- Map "تحليل" or containing "lab" to LAB category
UPDATE medical_services ms
LEFT JOIN medical_categories mc ON mc.code = 'LAB'
SET ms.category_id = mc.id
WHERE ms.category_id IS NULL 
AND (LOWER(ms.category) LIKE '%تحليل%' 
     OR LOWER(ms.category) LIKE '%lab%'
     OR LOWER(ms.category) LIKE '%test%');

-- Map "أشعة" or containing "rad" to RAD category
UPDATE medical_services ms
LEFT JOIN medical_categories mc ON mc.code = 'RAD'
SET ms.category_id = mc.id
WHERE ms.category_id IS NULL 
AND (LOWER(ms.category) LIKE '%أشعة%' 
     OR LOWER(ms.category) LIKE '%rad%'
     OR LOWER(ms.category) LIKE '%x-ray%'
     OR LOWER(ms.category) LIKE '%ct%'
     OR LOWER(ms.category) LIKE '%mri%');

-- Map "أسنان" or containing "dent" to DENT category
UPDATE medical_services ms
LEFT JOIN medical_categories mc ON mc.code = 'DENT'
SET ms.category_id = mc.id
WHERE ms.category_id IS NULL 
AND (LOWER(ms.category) LIKE '%أسنان%' 
     OR LOWER(ms.category) LIKE '%dent%'
     OR LOWER(ms.category) LIKE '%tooth%');

-- Map "جراحة" or containing "surg" to SURG category
UPDATE medical_services ms
LEFT JOIN medical_categories mc ON mc.code = 'SURG'
SET ms.category_id = mc.id
WHERE ms.category_id IS NULL 
AND (LOWER(ms.category) LIKE '%جراحة%' 
     OR LOWER(ms.category) LIKE '%surg%'
     OR LOWER(ms.category) LIKE '%operation%');

-- Map "طوارئ" or containing "emer" to EMER category
UPDATE medical_services ms
LEFT JOIN medical_categories mc ON mc.code = 'EMER'
SET ms.category_id = mc.id
WHERE ms.category_id IS NULL 
AND (LOWER(ms.category) LIKE '%طوارئ%' 
     OR LOWER(ms.category) LIKE '%emer%'
     OR LOWER(ms.category) LIKE '%urgent%');

-- Map remaining services to OP (Outpatient) as default
UPDATE medical_services ms
LEFT JOIN medical_categories mc ON mc.code = 'OP'
SET ms.category_id = mc.id
WHERE ms.category_id IS NULL;

-- ==============================
-- VERIFICATION QUERIES
-- ==============================

-- Count categories
SELECT COUNT(*) AS total_categories FROM medical_categories;

-- Count services by category
SELECT 
    mc.name_en AS category_name,
    COUNT(ms.id) AS service_count
FROM medical_categories mc
LEFT JOIN medical_services ms ON ms.category_id = mc.id
GROUP BY mc.id, mc.name_en
ORDER BY service_count DESC;

-- Find services without category
SELECT COUNT(*) AS uncategorized_count
FROM medical_services
WHERE category_id IS NULL;

-- ==============================
-- ROLLBACK SCRIPT (if needed)
-- ==============================

-- To rollback this migration, run:
/*
ALTER TABLE medical_services DROP FOREIGN KEY fk_medical_service_category;
ALTER TABLE medical_services DROP COLUMN category_id;
DROP TABLE medical_categories;
*/
