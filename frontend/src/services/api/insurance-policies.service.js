import axiosClient from 'utils/axios';

/**
 * Insurance Policies API Service
 * Provides CRUD operations for Insurance Policies module
 * Backend: InsurancePolicyController.java
 * Endpoint: /api/insurance-policies
 */

const BASE_URL = '/insurance-policies';

/**
 * Helper function to unwrap ApiResponse
 * Backend returns: { status: "success", data: {...}, message: "...", timestamp: "..." }
 */
const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

/**
 * Extract items array defensively from various response formats
 * Handles: ApiResponse<PaginationResponse>, Spring Page, or raw array
 */
const extractItems = (data) => {
  if (!data) return [];
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  if (Array.isArray(data)) return data;
  return [];
};

/**
 * Extract total count defensively
 */
const extractTotal = (data) => {
  if (!data) return 0;
  if (typeof data?.data?.total === 'number') return data.data.total;
  if (typeof data?.data?.totalElements === 'number') return data.data.totalElements;
  if (typeof data?.total === 'number') return data.total;
  if (typeof data?.totalElements === 'number') return data.totalElements;
  return extractItems(data).length;
};

/**
 * Normalize pagination response to consistent format
 */
const normalizePagination = (response) => {
  const data = unwrap(response);
  return {
    items: extractItems(data),
    total: extractTotal(data),
    page: data?.page ?? data?.data?.page ?? 1,
    size: data?.size ?? data?.data?.size ?? 10
  };
};

export const insurancePoliciesService = {
  /**
   * Get paginated insurance policies
   * Endpoint: GET /api/insurance-policies
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (0-based for MUI, converted to 1-based for API)
   * @param {number} params.size - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: 'createdAt')
   * @param {string} params.sortDir - Sort direction: 'ASC' or 'DESC' (default: 'DESC')
   * @param {string} params.search - Search query (optional)
   * @returns {Promise<Object>} Normalized pagination response {items, total, page, size}
   */
  getAll: async (params = {}) => {
    try {
      // Convert 0-based page (MUI) to 1-based page (backend)
      const apiParams = {
        page: (params.page ?? 0) + 1,
        size: params.size ?? 10,
        sortBy: params.sortBy ?? 'createdAt',
        sortDir: params.sortDir ?? 'DESC',
        ...(params.search && { search: params.search })
      };
      const response = await axiosClient.get(BASE_URL, { params: apiParams });
      return normalizePagination(response);
    } catch (error) {
      console.error('[insurancePoliciesService.getAll] Error:', error?.message || error);
      throw error;
    }
  },

  /**
   * Get insurance policy by ID
   * Endpoint: GET /api/insurance-policies/{id}
   * @param {number} id - Policy ID
   * @returns {Promise<Object>} Policy details
   */
  getById: async (id) => {
    try {
      if (!id) throw new Error('Policy ID is required');
      const response = await axiosClient.get(`${BASE_URL}/${id}`);
      return unwrap(response);
    } catch (error) {
      console.error(`[insurancePoliciesService.getById] Error fetching policy ${id}:`, error?.message || error);
      throw error;
    }
  },

  /**
   * Create new insurance policy
   * Endpoint: POST /api/insurance-policies
   * @param {Object} data - Insurance policy data
   * @returns {Promise<Object>} Created policy
   */
  create: async (data) => {
    try {
      if (!data) throw new Error('Policy data is required');
      const response = await axiosClient.post(BASE_URL, data);
      return unwrap(response);
    } catch (error) {
      console.error('[insurancePoliciesService.create] Error:', error?.message || error);
      throw error;
    }
  },

  /**
   * Update existing insurance policy
   * Endpoint: PUT /api/insurance-policies/{id}
   * @param {number} id - Policy ID
   * @param {Object} data - Updated policy data
   * @returns {Promise<Object>} Updated policy
   */
  update: async (id, data) => {
    try {
      if (!id) throw new Error('Policy ID is required');
      if (!data) throw new Error('Policy data is required');
      const response = await axiosClient.put(`${BASE_URL}/${id}`, data);
      return unwrap(response);
    } catch (error) {
      console.error(`[insurancePoliciesService.update] Error updating policy ${id}:`, error?.message || error);
      throw error;
    }
  },

  /**
   * Delete insurance policy
   * Endpoint: DELETE /api/insurance-policies/{id}
   * @param {number} id - Policy ID
   * @returns {Promise<void>}
   */
  remove: async (id) => {
    try {
      if (!id) throw new Error('Policy ID is required');
      const response = await axiosClient.delete(`${BASE_URL}/${id}`);
      return unwrap(response);
    } catch (error) {
      console.error(`[insurancePoliciesService.remove] Error deleting policy ${id}:`, error?.message || error);
      throw error;
    }
  },

  /**
   * Get insurance policies count
   * Endpoint: GET /api/insurance-policies/count
   * @returns {Promise<number>} Total count
   */
  count: async () => {
    try {
      const response = await axiosClient.get(`${BASE_URL}/count`);
      return unwrap(response);
    } catch (error) {
      console.error('[insurancePoliciesService.count] Error:', error?.message || error);
      throw error;
    }
  },

  // ==================== Benefit Package Methods ====================

  /**
   * Get benefit packages for a policy
   * Endpoint: GET /api/insurance-policies/{policyId}/packages
   * @param {number} policyId - Policy ID
   * @returns {Promise<Array>} List of benefit packages
   */
  getBenefitPackages: async (policyId) => {
    try {
      if (!policyId) throw new Error('Policy ID is required');
      const response = await axiosClient.get(`${BASE_URL}/${policyId}/packages`);
      const data = unwrap(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`[insurancePoliciesService.getBenefitPackages] Error for policy ${policyId}:`, error?.message || error);
      throw error;
    }
  },

  /**
   * Create benefit package for a policy
   * Endpoint: POST /api/insurance-policies/{policyId}/packages
   * @param {number} policyId - Policy ID
   * @param {Object} data - Benefit package data
   * @returns {Promise<Object>} Created benefit package
   */
  createBenefitPackage: async (policyId, data) => {
    try {
      if (!policyId) throw new Error('Policy ID is required');
      if (!data) throw new Error('Benefit package data is required');
      const response = await axiosClient.post(`${BASE_URL}/${policyId}/packages`, data);
      return unwrap(response);
    } catch (error) {
      console.error(`[insurancePoliciesService.createBenefitPackage] Error for policy ${policyId}:`, error?.message || error);
      throw error;
    }
  },

  /**
   * Update benefit package
   * Endpoint: PUT /api/insurance-policies/packages/{id}
   * @param {number} id - Benefit package ID
   * @param {Object} data - Updated benefit package data
   * @returns {Promise<Object>} Updated benefit package
   */
  updateBenefitPackage: async (id, data) => {
    try {
      if (!id) throw new Error('Benefit package ID is required');
      if (!data) throw new Error('Benefit package data is required');
      const response = await axiosClient.put(`${BASE_URL}/packages/${id}`, data);
      return unwrap(response);
    } catch (error) {
      console.error(`[insurancePoliciesService.updateBenefitPackage] Error updating package ${id}:`, error?.message || error);
      throw error;
    }
  },

  /**
   * Delete benefit package
   * Endpoint: DELETE /api/insurance-policies/packages/{id}
   * @param {number} id - Benefit package ID
   * @returns {Promise<void>}
   */
  removeBenefitPackage: async (id) => {
    try {
      if (!id) throw new Error('Benefit package ID is required');
      const response = await axiosClient.delete(`${BASE_URL}/packages/${id}`);
      return unwrap(response);
    } catch (error) {
      console.error(`[insurancePoliciesService.removeBenefitPackage] Error deleting package ${id}:`, error?.message || error);
      throw error;
    }
  }
};

// Named exports for tree-shaking
export const {
  getAll,
  getById,
  create,
  update,
  remove,
  count,
  getBenefitPackages,
  createBenefitPackage,
  updateBenefitPackage,
  removeBenefitPackage
} = insurancePoliciesService;

// Default export for convenience
export default insurancePoliciesService;
