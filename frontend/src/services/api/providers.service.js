// ==============================|| PROVIDERS API - TBA DOMAIN ||============================== //
// DOMAIN NOTE: Providers = Hospitals, Clinics, Labs, Pharmacies
// Used in Kanban board to display provider network

import apiClient from './axiosClient';

const BASE_URL = '/api/providers';

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
    return await apiClient.get(BASE_URL, { params });
  },

  /**
   * Get provider by ID
   * @param {number} id - Provider ID
   * @returns {Promise<Object>} Provider details
   */
  getById: async (id) => {
    return await apiClient.get(`${BASE_URL}/${id}`);
  },

  /**
   * Create new provider
   * @param {Object} data - Provider data
   * @returns {Promise<Object>} Created provider
   */
  create: async (data) => {
    return await apiClient.post(BASE_URL, data);
  },

  /**
   * Update provider
   * @param {number} id - Provider ID
   * @param {Object} data - Updated provider data
   * @returns {Promise<Object>} Updated provider
   */
  update: async (id, data) => {
    return await apiClient.put(`${BASE_URL}/${id}`, data);
  },

  /**
   * Delete provider
   * @param {number} id - Provider ID
   * @returns {Promise<void>}
   */
  remove: async (id) => {
    return await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Search providers
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching providers
   */
  search: async (query) => {
    return await apiClient.get(`${BASE_URL}/search`, { params: { query } });
  },

  /**
   * Get providers by type (hospital, clinic, lab, pharmacy)
   * @param {string} type - Provider type
   * @returns {Promise<Array>} Filtered providers
   */
  getByType: async (type) => {
    return await apiClient.get(`${BASE_URL}/type/${type}`);
  },

  /**
   * Get providers by region/city
   * @param {string} region - Region or city name
   * @returns {Promise<Array>} Providers in region
   */
  getByRegion: async (region) => {
    return await apiClient.get(`${BASE_URL}/region/${region}`);
  }
};

export default providersService;
