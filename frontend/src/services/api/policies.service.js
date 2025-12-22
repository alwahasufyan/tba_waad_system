import axiosClient from 'utils/axios';

/**
 * Insurance Policies API Service
 * Provides CRUD operations for Insurance Policies module
 * Backend: PolicyController.java (or InsurancePolicyController.java)
 */

const BASE_URL = '/policies';

/**
 * Helper function to unwrap ApiResponse
 * Backend returns: { status: "success", data: {...}, message: "...", timestamp: "..." }
 */
const unwrap = (response) => response.data?.data || response.data;

/**
 * Get paginated insurance policies list
 * Endpoint: GET /api/policies
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (1-based, default: 1)
 * @param {number} params.size - Page size (default: 20)
 * @param {string} params.sortBy - Sort field (default: 'createdAt')
 * @param {string} params.sortDir - Sort direction: 'asc' or 'desc' (default: 'desc')
 * @param {string} params.search - Search query (optional)
 * @returns {Promise<Object>} Paginated response with items, total, page, size
 */
export const getPolicies = async (params = {}) => {
  const response = await axiosClient.get(BASE_URL, { params });
  return unwrap(response);
};

/**
 * Get policy by ID
 * Endpoint: GET /api/policies/{id}
 * @param {number} id - Policy ID
 * @returns {Promise<Object>} Policy details
 */
export const getPolicyById = async (id) => {
  const response = await axiosClient.get(`${BASE_URL}/${id}`);
  return unwrap(response);
};

/**
 * Create new policy
 * Endpoint: POST /api/policies
 * @param {Object} payload - Policy data
 * @returns {Promise<Object>} Created policy
 */
export const createPolicy = async (payload) => {
  const response = await axiosClient.post(BASE_URL, payload);
  return unwrap(response);
};

/**
 * Update existing policy
 * Endpoint: PUT /api/policies/{id}
 * @param {number} id - Policy ID
 * @param {Object} payload - Updated policy data
 * @returns {Promise<Object>} Updated policy
 */
export const updatePolicy = async (id, payload) => {
  const response = await axiosClient.put(`${BASE_URL}/${id}`, payload);
  return unwrap(response);
};

/**
 * Delete policy
 * Endpoint: DELETE /api/policies/{id}
 * @param {number} id - Policy ID
 * @returns {Promise<void>}
 */
export const deletePolicy = async (id) => {
  const response = await axiosClient.delete(`${BASE_URL}/${id}`);
  return unwrap(response);
};

/**
 * Get policies selector options (for dropdowns)
 * Endpoint: GET /api/policies/selector
 * @returns {Promise<Array>} Active policies list for selection
 */
export const getPoliciesSelector = async () => {
  const response = await axiosClient.get(`${BASE_URL}/selector`);
  return unwrap(response);
};

// Default export for convenience
export default {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
  getPoliciesSelector
};
