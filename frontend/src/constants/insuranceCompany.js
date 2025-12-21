/**
 * Fixed Insurance Company Configuration
 * 
 * This system operates as a SINGLE-TENANT insurance system.
 * The insurance company is permanently fixed and cannot be changed.
 * 
 * DO NOT modify these values without understanding the full system impact.
 */

export const FIXED_INSURANCE_COMPANY = {
  id: 1, // Default ID - should match database seed
  name: 'الواحة للتأمين',
  nameEn: 'Alwaha Insurance',
  code: 'ALWAHA',
  // Read-only display label
  displayLabel: 'شركة التأمين: الواحة للتأمين'
};

/**
 * Get the fixed insurance company ID for form submissions
 */
export const getFixedInsuranceCompanyId = () => FIXED_INSURANCE_COMPANY.id;

/**
 * Get the display name for the insurance company
 */
export const getInsuranceCompanyName = () => FIXED_INSURANCE_COMPANY.name;

/**
 * Check if single-tenant mode is enabled (always true in this system)
 */
export const isSingleTenantMode = () => true;
