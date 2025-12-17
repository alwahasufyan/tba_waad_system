import axios from 'utils/axios';

// ==============================|| API CLIENT - TBA BACKEND ||============================== //

/**
 * Generic API client that wraps axios and unwraps backend ApiResponse format
 * Backend wraps all responses in: { status: "success", data: {...}, timestamp: "..." }
 */

const apiClient = {
  /**
   * GET request
   * @param {string} url - API endpoint
   * @param {object} config - Axios config options
   * @returns {Promise} - Unwrapped data from ApiResponse
   */
  get: async (url, config = {}) => {
    const response = await axios.get(url, config);
    return response.data.data || response.data; // Unwrap ApiResponse
  },

  /**
   * POST request
   * @param {string} url - API endpoint
   * @param {object} data - Request body
   * @param {object} config - Axios config options
   * @returns {Promise} - Unwrapped data from ApiResponse
   */
  post: async (url, data, config = {}) => {
    const response = await axios.post(url, data, config);
    return response.data.data || response.data; // Unwrap ApiResponse
  },

  /**
   * PUT request
   * @param {string} url - API endpoint
   * @param {object} data - Request body
   * @param {object} config - Axios config options
   * @returns {Promise} - Unwrapped data from ApiResponse
   */
  put: async (url, data, config = {}) => {
    const response = await axios.put(url, data, config);
    return response.data.data || response.data; // Unwrap ApiResponse
  },

  /**
   * DELETE request
   * @param {string} url - API endpoint
   * @param {object} config - Axios config options
   * @returns {Promise} - Unwrapped data from ApiResponse
   */
  delete: async (url, config = {}) => {
    const response = await axios.delete(url, config);
    return response.data.data || response.data; // Unwrap ApiResponse
  },

  /**
   * PATCH request
   * @param {string} url - API endpoint
   * @param {object} data - Request body
   * @param {object} config - Axios config options
   * @returns {Promise} - Unwrapped data from ApiResponse
   */
  patch: async (url, data, config = {}) => {
    const response = await axios.patch(url, data, config);
    return response.data.data || response.data; // Unwrap ApiResponse
  }
};

export default apiClient;
