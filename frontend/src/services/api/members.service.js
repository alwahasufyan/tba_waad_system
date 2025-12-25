import axiosClient from 'utils/axios';
import { normalizePaginatedResponse } from 'utils/api-response-normalizer';

/**
 * Members API Service
 * Provides CRUD operations for Members module
 * Backend: MemberController.java
 */
const BASE_URL = '/members';

/**
 * Helper function to unwrap ApiResponse
 * Backend returns: { status: "success", data: {...}, message: "...", timestamp: "..." }
 */
const unwrap = (response) => response.data?.data || response.data;

/**
 * Get paginated members list
 * Endpoint: GET /api/members
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (1-based, default: 1)
 * @param {number} params.size - Page size (default: 20)
 * @param {string} params.sortBy - Sort field (default: 'createdAt')
 * @param {string} params.sortDir - Sort direction: 'asc' or 'desc' (default: 'desc')
 * @param {string} params.search - Search query (optional)
 * @returns {Promise<Object>} Paginated response with items, total, page, size
 */
export const getMembers = async (params = {}) => {
  const response = await axiosClient.get(BASE_URL, { params });
  return normalizePaginatedResponse(response);
};

/**
 * Get member by ID
 * Endpoint: GET /api/members/{id}
 * @param {number} id - Member ID
 * @returns {Promise<Object>} MemberViewDto with family members
 */
export const getMemberById = async (id) => {
  const response = await axiosClient.get(`${BASE_URL}/${id}`);
  return unwrap(response);
};

/**
 * Create new member
 * Endpoint: POST /api/members
 * @param {Object} payload - MemberCreateDto
 * @param {string} payload.fullNameArabic - Full name in Arabic (required)
 * @param {string} payload.fullNameEnglish - Full name in English (optional)
 * @param {string} payload.civilId - Civil ID (required)
 * @param {string} payload.birthDate - Birth date yyyy-MM-dd (required)
 * @param {string} payload.gender - Gender: MALE, FEMALE (required)
 * @param {number} payload.employerId - Employer ID (required)
 * @param {Array} payload.familyMembers - Family members array (optional)
 * @returns {Promise<Object>} Created MemberViewDto
 */
export const createMember = async (payload) => {
  const response = await axiosClient.post(BASE_URL, payload);
  return unwrap(response);
};

/**
 * Update existing member
 * Endpoint: PUT /api/members/{id}
 * @param {number} id - Member ID
 * @param {Object} payload - MemberUpdateDto
 * @returns {Promise<Object>} Updated MemberViewDto
 */
export const updateMember = async (id, payload) => {
  const response = await axiosClient.put(`${BASE_URL}/${id}`, payload);
  return unwrap(response);
};

/**
 * Delete member (soft delete)
 * Endpoint: DELETE /api/members/{id}
 * @param {number} id - Member ID
 * @returns {Promise<void>}
 */
export const deleteMember = async (id) => {
  const response = await axiosClient.delete(`${BASE_URL}/${id}`);
  return unwrap(response);
};

/**
 * Get members selector options (for dropdowns)
 * Endpoint: GET /api/members/selector
 * @returns {Promise<Array>} Active members list for selection
 */
export const getMembersSelector = async () => {
  const response = await axiosClient.get(`${BASE_URL}/selector`);
  return unwrap(response);
};

/**
 * Get total members count
 * Endpoint: GET /api/members/count
 * @returns {Promise<number>} Total number of members
 */
export const getMembersCount = async () => {
  const response = await axiosClient.get(`${BASE_URL}/count`);
  return unwrap(response);
};

/**
 * Search members by query
 * Endpoint: GET /api/members/search
 * @param {string} query - Search query
 * @returns {Promise<Array>} Filtered members list
 */
export const searchMembers = async (query) => {
  const response = await axiosClient.get(`${BASE_URL}/search`, {
    params: { query }
  });
  return unwrap(response);
};

// ============================================================================
// BULK IMPORT OPERATIONS
// ============================================================================

/**
 * Preview import from Excel file (dry-run)
 * Endpoint: POST /api/members/import/preview
 * @param {File} file - Excel file (.xlsx)
 * @returns {Promise<Object>} MemberImportPreviewDto
 */
export const previewImport = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axiosClient.post(`${BASE_URL}/import/preview`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return unwrap(response);
};

/**
 * Execute import from Excel file
 * Endpoint: POST /api/members/import/execute
 * @param {File} file - Excel file (.xlsx)
 * @param {string} batchId - Import batch ID from preview
 * @returns {Promise<Object>} MemberImportResultDto
 */
export const executeImport = async (file, batchId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('batchId', batchId);
  
  const response = await axiosClient.post(`${BASE_URL}/import/execute`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return unwrap(response);
};

/**
 * Get import logs list
 * Endpoint: GET /api/members/import/logs
 * @param {Object} params - Pagination params
 * @returns {Promise<Object>} Paginated import logs
 */
export const getImportLogs = async (params = {}) => {
  const response = await axiosClient.get(`${BASE_URL}/import/logs`, { params });
  return unwrap(response);
};

/**
 * Get import log details
 * Endpoint: GET /api/members/import/logs/{batchId}
 * @param {string} batchId - Import batch ID
 * @returns {Promise<Object>} Import log details
 */
export const getImportLogDetails = async (batchId) => {
  const response = await axiosClient.get(`${BASE_URL}/import/logs/${batchId}`);
  return unwrap(response);
};

/**
 * Get import errors for a batch
 * Endpoint: GET /api/members/import/logs/{batchId}/errors
 * @param {string} batchId - Import batch ID
 * @returns {Promise<Array>} List of import errors
 */
export const getImportErrors = async (batchId) => {
  const response = await axiosClient.get(`${BASE_URL}/import/logs/${batchId}/errors`);
  return unwrap(response);
};

/**
 * Get import template info
 * Endpoint: GET /api/members/import/template
 * @returns {Promise<Object>} Template column info
 */
export const getImportTemplate = async () => {
  const response = await axiosClient.get(`${BASE_URL}/import/template`);
  return unwrap(response);
};

/**
 * Refresh benefit policies for all members of an employer
 * Endpoint: POST /api/members/employer/{employerOrgId}/refresh-policies
 * @param {number} employerOrgId - Employer Organization ID
 * @returns {Promise<number>} Number of members updated
 */
export const refreshBenefitPoliciesForEmployer = async (employerOrgId) => {
  const response = await axiosClient.post(`${BASE_URL}/employer/${employerOrgId}/refresh-policies`);
  return unwrap(response);
};

// Default export for convenient imports
const membersService = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getMembersSelector,
  getMembersCount,
  searchMembers,
  // Import operations
  previewImport,
  executeImport,
  getImportLogs,
  getImportLogDetails,
  getImportErrors,
  getImportTemplate,
  // Benefit Policy operations
  refreshBenefitPoliciesForEmployer
};

export default membersService;
