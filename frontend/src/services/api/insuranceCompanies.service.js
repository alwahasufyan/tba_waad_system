import apiClient from './axiosClient';

// ==============================|| INSURANCE COMPANIES SERVICE ||============================== //

const BASE_URL = '/api/insurance-companies';

export const insuranceCompaniesService = {
  /**
   * Get all insurance companies
   * @returns {Promise<Array>} List of insurance companies
   */
  getAll: async () => {
    return await apiClient.get(BASE_URL);
  },

  /**
   * Get insurance company by ID
   * @param {number} id - Insurance company ID
   * @returns {Promise<Object>} Insurance company details
   */
  getById: async (id) => {
    return await apiClient.get(`${BASE_URL}/${id}`);
  },

  /**
   * Create new insurance company
   * @param {Object} data - Insurance company data
   * @returns {Promise<Object>} Created insurance company
   */
  create: async (data) => {
    return await apiClient.post(BASE_URL, data);
  },

  /**
   * Update insurance company
   * @param {number} id - Insurance company ID
   * @param {Object} data - Updated insurance company data
   * @returns {Promise<Object>} Updated insurance company
   */
  update: async (id, data) => {
    return await apiClient.put(`${BASE_URL}/${id}`, data);
  },

  /**
   * Delete insurance company
   * @param {number} id - Insurance company ID
   * @returns {Promise<void>}
   */
  remove: async (id) => {
    return await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Search insurance companies
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Filtered insurance companies
   */
  search: async (searchTerm) => {
    return await apiClient.get(`${BASE_URL}/search?q=${encodeURIComponent(searchTerm)}`);
  }
};

export default insuranceCompaniesService;
