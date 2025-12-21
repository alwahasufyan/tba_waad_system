import apiClient from './axiosClient';

// ==============================|| CLAIMS SERVICE ||============================== //

const BASE_URL = '/claims';

/**
 * Helper function to unwrap ApiResponse
 */
const unwrap = (response) => response.data?.data || response.data;

export const claimsService = {
  /**
   * Get all claims
   * @returns {Promise<Array>} List of claims
   */
  getAll: async () => {
    const response = await apiClient.get(BASE_URL);
    return unwrap(response);
  },

  /**
   * Get claim by ID
   * @param {number} id - Claim ID
   * @returns {Promise<Object>} Claim details
   */
  getById: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return unwrap(response);
  },

  /**
   * Get claim by claim number
   * @param {string} claimNumber - Claim number
   * @returns {Promise<Object>} Claim details
   */
  getByClaimNumber: async (claimNumber) => {
    const response = await apiClient.get(`${BASE_URL}/number/${claimNumber}`);
    return unwrap(response);
  },

  /**
   * Create new claim
   * @param {Object} data - Claim data
   * @returns {Promise<Object>} Created claim
   */
  create: async (data) => {
    const response = await apiClient.post(BASE_URL, data);
    return unwrap(response);
  },

  /**
   * Update claim
   * @param {number} id - Claim ID
   * @param {Object} data - Updated claim data
   * @returns {Promise<Object>} Updated claim
   */
  update: async (id, data) => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data);
    return unwrap(response);
  },

  /**
   * Delete claim
   * @param {number} id - Claim ID
   * @returns {Promise<void>}
   */
  remove: async (id) => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return unwrap(response);
  },

  /**
   * Get claims by visit
   * @param {number} visitId - Visit ID
   * @returns {Promise<Array>} List of claims
   */
  getByVisit: async (visitId) => {
    const response = await apiClient.get(`${BASE_URL}/visit/${visitId}`);
    return unwrap(response);
  },

  /**
   * Get claims by status
   * @param {string} status - Claim status (PENDING, APPROVED, REJECTED)
   * @returns {Promise<Array>} List of claims
   */
  getByStatus: async (status) => {
    const response = await apiClient.get(`${BASE_URL}/status/${status}`);
    return unwrap(response);
  },

  /**
   * Approve claim
   * @param {number} id - Claim ID
   * @param {Object} data - Approval data (approvedAmount, notes)
   * @returns {Promise<Object>} Approved claim
   */
  approve: async (id, data) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/approve`, data);
    return unwrap(response);
  },

  /**
   * Reject claim
   * @param {number} id - Claim ID
   * @param {Object} data - Rejection data (rejectionReason)
   * @returns {Promise<Object>} Rejected claim
   */
  reject: async (id, data) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/reject`, data);
    return unwrap(response);
  },

  /**
   * Search claims
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Filtered claims
   */
  search: async (searchTerm) => {
    const response = await apiClient.get(`${BASE_URL}/search?q=${encodeURIComponent(searchTerm)}`);
    return unwrap(response);
  }
};

export default claimsService;
