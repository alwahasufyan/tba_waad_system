// ==============================|| PROVIDERS API - TBA DOMAIN ||============================== //
// DOMAIN NOTE: Providers = Hospitals, Clinics, Labs, Pharmacies
// Used in Kanban board to display provider network

import apiClient from './axiosClient';

const BASE_URL = '/api/providers';

/**
 * Helper function to unwrap ApiResponse
 */
const unwrap = (response) => response.data?.data || response.data;

/**
 * Providers Service
 * Manages healthcare providers (hospitals, clinics, labs, pharmacies)
 * Used in Kanban UI to display provider network and status
 */
export const providersService = {
  /**
   * Get all providers
   * @param {Object} params - Optional query parameters
   * @returns {Promise<Array>} List of providers
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get(BASE_URL, { params });
    return unwrap(response);
  },

  /**
   * Get provider by ID
   * @param {number} id - Provider ID
   * @returns {Promise<Object>} Provider details
   */
  getById: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return unwrap(response);
  },

  /**
   * Create new provider
   * @param {Object} data - Provider data
   * @returns {Promise<Object>} Created provider
   */
  create: async (data) => {
    const response = await apiClient.post(BASE_URL, data);
    return unwrap(response);
  },

  /**
   * Update provider
   * @param {number} id - Provider ID
   * @param {Object} data - Updated provider data
   * @returns {Promise<Object>} Updated provider
   */
  update: async (id, data) => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data);
    return unwrap(response);
  },

  /**
   * Delete provider
   * @param {number} id - Provider ID
   * @returns {Promise<void>}
   */
  remove: async (id) => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return unwrap(response);
  },

  /**
   * Search providers
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching providers
   */
  search: async (query) => {
    const response = await apiClient.get(`${BASE_URL}/search`, { params: { query } });
    return unwrap(response);
  },

  /**
   * Get providers by type (hospital, clinic, lab, pharmacy)
   * @param {string} type - Provider type
   * @returns {Promise<Array>} Filtered providers
   */
  getByType: async (type) => {
    const response = await apiClient.get(`${BASE_URL}/type/${type}`);
    return unwrap(response);
  },

  /**
   * Get providers by region/city
   * @param {string} region - Region or city name
   * @returns {Promise<Array>} Providers in region
   */
  getByRegion: async (region) => {
    const response = await apiClient.get(`${BASE_URL}/region/${region}`);
    return unwrap(response);
  }
};

export default providersService;
