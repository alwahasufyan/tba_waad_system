-- V13__insurance_policies_and_benefit_packages.sql
-- Creates tables for insurance policy templates and their benefit packages

-- Insurance Policies Table
CREATE TABLE IF NOT EXISTS insurance_policies (
    id BIGSERIAL PRIMARY KEY,
    insurance_company_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_insurance_policy_company FOREIGN KEY (insurance_company_id) 
        REFERENCES insurance_companies(id) ON DELETE RESTRICT
);

-- Policy Benefit Packages Table
CREATE TABLE IF NOT EXISTS policy_benefit_packages (
    id BIGSERIAL PRIMARY KEY,
    insurance_policy_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    max_limit NUMERIC(15, 2),
    copay_percentage NUMERIC(5, 2),
    coverage_description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_benefit_package_policy FOREIGN KEY (insurance_policy_id) 
        REFERENCES insurance_policies(id) ON DELETE CASCADE
);

-- Indexes for Insurance Policies
CREATE INDEX IF NOT EXISTS idx_insurance_policies_company_id 
    ON insurance_policies(insurance_company_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_code 
    ON insurance_policies(code);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_active 
    ON insurance_policies(active);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_start_date 
    ON insurance_policies(start_date);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_name 
    ON insurance_policies(name);

-- Indexes for Policy Benefit Packages
CREATE INDEX IF NOT EXISTS idx_policy_benefit_packages_policy_id 
    ON policy_benefit_packages(insurance_policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_benefit_packages_code 
    ON policy_benefit_packages(code);
CREATE INDEX IF NOT EXISTS idx_policy_benefit_packages_active 
    ON policy_benefit_packages(active);

-- Trigger for updated_at on insurance_policies
CREATE OR REPLACE FUNCTION update_insurance_policies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_insurance_policies_updated_at ON insurance_policies;
CREATE TRIGGER trigger_update_insurance_policies_updated_at
    BEFORE UPDATE ON insurance_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_insurance_policies_updated_at();

-- Trigger for updated_at on policy_benefit_packages
CREATE OR REPLACE FUNCTION update_policy_benefit_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_policy_benefit_packages_updated_at ON policy_benefit_packages;
CREATE TRIGGER trigger_update_policy_benefit_packages_updated_at
    BEFORE UPDATE ON policy_benefit_packages
    FOR EACH ROW
    EXECUTE FUNCTION update_policy_benefit_packages_updated_at();

-- Comments for documentation
COMMENT ON TABLE insurance_policies IS 'Insurance policy templates provided by insurance companies';
COMMENT ON TABLE policy_benefit_packages IS 'Benefit packages associated with insurance policy templates';
COMMENT ON COLUMN insurance_policies.code IS 'Unique policy template code';
COMMENT ON COLUMN insurance_policies.start_date IS 'Policy template start date';
COMMENT ON COLUMN insurance_policies.end_date IS 'Policy template end date (optional)';
COMMENT ON COLUMN policy_benefit_packages.max_limit IS 'Maximum coverage limit';
COMMENT ON COLUMN policy_benefit_packages.copay_percentage IS 'Member copayment percentage';
