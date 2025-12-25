import axiosClient from 'utils/axios';

// ==============================|| INSURANCE COMPANIES SERVICE ||============================== //

const BASE_URL = '/insurance-companies';

/**
 * Helper function to unwrap ApiResponse
 * Backend returns: { status: "success", data: {...}, message: "...", timestamp: "..." }
 */
const unwrap = (response) => response.data?.data || response.data;

export const insuranceCompaniesService = {
  /**
   * Get paginated insurance companies
   * @param {Object} params - Query parameters {page, size, search, sortBy, sortDir}
   * @returns {Promise<Object>} Pagination response {items, total, page, size}
   */
  getAll: async (params = {}) => {
    const response = await axiosClient.get(BASE_URL, { params });
    return unwrap(response);
  },

  /**
   * Get insurance company by ID
   * @param {number} id - Insurance company ID
   * @returns {Promise<Object>} Insurance company details
   */
  getById: async (id) => {
    const response = await axiosClient.get(`${BASE_URL}/${id}`);
    return unwrap(response);
  },

  /**
   * Create new insurance company
   * @param {Object} data - Insurance company data
   * @returns {Promise<Object>} Created insurance company
   */
  create: async (data) => {
    const response = await axiosClient.post(BASE_URL, data);
    return unwrap(response);
  },

  /**
   * Update insurance company
   * @param {number} id - Insurance company ID
   * @param {Object} data - Updated insurance company data
   * @returns {Promise<Object>} Updated insurance company
   */
  update: async (id, data) => {
    const response = await axiosClient.put(`${BASE_URL}/${id}`, data);
    return unwrap(response);
  },

  /**
   * Delete insurance company
   * @param {number} id - Insurance company ID
   * @returns {Promise<void>}
   */
  remove: async (id) => {
    const response = await axiosClient.delete(`${BASE_URL}/${id}`);
    return unwrap(response);
  },

  /**
   * Search insurance companies
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Filtered insurance companies
   */
  search: async (searchTerm) => {
    const response = await axiosClient.get(`${BASE_URL}/search?q=${encodeURIComponent(searchTerm)}`);
    return unwrap(response);
  }
};

export default insuranceCompaniesService;
