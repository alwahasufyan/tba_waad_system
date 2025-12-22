-- ==============================
-- MEDICAL SERVICES - ADD TIMESTAMPS
-- Phase D2.1 Backend Alignment Fix
-- Date: 2025-12-22
-- ==============================

-- Add created_at and updated_at columns to medical_services table
-- These columns are required for sorting functionality in the frontend

-- Step 1: Add columns if they don't exist
ALTER TABLE medical_services 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE medical_services 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Step 2: Create index for efficient sorting by created_at
CREATE INDEX IF NOT EXISTS idx_medical_services_created_at 
ON medical_services(created_at);

-- Verification query (run manually to verify):
-- DESCRIBE medical_services;
-- SELECT id, code, name_ar, created_at, updated_at FROM medical_services LIMIT 5;
