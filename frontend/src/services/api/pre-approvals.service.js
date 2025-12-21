import apiClient from './axiosClient';

// ==============================|| PRE-APPROVALS SERVICE ||============================== //

const BASE_URL = '/pre-approvals';

/**
 * Helper function to unwrap ApiResponse
 */
const unwrap = (response) => response.data?.data || response.data;

export const preApprovalsService = {
  /**
   * Get all pre-approvals
   * @returns {Promise<Array>} List of pre-approvals
   */
  getAll: async () => {
    const response = await apiClient.get(BASE_URL);
    return unwrap(response);
  },

  /**
   * Get pre-approval by ID
   * @param {number} id - Pre-approval ID
   * @returns {Promise<Object>} Pre-approval details
   */
  getById: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return unwrap(response);
  },

  /**
   * Create new pre-approval
   * @param {Object} data - Pre-approval data
   * @returns {Promise<Object>} Created pre-approval
   */
  create: async (data) => {
    const response = await apiClient.post(BASE_URL, data);
    return unwrap(response);
  },

  /**
   * Update pre-approval
   * @param {number} id - Pre-approval ID
   * @param {Object} data - Updated pre-approval data
   * @returns {Promise<Object>} Updated pre-approval
   */
  update: async (id, data) => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data);
    return unwrap(response);
  },

  /**
   * Delete pre-approval
   * @param {number} id - Pre-approval ID
   * @returns {Promise<void>}
   */
  remove: async (id) => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return unwrap(response);
  },

  /**
   * Get pre-approvals by status
   * @param {string} status - Status (PENDING, APPROVED, REJECTED)
   * @returns {Promise<Array>} List of pre-approvals
   */
  getByStatus: async (status) => {
    const response = await apiClient.get(`${BASE_URL}/status/${status}`);
    return unwrap(response);
  },

  /**
   * Get pending pre-approvals
   * @returns {Promise<Array>} List of pending pre-approvals
   */
  getPending: async () => {
    const response = await apiClient.get(`${BASE_URL}/pending`);
    return unwrap(response);
  },

  /**
   * Approve pre-approval
   * @param {number} id - Pre-approval ID
   * @param {Object} data - Approval data
   * @returns {Promise<Object>} Approved pre-approval
   */
  approve: async (id, data) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/approve`, data);
    return unwrap(response);
  },

  /**
   * Reject pre-approval
   * @param {number} id - Pre-approval ID
   * @param {Object} data - Rejection data
   * @returns {Promise<Object>} Rejected pre-approval
   */
  reject: async (id, data) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/reject`, data);
    return unwrap(response);
  }
};

export default preApprovalsService;
