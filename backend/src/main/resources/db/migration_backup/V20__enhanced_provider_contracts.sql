-- Migration V20: Enhanced Provider Contracts Module
-- Enhances provider_contracts with status, pricing model, and adds pricing items table
-- Last Updated: 2024-12-24

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1: Add new columns to existing provider_contracts table
-- ═══════════════════════════════════════════════════════════════════════════

-- Add contract_code column (unique business code)
ALTER TABLE provider_contracts ADD COLUMN IF NOT EXISTS contract_code VARCHAR(50);

-- Add status enum column
ALTER TABLE provider_contracts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'DRAFT';

-- Add pricing_model enum column
ALTER TABLE provider_contracts ADD COLUMN IF NOT EXISTS pricing_model VARCHAR(20) DEFAULT 'DISCOUNT';

-- Add discount_percent column (more descriptive name)
ALTER TABLE provider_contracts ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5,2) DEFAULT 0;

-- Add total_value column
ALTER TABLE provider_contracts ADD COLUMN IF NOT EXISTS total_value DECIMAL(15,2);

-- Add currency column
ALTER TABLE provider_contracts ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'LYD';

-- Add payment_terms column
ALTER TABLE provider_contracts ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100);

-- Add signed_date column
ALTER TABLE provider_contracts ADD COLUMN IF NOT EXISTS signed_date DATE;

-- Add contact person fields
ALTER TABLE provider_contracts ADD COLUMN IF NOT EXISTS contact_person VARCHAR(100);
ALTER TABLE provider_contracts ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
ALTER TABLE provider_contracts ADD COLUMN IF NOT EXISTS contact_email VARCHAR(100);

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2: Add constraints to status and pricing_model
-- ═══════════════════════════════════════════════════════════════════════════

-- Add check constraint for status
ALTER TABLE provider_contracts DROP CONSTRAINT IF EXISTS chk_contract_status;
ALTER TABLE provider_contracts ADD CONSTRAINT chk_contract_status 
    CHECK (status IN ('DRAFT', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'TERMINATED'));

-- Add check constraint for pricing_model
ALTER TABLE provider_contracts DROP CONSTRAINT IF EXISTS chk_pricing_model;
ALTER TABLE provider_contracts ADD CONSTRAINT chk_pricing_model 
    CHECK (pricing_model IN ('FIXED', 'DISCOUNT', 'TIERED', 'NEGOTIATED'));

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3: Generate contract_code for existing records
-- ═══════════════════════════════════════════════════════════════════════════

-- Update existing records that have null contract_code
UPDATE provider_contracts 
SET contract_code = 'CON-' || EXTRACT(YEAR FROM created_at)::TEXT || '-' || LPAD(id::TEXT, 4, '0')
WHERE contract_code IS NULL;

-- Now make contract_code NOT NULL and UNIQUE
ALTER TABLE provider_contracts ALTER COLUMN contract_code SET NOT NULL;

-- Add unique constraint on contract_code
ALTER TABLE provider_contracts DROP CONSTRAINT IF EXISTS uk_contract_code;
ALTER TABLE provider_contracts ADD CONSTRAINT uk_contract_code UNIQUE (contract_code);

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 4: Create provider_contract_pricing_items table
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS provider_contract_pricing_items (
    id BIGSERIAL PRIMARY KEY,
    
    -- Contract reference
    contract_id BIGINT NOT NULL,
    
    -- Service reference (links to medical_services)
    medical_service_id BIGINT NOT NULL,
    
    -- Category reference (optional, links to medical_categories)
    medical_category_id BIGINT,
    
    -- Pricing fields
    base_price DECIMAL(15,2) NOT NULL,
    contract_price DECIMAL(15,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    
    -- Unit of service
    unit VARCHAR(50) NOT NULL DEFAULT 'service',
    
    -- Currency
    currency VARCHAR(3) NOT NULL DEFAULT 'LYD',
    
    -- Effective dates for this pricing item
    effective_from DATE,
    effective_to DATE,
    
    -- Notes
    notes TEXT,
    
    -- Soft delete flag
    active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Audit columns
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    
    -- Foreign keys
    CONSTRAINT fk_pricing_contract FOREIGN KEY (contract_id) 
        REFERENCES provider_contracts(id) ON DELETE CASCADE,
    CONSTRAINT fk_pricing_service FOREIGN KEY (medical_service_id) 
        REFERENCES medical_services(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pricing_category FOREIGN KEY (medical_category_id) 
        REFERENCES medical_categories(id) ON DELETE SET NULL,
    
    -- Prevent duplicate service pricing per contract
    CONSTRAINT uk_contract_service UNIQUE (contract_id, medical_service_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 5: Create indexes for provider_contract_pricing_items
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_pricing_contract_id ON provider_contract_pricing_items(contract_id);
CREATE INDEX IF NOT EXISTS idx_pricing_service_id ON provider_contract_pricing_items(medical_service_id);
CREATE INDEX IF NOT EXISTS idx_pricing_category_id ON provider_contract_pricing_items(medical_category_id);
CREATE INDEX IF NOT EXISTS idx_pricing_active ON provider_contract_pricing_items(active);
CREATE INDEX IF NOT EXISTS idx_pricing_effective_dates ON provider_contract_pricing_items(effective_from, effective_to);

-- Additional indexes on provider_contracts for new columns
CREATE INDEX IF NOT EXISTS idx_contracts_status ON provider_contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_code ON provider_contracts(contract_code);
CREATE INDEX IF NOT EXISTS idx_contracts_pricing_model ON provider_contracts(pricing_model);

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 6: Create trigger for pricing_items updated_at
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_pricing_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pricing_items_updated_at ON provider_contract_pricing_items;
CREATE TRIGGER trigger_update_pricing_items_updated_at
BEFORE UPDATE ON provider_contract_pricing_items
FOR EACH ROW
EXECUTE FUNCTION update_pricing_items_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 7: Column comments
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE provider_contract_pricing_items IS 'Stores per-service pricing for each provider contract';

COMMENT ON COLUMN provider_contract_pricing_items.id IS 'Primary key';
COMMENT ON COLUMN provider_contract_pricing_items.contract_id IS 'Foreign key to provider_contracts';
COMMENT ON COLUMN provider_contract_pricing_items.medical_service_id IS 'Foreign key to medical_services';
COMMENT ON COLUMN provider_contract_pricing_items.medical_category_id IS 'Optional foreign key to medical_categories';
COMMENT ON COLUMN provider_contract_pricing_items.base_price IS 'Standard/list price for the service';
COMMENT ON COLUMN provider_contract_pricing_items.contract_price IS 'Negotiated contract price';
COMMENT ON COLUMN provider_contract_pricing_items.discount_percent IS 'Calculated discount percentage';
COMMENT ON COLUMN provider_contract_pricing_items.unit IS 'Unit of service (e.g., visit, test, night)';
COMMENT ON COLUMN provider_contract_pricing_items.currency IS 'Currency code (default LYD)';
COMMENT ON COLUMN provider_contract_pricing_items.effective_from IS 'Date this pricing becomes effective';
COMMENT ON COLUMN provider_contract_pricing_items.effective_to IS 'Date this pricing expires';
COMMENT ON COLUMN provider_contract_pricing_items.notes IS 'Additional notes about this pricing';
COMMENT ON COLUMN provider_contract_pricing_items.active IS 'Soft delete flag';

COMMENT ON COLUMN provider_contracts.contract_code IS 'Unique business code (e.g., CON-2024-001)';
COMMENT ON COLUMN provider_contracts.status IS 'Contract status: DRAFT, ACTIVE, SUSPENDED, EXPIRED, TERMINATED';
COMMENT ON COLUMN provider_contracts.pricing_model IS 'Pricing model: FIXED, DISCOUNT, TIERED, NEGOTIATED';
COMMENT ON COLUMN provider_contracts.discount_percent IS 'Default discount percentage for this contract';
COMMENT ON COLUMN provider_contracts.total_value IS 'Total estimated contract value';
COMMENT ON COLUMN provider_contracts.currency IS 'Currency code (default LYD)';
COMMENT ON COLUMN provider_contracts.payment_terms IS 'Payment terms (e.g., Net 30)';
COMMENT ON COLUMN provider_contracts.signed_date IS 'Date contract was signed';
COMMENT ON COLUMN provider_contracts.contact_person IS 'Provider contact person name';
COMMENT ON COLUMN provider_contracts.contact_phone IS 'Provider contact phone';
COMMENT ON COLUMN provider_contracts.contact_email IS 'Provider contact email';
