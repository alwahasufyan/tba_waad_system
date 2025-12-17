import axiosClient from 'utils/axios';

/**
 * Medical Packages API Service
 * Provides CRUD operations for Medical Packages module
 * Backend: MedicalPackageController.java
 */

const BASE_URL = '/medical-packages';

/**
 * Helper function to unwrap ApiResponse
 * Backend returns: { success: true, data: {...}, message: "..." }
 */
const unwrap = (response) => response.data?.data || response.data;

/**
 * Get paginated medical packages list
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Paginated response
 */
export const getMedicalPackages = async (params = {}) => {
  const response = await axiosClient.get(BASE_URL, { params });
  return unwrap(response);
};

/**
 * Get medical package by ID
 * @param {number} id - Package ID
 * @returns {Promise<Object>} Package details
 */
export const getMedicalPackageById = async (id) => {
  const response = await axiosClient.get(`${BASE_URL}/${id}`);
  return unwrap(response);
};

/**
 * Create new medical package
 * @param {Object} payload - Package data
 * @returns {Promise<Object>} Created package
 */
export const createMedicalPackage = async (payload) => {
  const response = await axiosClient.post(BASE_URL, payload);
  return unwrap(response);
};

/**
 * Update medical package
 * @param {number} id - Package ID
 * @param {Object} payload - Updated package data
 * @returns {Promise<Object>} Updated package
 */
export const updateMedicalPackage = async (id, payload) => {
  const response = await axiosClient.put(`${BASE_URL}/${id}`, payload);
  return unwrap(response);
};

/**
 * Delete medical package
 * @param {number} id - Package ID
 * @returns {Promise<void>}
 */
export const deleteMedicalPackage = async (id) => {
  const response = await axiosClient.delete(`${BASE_URL}/${id}`);
  return unwrap(response);
};

/**
 * Get all packages (for dropdowns)
 * @returns {Promise<Array>} All packages
 */
export const getAllMedicalPackages = async () => {
  const response = await axiosClient.get(`${BASE_URL}/all`);
  return unwrap(response);
};
