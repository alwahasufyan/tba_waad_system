import apiClient from './axiosClient';

// ==============================|| REVIEWER COMPANIES SERVICE ||============================== //

const BASE_URL = '/api/reviewer-companies';

export const reviewersService = {
  /**
   * Get all reviewer companies
   * @returns {Promise<Array>} List of reviewer companies
   */
  getAll: async () => {
    return await apiClient.get(BASE_URL);
  },

  /**
   * Get reviewer company by ID
   * @param {number} id - Reviewer company ID
   * @returns {Promise<Object>} Reviewer company details
   */
  getById: async (id) => {
    return await apiClient.get(`${BASE_URL}/${id}`);
  },

  /**
   * Create new reviewer company
   * @param {Object} data - Reviewer company data
   * @returns {Promise<Object>} Created reviewer company
   */
  create: async (data) => {
    return await apiClient.post(BASE_URL, data);
  },

  /**
   * Update reviewer company
   * @param {number} id - Reviewer company ID
   * @param {Object} data - Updated reviewer company data
   * @returns {Promise<Object>} Updated reviewer company
   */
  update: async (id, data) => {
    return await apiClient.put(`${BASE_URL}/${id}`, data);
  },

  /**
   * Delete reviewer company
   * @param {number} id - Reviewer company ID
   * @returns {Promise<void>}
   */
  remove: async (id) => {
    return await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Search reviewer companies
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Filtered reviewer companies
   */
  search: async (searchTerm) => {
    return await apiClient.get(`${BASE_URL}/search?q=${encodeURIComponent(searchTerm)}`);
  }
};

export default reviewersService;
