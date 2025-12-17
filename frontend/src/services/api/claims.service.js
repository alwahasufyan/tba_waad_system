import apiClient from './axiosClient';

// ==============================|| CLAIMS SERVICE ||============================== //

const BASE_URL = '/api/claims';

export const claimsService = {
  /**
   * Get all claims
   * @returns {Promise<Array>} List of claims
   */
  getAll: async () => {
    return await apiClient.get(BASE_URL);
  },

  /**
   * Get claim by ID
   * @param {number} id - Claim ID
   * @returns {Promise<Object>} Claim details
   */
  getById: async (id) => {
    return await apiClient.get(`${BASE_URL}/${id}`);
  },

  /**
   * Get claim by claim number
   * @param {string} claimNumber - Claim number
   * @returns {Promise<Object>} Claim details
   */
  getByClaimNumber: async (claimNumber) => {
    return await apiClient.get(`${BASE_URL}/number/${claimNumber}`);
  },

  /**
   * Create new claim
   * @param {Object} data - Claim data
   * @returns {Promise<Object>} Created claim
   */
  create: async (data) => {
    return await apiClient.post(BASE_URL, data);
  },

  /**
   * Update claim
   * @param {number} id - Claim ID
   * @param {Object} data - Updated claim data
   * @returns {Promise<Object>} Updated claim
   */
  update: async (id, data) => {
    return await apiClient.put(`${BASE_URL}/${id}`, data);
  },

  /**
   * Delete claim
   * @param {number} id - Claim ID
   * @returns {Promise<void>}
   */
  remove: async (id) => {
    return await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Get claims by visit
   * @param {number} visitId - Visit ID
   * @returns {Promise<Array>} List of claims
   */
  getByVisit: async (visitId) => {
    return await apiClient.get(`${BASE_URL}/visit/${visitId}`);
  },

  /**
   * Get claims by status
   * @param {string} status - Claim status (PENDING, APPROVED, REJECTED)
   * @returns {Promise<Array>} List of claims
   */
  getByStatus: async (status) => {
    return await apiClient.get(`${BASE_URL}/status/${status}`);
  },

  /**
   * Approve claim
   * @param {number} id - Claim ID
   * @param {Object} data - Approval data (approvedAmount, notes)
   * @returns {Promise<Object>} Approved claim
   */
  approve: async (id, data) => {
    return await apiClient.post(`${BASE_URL}/${id}/approve`, data);
  },

  /**
   * Reject claim
   * @param {number} id - Claim ID
   * @param {Object} data - Rejection data (rejectionReason)
   * @returns {Promise<Object>} Rejected claim
   */
  reject: async (id, data) => {
    return await apiClient.post(`${BASE_URL}/${id}/reject`, data);
  },

  /**
   * Search claims
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Filtered claims
   */
  search: async (searchTerm) => {
    return await apiClient.get(`${BASE_URL}/search?q=${encodeURIComponent(searchTerm)}`);
  }
};

export default claimsService;
