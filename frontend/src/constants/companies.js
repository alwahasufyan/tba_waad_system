/**
 * Official Organizational Structure for TBA-WAAD System
 * 
 * DO NOT modify these entities or create temporary/demo companies.
 * These are the ONLY authorized entities in the system.
 */

// Primary Insurance Company
export const INSURANCE_COMPANY = {
  name: "شركة الواحة للتأمين",
  nameEn: "Al Waha Insurance Company",
  code: "ALWAHA_INS",
  type: "INSURANCE"
};

// TPA (Third Party Administrator) - Main Company Running TBA System
export const TPA_COMPANY = {
  name: "شركة وعد لإدارة مطالبات التأمين الصحي",
  nameEn: "WAAD TPA",
  code: "WAAD_TPA",
  type: "TPA"
};

// Employers Under Al Waha Insurance (Managed by WAAD TPA)
export const EMPLOYERS = [
  {
    label: "شركة الإسمنت الليبية",
    labelEn: "Libyan Cement Company",
    value: "LIBCEMENT",
    code: "LIBCEMENT"
  },
  {
    label: "منطقة جليانة",
    labelEn: "Jalyana Region",
    value: "JALYANA",
    code: "JALYANA"
  },
  {
    label: "مصرف الوحدة",
    labelEn: "Wahda Bank",
    value: "WAHDA_BANK",
    code: "WAHDA_BANK"
  },
  {
    label: "مصلحة الجمارك",
    labelEn: "Customs Authority",
    value: "CUSTOMS",
    code: "CUSTOMS"
  }
];

// Helper function to get employer by code
export const getEmployerByCode = (code) => {
  return EMPLOYERS.find(emp => emp.code === code);
};

// Helper function to get all employer codes
export const getEmployerCodes = () => {
  return EMPLOYERS.map(emp => emp.code);
};

// Export all entities as a single object for easy import
export const OFFICIAL_ENTITIES = {
  insuranceCompany: INSURANCE_COMPANY,
  tpaCompany: TPA_COMPANY,
  employers: EMPLOYERS
};

export default OFFICIAL_ENTITIES;
