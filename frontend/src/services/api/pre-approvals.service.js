import axiosClient from 'utils/axios';

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
    const response = await axiosClient.get(BASE_URL);
    return unwrap(response);
  },

  /**
   * Get pre-approval by ID
   * @param {number} id - Pre-approval ID
   * @returns {Promise<Object>} Pre-approval details
   */
  getById: async (id) => {
    const response = await axiosClient.get(`${BASE_URL}/${id}`);
    return unwrap(response);
  },

  /**
   * Create new pre-approval
   * @param {Object} data - Pre-approval data
   * @returns {Promise<Object>} Created pre-approval
   */
  create: async (data) => {
    const response = await axiosClient.post(BASE_URL, data);
    return unwrap(response);
  },

  /**
   * Update pre-approval
   * @param {number} id - Pre-approval ID
   * @param {Object} data - Updated pre-approval data
   * @returns {Promise<Object>} Updated pre-approval
   */
  update: async (id, data) => {
    const response = await axiosClient.put(`${BASE_URL}/${id}`, data);
    return unwrap(response);
  },

  /**
   * Delete pre-approval
   * @param {number} id - Pre-approval ID
   * @returns {Promise<void>}
   */
  remove: async (id) => {
    const response = await axiosClient.delete(`${BASE_URL}/${id}`);
    return unwrap(response);
  },

  /**
   * Get pre-approvals by status
   * @param {string} status - Status (PENDING, APPROVED, REJECTED)
   * @returns {Promise<Array>} List of pre-approvals
   */
  getByStatus: async (status) => {
    const response = await axiosClient.get(`${BASE_URL}/status/${status}`);
    return unwrap(response);
  },

  /**
   * Get pending pre-approvals
   * @returns {Promise<Array>} List of pending pre-approvals
   */
  getPending: async () => {
    const response = await axiosClient.get(`${BASE_URL}/pending`);
    return unwrap(response);
  },

  /**
   * Approve pre-approval
   * @param {number} id - Pre-approval ID
   * @param {Object} data - Approval data
   * @returns {Promise<Object>} Approved pre-approval
   */
  approve: async (id, data) => {
    const response = await axiosClient.post(`${BASE_URL}/${id}/approve`, data);
    return unwrap(response);
  },

  /**
   * Reject pre-approval
   * @param {number} id - Pre-approval ID
   * @param {Object} data - Rejection data
   * @returns {Promise<Object>} Rejected pre-approval
   */
  reject: async (id, data) => {
    const response = await axiosClient.post(`${BASE_URL}/${id}/reject`, data);
    return unwrap(response);
  },

  // ======================= INBOX OPERATIONS =======================

  /**
   * Get pending pre-approvals for inbox (with pagination)
   * @param {Object} params - Pagination params {page, size, sortBy, sortDir}
   * @returns {Promise<Object>} Paginated pending pre-approvals {items, total, page, size}
   */
  getPending: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.size) queryParams.append('size', params.size);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);
    
    const response = await axiosClient.get(`${BASE_URL}/inbox/pending?${queryParams.toString()}`);
    return unwrap(response);
  },

  /**
   * Get pre-approvals by member
   * @param {number} memberId - Member ID
   * @returns {Promise<Array>} List of pre-approvals for member
   */
  getByMember: async (memberId) => {
    const response = await axiosClient.get(`${BASE_URL}/member/${memberId}`);
    return unwrap(response);
  },

  /**
   * Check if member has valid pre-approval for service
   * @param {number} memberId - Member ID
   * @param {string} serviceCode - Service code
   * @returns {Promise<Object>} Validity check result {valid, preApproval, remainingAmount}
   */
  checkValidity: async (memberId, serviceCode) => {
    const response = await axiosClient.get(`${BASE_URL}/check-validity?memberId=${memberId}&serviceCode=${serviceCode}`);
    return unwrap(response);
  }
};

export default preApprovalsService;
