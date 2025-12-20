import axiosClient from 'utils/axios';

/**
 * Medical Categories API Service
 * Provides CRUD operations for Medical Categories module
 * Backend: MedicalCategoryController.java
 */

const BASE_URL = '/api/medical-categories';

/**
 * Helper function to unwrap ApiResponse
 */
const unwrap = (response) => response.data?.data || response.data;

/**
 * Get paginated medical categories list
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Paginated response
 */
export const getMedicalCategories = async (params = {}) => {
  const response = await axiosClient.get(BASE_URL, { params });
  return unwrap(response);
};

/**
 * Get medical category by ID
 * @param {number} id - Category ID
 * @returns {Promise<Object>} Category details
 */
export const getMedicalCategoryById = async (id) => {
  const response = await axiosClient.get(`${BASE_URL}/${id}`);
  return unwrap(response);
};

/**
 * Create new medical category
 * @param {Object} payload - Category data
 * @returns {Promise<Object>} Created category
 */
export const createMedicalCategory = async (payload) => {
  const response = await axiosClient.post(BASE_URL, payload);
  return unwrap(response);
};

/**
 * Update medical category
 * @param {number} id - Category ID
 * @param {Object} payload - Updated category data
 * @returns {Promise<Object>} Updated category
 */
export const updateMedicalCategory = async (id, payload) => {
  const response = await axiosClient.put(`${BASE_URL}/${id}`, payload);
  return unwrap(response);
};

/**
 * Delete medical category
 * @param {number} id - Category ID
 * @returns {Promise<void>}
 */
export const deleteMedicalCategory = async (id) => {
  const response = await axiosClient.delete(`${BASE_URL}/${id}`);
  return unwrap(response);
};

/**
 * Get all categories (for dropdowns)
 * @returns {Promise<Array>} All categories
 */
export const getAllMedicalCategories = async () => {
  const response = await axiosClient.get(`${BASE_URL}/all`);
  return unwrap(response);
};
