/**
 * RBAC Permissions Service
 * Responsible for: Permission entity CRUD operations
 * Backend: PermissionController (/api/admin/permissions)
 * 
 * This service handles ONLY permission entity operations.
 * For permission matrix and role-permission assignments, use permissionMatrix.service.js
 */

import axiosServices from '../../utils/axios';

const BASE_URL = '/admin/permissions';

export const permissionsService = {
  /**
   * Get all permissions (list)
   * GET /api/admin/permissions
   */
  getAllPermissions: () => {
    return axiosServices.get(BASE_URL);
  },

  /**
   * Get permission by ID
   * GET /api/admin/permissions/{id}
   */
  getPermissionById: (id) => {
    return axiosServices.get(`${BASE_URL}/${id}`);
  },

  /**
   * Create new permission
   * POST /api/admin/permissions
   */
  createPermission: (permissionData) => {
    return axiosServices.post(BASE_URL, permissionData);
  },

  /**
   * Update permission
   * PUT /api/admin/permissions/{id}
   */
  updatePermission: (id, permissionData) => {
    return axiosServices.put(`${BASE_URL}/${id}`, permissionData);
  },

  /**
   * Delete permission
   * DELETE /api/admin/permissions/{id}
   */
  deletePermission: (id) => {
    return axiosServices.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Search permissions
   * GET /api/admin/permissions/search?query={query}
   */
  searchPermissions: (query) => {
    return axiosServices.get(`${BASE_URL}/search`, {
      params: { query }
    });
  },

  /**
   * Get permissions paginated
   * GET /api/admin/permissions/paginate?page={page}&size={size}
   */
  getPermissionsPaginated: (page = 0, size = 10) => {
    return axiosServices.get(`${BASE_URL}/paginate`, {
      params: { page, size }
    });
  }
};

export default permissionsService;
