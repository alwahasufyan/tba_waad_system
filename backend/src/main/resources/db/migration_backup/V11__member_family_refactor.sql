-- ===================================
-- V11: Member & Family Member Refactor
-- Phase B5 - Member Module Modernization
-- ===================================

-- ========================================
-- 1. Ensure Required Columns Exist (ADD IF NOT EXISTS)
-- ========================================
-- Note: These columns should already exist from initial schema
-- Using ADD COLUMN IF NOT EXISTS for safety

ALTER TABLE members 
ADD COLUMN IF NOT EXISTS full_name_arabic VARCHAR(200),
ADD COLUMN IF NOT EXISTS full_name_english VARCHAR(200),
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS policy_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS benefit_package_id BIGINT,
ADD COLUMN IF NOT EXISTS employee_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS join_date DATE,
ADD COLUMN IF NOT EXISTS occupation VARCHAR(200),
ADD COLUMN IF NOT EXISTS card_status VARCHAR(50) DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS blocked_reason TEXT,
ADD COLUMN IF NOT EXISTS created_by VARCHAR(100),
ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100);

-- ================================================
-- 2. Set Default Values for Existing Records
-- ================================================

-- Set default card_status for records where it's NULL
UPDATE members 
SET card_status = CASE 
    WHEN active = true THEN 'ACTIVE'
    ELSE 'INACTIVE'
  END
WHERE card_status IS NULL;

-- ========================================
-- 3. Create `family_members` Table
-- ========================================

CREATE TABLE IF NOT EXISTS family_members (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    full_name_arabic VARCHAR(200),
    full_name_english VARCHAR(200) NOT NULL,
    civil_id VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(50) NOT NULL,
    card_number VARCHAR(100),
    phone VARCHAR(100),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_family_member_member FOREIGN KEY (member_id) 
        REFERENCES members(id) ON DELETE CASCADE,
    
    -- Unique Constraints
    CONSTRAINT uk_family_member_civil_id UNIQUE(civil_id)
);

-- ========================================
-- 4. Create Indexes for Performance
-- ========================================

-- Index on member_id for fast family lookup
CREATE INDEX IF NOT EXISTS idx_family_members_member_id 
ON family_members(member_id);

-- Index on civil_id for uniqueness check
CREATE INDEX IF NOT EXISTS idx_family_members_civil_id 
ON family_members(civil_id);

-- Index on relationship for filtering
CREATE INDEX IF NOT EXISTS idx_family_members_relationship 
ON family_members(relationship);

-- Index on active status
CREATE INDEX IF NOT EXISTS idx_family_members_active 
ON family_members(active) WHERE active = true;

-- Index on members.full_name_arabic for search
CREATE INDEX IF NOT EXISTS idx_members_full_name_arabic 
ON members(full_name_arabic);

-- Index on members.full_name_english for search
CREATE INDEX IF NOT EXISTS idx_members_full_name_english 
ON members(full_name_english);

-- Index on members.birth_date
CREATE INDEX IF NOT EXISTS idx_members_birth_date 
ON members(birth_date);

-- Index on members.card_status
CREATE INDEX IF NOT EXISTS idx_members_card_status 
ON members(card_status);

-- Composite index for employer + search
CREATE INDEX IF NOT EXISTS idx_members_employer_search 
ON members(employer_id, active) 
WHERE active = true;

-- ========================================
-- 5. Add Comments for Documentation
-- ========================================

COMMENT ON TABLE family_members IS 'Stores family member information (spouse, children, parents) for insurance members';
COMMENT ON COLUMN family_members.relationship IS 'Type of relationship: WIFE, HUSBAND, SON, DAUGHTER, FATHER, MOTHER';
COMMENT ON COLUMN family_members.status IS 'Status: ACTIVE, INACTIVE, DEPENDENT, EXCLUDED';
COMMENT ON COLUMN members.card_status IS 'Card status: ACTIVE, INACTIVE, BLOCKED, EXPIRED';
COMMENT ON COLUMN members.full_name_arabic IS 'Member full name in Arabic (already exists in Entity)';
COMMENT ON COLUMN members.full_name_english IS 'Member full name in English (already exists in Entity)';
COMMENT ON COLUMN members.birth_date IS 'Date of birth (already exists in Entity)';
COMMENT ON COLUMN members.join_date IS 'Date member joined employer (already exists in Entity)';

-- ========================================
-- 6. Migration Safety Check Trigger
-- ========================================

-- Create trigger to auto-update updated_at on family_members
CREATE OR REPLACE FUNCTION update_family_member_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_family_members_updated_at ON family_members;
CREATE TRIGGER trigger_family_members_updated_at
BEFORE UPDATE ON family_members
FOR EACH ROW
EXECUTE FUNCTION update_family_member_updated_at();

-- ========================================
-- 7. Optional: Migrate Dependents to Family Members
--    (Only if dependents table exists)
-- ========================================

-- Check if dependents table exists and migrate data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'dependents') THEN
        
        -- Migrate dependents to family_members
        INSERT INTO family_members (
            member_id, 
            relationship, 
            full_name_arabic,
            full_name_english, 
            civil_id, 
            birth_date, 
            gender, 
            card_number, 
            phone,
            status,
            active, 
            created_at, 
            updated_at
        )
        SELECT 
            d.member_id,
            d.relationship,
            d.full_name_arabic,
            COALESCE(d.full_name_english, d.name, 'Unknown'),
            COALESCE(d.civil_id, 'MIGRATED-' || d.id),
            COALESCE(d.date_of_birth, d.birth_date, '1990-01-01'::DATE),
            COALESCE(d.gender, 'MALE'),
            d.card_number,
            d.phone,
            CASE WHEN d.active THEN 'ACTIVE' ELSE 'INACTIVE' END,
            COALESCE(d.active, true),
            COALESCE(d.created_at, CURRENT_TIMESTAMP),
            COALESCE(d.updated_at, CURRENT_TIMESTAMP)
        FROM dependents d
        WHERE d.member_id IS NOT NULL
        ON CONFLICT (civil_id) DO NOTHING;
        
        RAISE NOTICE 'Migrated dependents to family_members';
    END IF;
END $$;

-- ========================================
-- 8. Validation Queries (for manual check)
-- ========================================

-- Check migration success:
-- SELECT COUNT(*) FROM family_members;
-- SELECT full_name_english, full_name_arabic, birth_date FROM members LIMIT 5;
-- SELECT relationship, COUNT(*) FROM family_members GROUP BY relationship;

-- End of V11 Migration
