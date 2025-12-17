/**
 * RBAC Roles Service
 * Responsible for: Role entity CRUD operations
 * Backend: RoleController (/api/admin/roles)
 * 
 * This service handles ONLY role entity operations.
 * For role-user/role-permission relationships, use roleManagement.service.js
 */

import axiosServices from '../../utils/axios';

const BASE_URL = '/admin/roles';

export const rolesService = {
  /**
   * Get all roles (list)
   * GET /api/admin/roles
   */
  getAllRoles: () => {
    return axiosServices.get(BASE_URL);
  },

  /**
   * Get role by ID
   * GET /api/admin/roles/{id}
   */
  getRoleById: (id) => {
    return axiosServices.get(`${BASE_URL}/${id}`);
  },

  /**
   * Create new role
   * POST /api/admin/roles
   */
  createRole: (roleData) => {
    return axiosServices.post(BASE_URL, roleData);
  },

  /**
   * Update role
   * PUT /api/admin/roles/{id}
   */
  updateRole: (id, roleData) => {
    return axiosServices.put(`${BASE_URL}/${id}`, roleData);
  },

  /**
   * Delete role
   * DELETE /api/admin/roles/{id}
   */
  deleteRole: (id) => {
    return axiosServices.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Search roles
   * GET /api/admin/roles/search?query={query}
   */
  searchRoles: (query) => {
    return axiosServices.get(`${BASE_URL}/search`, {
      params: { query }
    });
  },

  /**
   * Get roles paginated
   * GET /api/admin/roles/paginate?page={page}&size={size}
   */
  getRolesPaginated: (page = 0, size = 10) => {
    return axiosServices.get(`${BASE_URL}/paginate`, {
      params: { page, size }
    });
  },

  /**
   * Assign permissions to role (RBAC operation)
   * POST /api/admin/roles/{id}/assign-permissions
   */
  assignPermissions: (id, permissionIds) => {
    return axiosServices.post(`${BASE_URL}/${id}/assign-permissions`, {
      permissionIds
    });
  },

  /**
   * Remove permissions from role (RBAC operation)
   * POST /api/admin/roles/{id}/remove-permissions
   */
  removePermissions: (id, permissionIds) => {
    return axiosServices.post(`${BASE_URL}/${id}/remove-permissions`, {
      permissionIds
    });
  }
};

export default rolesService;
