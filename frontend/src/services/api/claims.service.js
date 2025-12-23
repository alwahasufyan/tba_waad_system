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
  },

  // ======================= INBOX OPERATIONS =======================

  /**
   * Get pending claims for inbox (operations review)
   * @param {Object} params - Pagination params {page, size, sortBy, sortDir}
   * @returns {Promise<Object>} Paginated pending claims {items, total, page, size}
   */
  getPendingClaims: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.size) queryParams.append('size', params.size);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);
    
    const response = await apiClient.get(`${BASE_URL}/inbox/pending?${queryParams.toString()}`);
    return unwrap(response);
  },

  /**
   * Get approved claims ready for settlement
   * @param {Object} params - Pagination params {page, size, sortBy, sortDir}
   * @returns {Promise<Object>} Paginated approved claims {items, total, page, size}
   */
  getApprovedClaims: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.size) queryParams.append('size', params.size);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);
    
    const response = await apiClient.get(`${BASE_URL}/inbox/approved?${queryParams.toString()}`);
    return unwrap(response);
  },

  /**
   * Get cost breakdown (Financial Snapshot) for a claim
   * @param {number} id - Claim ID
   * @returns {Promise<Object>} Cost breakdown {requestedAmount, patientCoPay, netProviderAmount, ...}
   */
  getCostBreakdown: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}/cost-breakdown`);
    return unwrap(response);
  },

  /**
   * Submit claim for review (change status from DRAFT to PENDING)
   * @param {number} id - Claim ID
   * @returns {Promise<Object>} Updated claim
   */
  submit: async (id) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/submit`);
    return unwrap(response);
  },

  /**
   * Settle an approved claim (Finance operation)
   * @param {number} id - Claim ID
   * @param {Object} data - Settlement data {paymentReference, notes}
   * @returns {Promise<Object>} Settled claim
   */
  settle: async (id, data) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/settle`, data);
    return unwrap(response);
  },

  // ======================= REPORTS =======================

  /**
   * Get adjudication report
   * @param {Object} params - Report params {startDate, endDate, providerId, status}
   * @returns {Promise<Object>} Adjudication report
   */
  getAdjudicationReport: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.providerId) queryParams.append('providerId', params.providerId);
    if (params.status) queryParams.append('status', params.status);
    
    const response = await apiClient.get(`/reports/adjudication?${queryParams.toString()}`);
    return unwrap(response);
  },

  /**
   * Get provider settlement report
   * @param {number} providerId - Provider ID
   * @param {Object} params - Report params {startDate, endDate}
   * @returns {Promise<Object>} Provider settlement report
   */
  getProviderSettlementReport: async (providerId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const response = await apiClient.get(`/reports/provider-settlement/${providerId}?${queryParams.toString()}`);
    return unwrap(response);
  },

  /**
   * Get member statement
   * @param {number} memberId - Member ID
   * @returns {Promise<Object>} Member claims statement
   */
  getMemberStatement: async (memberId) => {
    const response = await apiClient.get(`/reports/member-statement/${memberId}`);
    return unwrap(response);
  }
};

export default claimsService;
