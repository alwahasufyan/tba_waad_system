-- ============================================================================
-- V001: Create organizations table (canonical entity for all company types)
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    code VARCHAR(100) UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('TPA', 'EMPLOYER', 'INSURANCE', 'REVIEWER')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_active ON organizations(active);
CREATE INDEX idx_organizations_code ON organizations(code);
CREATE INDEX idx_organizations_type_active ON organizations(type, active);

COMMENT ON TABLE organizations IS 'Unified organization entity for TPA, employers, insurance companies, and reviewers';
COMMENT ON COLUMN organizations.type IS 'Organization type: TPA, EMPLOYER, INSURANCE, REVIEWER';
