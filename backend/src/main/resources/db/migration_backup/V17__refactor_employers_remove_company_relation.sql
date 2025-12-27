-- V17__refactor_employers_remove_company_relation.sql
-- Migration to refactor employers table: remove company relation and add nameAr/nameEn

-- Step 1: Add new columns
ALTER TABLE employers ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255);
ALTER TABLE employers ADD COLUMN IF NOT EXISTS name_en VARCHAR(255);

-- Step 2: Migrate data from old 'name' column to new columns (if data exists)
-- Assuming existing 'name' is Arabic, copy to nameAr
UPDATE employers SET name_ar = name WHERE name_ar IS NULL AND name IS NOT NULL;
UPDATE employers SET name_en = name WHERE name_en IS NULL AND name IS NOT NULL;

-- Step 3: Make new columns NOT NULL
ALTER TABLE employers ALTER COLUMN name_ar SET NOT NULL;
ALTER TABLE employers ALTER COLUMN name_en SET NOT NULL;

-- Step 4: Drop old columns that are no longer needed
ALTER TABLE employers DROP COLUMN IF EXISTS name;
ALTER TABLE employers DROP COLUMN IF EXISTS contact_name;
ALTER TABLE employers DROP COLUMN IF EXISTS contact_phone;
ALTER TABLE employers DROP COLUMN IF EXISTS contact_email;

-- Step 5: Drop foreign key constraint to company (if exists)
ALTER TABLE employers DROP CONSTRAINT IF EXISTS fk_employers_company;
ALTER TABLE employers DROP COLUMN IF EXISTS company_id;

-- Step 6: Create indexes for search performance
CREATE INDEX IF NOT EXISTS idx_employers_name_ar ON employers(name_ar);
CREATE INDEX IF NOT EXISTS idx_employers_name_en ON employers(name_en);
CREATE INDEX IF NOT EXISTS idx_employers_code ON employers(code);
CREATE INDEX IF NOT EXISTS idx_employers_active ON employers(active);
