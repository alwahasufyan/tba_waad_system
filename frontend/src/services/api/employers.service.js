import axiosClient from 'utils/axios';

/**
 * Employers API Service
 * Provides CRUD operations for Employers module
 */

const BASE_URL = '/api/employers';

/**
 * Helper function to unwrap ApiResponse
 * Backend returns: { success: true, data: {...}, message: "..." }
 */
const unwrap = (response) => response.data?.data || response.data;

/**
 * Get all employers (no pagination)
 * @returns {Promise<Array>} List of all employers
 */
export const getEmployers = async () => {
  const response = await axiosClient.get(BASE_URL);
  return unwrap(response);
};

/**
 * Get employer by ID
 * @param {number} id - Employer ID
 * @returns {Promise<Object>} Employer details
 */
export const getEmployerById = async (id) => {
  const response = await axiosClient.get(`${BASE_URL}/${id}`);
  return unwrap(response);
};

/**
 * Create new employer
 * @param {Object} dto - Employer data
 * @param {string} dto.nameAr - Name in Arabic (required)
 * @param {string} dto.nameEn - Name in English (optional)
 * @param {string} dto.employerCode - Employer code (required)
 * @param {boolean} dto.active - Active status (default: true)
 * @returns {Promise<Object>} Created employer
 */
export const createEmployer = async (dto) => {
  const response = await axiosClient.post(BASE_URL, dto);
  return unwrap(response);
};

/**
 * Update existing employer
 * @param {number} id - Employer ID
 * @param {Object} dto - Updated employer data
 * @returns {Promise<Object>} Updated employer
 */
export const updateEmployer = async (id, dto) => {
  const response = await axiosClient.put(`${BASE_URL}/${id}`, dto);
  return unwrap(response);
};

/**
 * Delete employer
 * @param {number} id - Employer ID
 * @returns {Promise<void>}
 */
export const deleteEmployer = async (id) => {
  const response = await axiosClient.delete(`${BASE_URL}/${id}`);
  return unwrap(response);
};

// Default export for convenient imports
const employersService = {
  getEmployers,
  getEmployerById,
  createEmployer,
  updateEmployer,
  deleteEmployer
};

export default employersService;
