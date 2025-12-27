-- Migration V16: Provider Network Module
-- Creates unified providers and provider_contracts tables

-- Table 1: providers
CREATE TABLE IF NOT EXISTS providers (
    id BIGSERIAL PRIMARY KEY,
    name_arabic VARCHAR(200) NOT NULL,
    name_english VARCHAR(200) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    tax_number VARCHAR(50),
    city VARCHAR(100),
    address VARCHAR(500),
    phone VARCHAR(50),
    email VARCHAR(100),
    provider_type VARCHAR(20) NOT NULL CHECK (provider_type IN ('HOSPITAL', 'CLINIC', 'LAB', 'PHARMACY', 'RADIOLOGY')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    contract_start_date DATE,
    contract_end_date DATE,
    default_discount_rate DECIMAL(5,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Table 2: provider_contracts
CREATE TABLE IF NOT EXISTS provider_contracts (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT NOT NULL,
    contract_number VARCHAR(100) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
    discount_rate DECIMAL(5,2),
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_contract_provider FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE RESTRICT
);

-- Indexes for providers table
CREATE INDEX IF NOT EXISTS idx_providers_name_arabic ON providers(name_arabic);
CREATE INDEX IF NOT EXISTS idx_providers_name_english ON providers(name_english);
CREATE INDEX IF NOT EXISTS idx_providers_license_number ON providers(license_number);
CREATE INDEX IF NOT EXISTS idx_providers_city ON providers(city);
CREATE INDEX IF NOT EXISTS idx_providers_provider_type ON providers(provider_type);
CREATE INDEX IF NOT EXISTS idx_providers_active ON providers(active);
CREATE INDEX IF NOT EXISTS idx_providers_created_at ON providers(created_at);

-- Indexes for provider_contracts table
CREATE INDEX IF NOT EXISTS idx_contracts_provider_id ON provider_contracts(provider_id);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_number ON provider_contracts(contract_number);
CREATE INDEX IF NOT EXISTS idx_contracts_active ON provider_contracts(active);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON provider_contracts(created_at);
CREATE INDEX IF NOT EXISTS idx_contracts_start_date ON provider_contracts(start_date);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON provider_contracts(end_date);

-- Trigger for providers updated_at
CREATE OR REPLACE FUNCTION update_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_providers_updated_at ON providers;
CREATE TRIGGER trigger_update_providers_updated_at
BEFORE UPDATE ON providers
FOR EACH ROW
EXECUTE FUNCTION update_providers_updated_at();

-- Trigger for provider_contracts updated_at
CREATE OR REPLACE FUNCTION update_provider_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_provider_contracts_updated_at ON provider_contracts;
CREATE TRIGGER trigger_update_provider_contracts_updated_at
BEFORE UPDATE ON provider_contracts
FOR EACH ROW
EXECUTE FUNCTION update_provider_contracts_updated_at();

-- Column comments for providers
COMMENT ON COLUMN providers.id IS 'Primary key';
COMMENT ON COLUMN providers.name_arabic IS 'Provider name in Arabic';
COMMENT ON COLUMN providers.name_english IS 'Provider name in English';
COMMENT ON COLUMN providers.license_number IS 'Unique license number';
COMMENT ON COLUMN providers.tax_number IS 'Tax registration number';
COMMENT ON COLUMN providers.city IS 'City location';
COMMENT ON COLUMN providers.address IS 'Full address';
COMMENT ON COLUMN providers.phone IS 'Contact phone';
COMMENT ON COLUMN providers.email IS 'Contact email';
COMMENT ON COLUMN providers.provider_type IS 'Type: HOSPITAL, CLINIC, LAB, PHARMACY, RADIOLOGY';
COMMENT ON COLUMN providers.active IS 'Soft delete flag';
COMMENT ON COLUMN providers.contract_start_date IS 'Contract start date';
COMMENT ON COLUMN providers.contract_end_date IS 'Contract end date';
COMMENT ON COLUMN providers.default_discount_rate IS 'Default discount percentage';
COMMENT ON COLUMN providers.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN providers.updated_at IS 'Last update timestamp';

-- Column comments for provider_contracts
COMMENT ON COLUMN provider_contracts.id IS 'Primary key';
COMMENT ON COLUMN provider_contracts.provider_id IS 'Foreign key to providers';
COMMENT ON COLUMN provider_contracts.contract_number IS 'Unique contract number';
COMMENT ON COLUMN provider_contracts.start_date IS 'Contract start date';
COMMENT ON COLUMN provider_contracts.end_date IS 'Contract end date';
COMMENT ON COLUMN provider_contracts.auto_renew IS 'Auto renewal flag';
COMMENT ON COLUMN provider_contracts.discount_rate IS 'Contract discount percentage';
COMMENT ON COLUMN provider_contracts.notes IS 'Additional notes';
COMMENT ON COLUMN provider_contracts.active IS 'Soft delete flag';
COMMENT ON COLUMN provider_contracts.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN provider_contracts.updated_at IS 'Last update timestamp';
