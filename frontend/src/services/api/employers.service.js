import axiosClient from 'utils/axios';
import { normalizePaginatedResponse } from 'utils/api-response-normalizer';

/**
 * Employers API Service
 * Provides CRUD operations for Employers module
 */

const BASE_URL = '/employers';

/**
 * Helper function to unwrap ApiResponse
 * Backend returns: { status: "success", data: {...}, message: "...", timestamp: "..." }
 * We need response.data.data (axios wraps in .data, then ApiResponse has .data)
 * DEFENSIVE: Always return array for list operations, single item for detail operations
 */
const unwrap = (response) => response.data?.data || response.data;

/**
 * Helper to safely extract array from API response
 * Handles both ApiResponse<List<T>> and ApiResponse<PaginationResponse<T>>
 */
const unwrapArray = (response) => {
  const data = response?.data?.data || response?.data;
  // If data is an array, return it
  if (Array.isArray(data)) return data;
  // If data has items (pagination), return items
  if (data?.items && Array.isArray(data.items)) return data.items;
  // If data has content (Spring Page), return content
  if (data?.content && Array.isArray(data.content)) return data.content;
  // Fallback to empty array
  return [];
};

/**
 * Get all employers (no pagination)
 * @returns {Promise<Array>} List of all employers
 */
export const getEmployers = async () => {
  const response = await axiosClient.get(BASE_URL);
  return unwrapArray(response);
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
