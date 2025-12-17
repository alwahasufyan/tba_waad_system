import apiClient from './axiosClient';

// ==============================|| VISITS SERVICE ||============================== //

const BASE_URL = '/api/visits';

export const visitsService = {
  /**
   * Get all visits
   * @returns {Promise<Array>} List of visits
   */
  getAll: async () => {
    return await apiClient.get(BASE_URL);
  },

  /**
   * Get visit by ID
   * @param {number} id - Visit ID
   * @returns {Promise<Object>} Visit details
   */
  getById: async (id) => {
    return await apiClient.get(`${BASE_URL}/${id}`);
  },

  /**
   * Create new visit
   * @param {Object} data - Visit data
   * @returns {Promise<Object>} Created visit
   */
  create: async (data) => {
    return await apiClient.post(BASE_URL, data);
  },

  /**
   * Update visit
   * @param {number} id - Visit ID
   * @param {Object} data - Updated visit data
   * @returns {Promise<Object>} Updated visit
   */
  update: async (id, data) => {
    return await apiClient.put(`${BASE_URL}/${id}`, data);
  },

  /**
   * Delete visit
   * @param {number} id - Visit ID
   * @returns {Promise<void>}
   */
  remove: async (id) => {
    return await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Get visits by member
   * @param {number} memberId - Member ID
   * @returns {Promise<Array>} List of visits
   */
  getByMember: async (memberId) => {
    return await apiClient.get(`${BASE_URL}/member/${memberId}`);
  },

  /**
   * Search visits
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Filtered visits
   */
  search: async (searchTerm) => {
    return await apiClient.get(`${BASE_URL}/search?q=${encodeURIComponent(searchTerm)}`);
  }
};

export default visitsService;
