import axiosClient from 'utils/axios';

/**
 * Medical Services API Service
 * Provides CRUD operations for Medical Services module
 * Backend: MedicalServiceController.java
 */

const BASE_URL = '/medical-services';

/**
 * Helper function to unwrap ApiResponse
 * Backend returns: { success: true, data: {...}, message: "..." }
 */
const unwrap = (response) => response.data?.data || response.data;

/**
 * Get paginated medical services list
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Paginated response
 */
export const getMedicalServices = async (params = {}) => {
  const response = await axiosClient.get(BASE_URL, { params });
  return unwrap(response);
};

/**
 * Get medical service by ID
 * @param {number} id - Service ID
 * @returns {Promise<Object>} Service details
 */
export const getMedicalServiceById = async (id) => {
  const response = await axiosClient.get(`${BASE_URL}/${id}`);
  return unwrap(response);
};

/**
 * Create new medical service
 * @param {Object} payload - Service data
 * @returns {Promise<Object>} Created service
 */
export const createMedicalService = async (payload) => {
  const response = await axiosClient.post(BASE_URL, payload);
  return unwrap(response);
};

/**
 * Update medical service
 * @param {number} id - Service ID
 * @param {Object} payload - Updated service data
 * @returns {Promise<Object>} Updated service
 */
export const updateMedicalService = async (id, payload) => {
  const response = await axiosClient.put(`${BASE_URL}/${id}`, payload);
  return unwrap(response);
};

/**
 * Delete medical service
 * @param {number} id - Service ID
 * @returns {Promise<void>}
 */
export const deleteMedicalService = async (id) => {
  const response = await axiosClient.delete(`${BASE_URL}/${id}`);
  return unwrap(response);
};

/**
 * Get all services (for dropdowns)
 * @returns {Promise<Array>} All services
 */
export const getAllMedicalServices = async () => {
  const response = await axiosClient.get(`${BASE_URL}/all`);
  return unwrap(response);
};
