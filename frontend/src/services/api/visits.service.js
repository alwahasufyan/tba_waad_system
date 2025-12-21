import apiClient from './axiosClient';

// ==============================|| VISITS SERVICE ||============================== //

const BASE_URL = '/visits';

/**
 * Helper function to unwrap ApiResponse
 */
const unwrap = (response) => response.data?.data || response.data;

export const visitsService = {
  /**
   * Get all visits
   * @returns {Promise<Array>} List of visits
   */
  getAll: async () => {
    const response = await apiClient.get(BASE_URL);
    return unwrap(response);
  },

  /**
   * Get visit by ID
   * @param {number} id - Visit ID
   * @returns {Promise<Object>} Visit details
   */
  getById: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return unwrap(response);
  },

  /**
   * Create new visit
   * @param {Object} data - Visit data
   * @returns {Promise<Object>} Created visit
   */
  create: async (data) => {
    const response = await apiClient.post(BASE_URL, data);
    return unwrap(response);
  },

  /**
   * Update visit
   * @param {number} id - Visit ID
   * @param {Object} data - Updated visit data
   * @returns {Promise<Object>} Updated visit
   */
  update: async (id, data) => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data);
    return unwrap(response);
  },

  /**
   * Delete visit
   * @param {number} id - Visit ID
   * @returns {Promise<void>}
   */
  remove: async (id) => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return unwrap(response);
  },

  /**
   * Get visits by member
   * @param {number} memberId - Member ID
   * @returns {Promise<Array>} List of visits
   */
  getByMember: async (memberId) => {
    const response = await apiClient.get(`${BASE_URL}/member/${memberId}`);
    return unwrap(response);
  },

  /**
   * Search visits
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Filtered visits
   */
  search: async (searchTerm) => {
    const response = await apiClient.get(`${BASE_URL}/search?q=${encodeURIComponent(searchTerm)}`);
    return unwrap(response);
  }
};

export default visitsService;
