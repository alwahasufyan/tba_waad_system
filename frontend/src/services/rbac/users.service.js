/**
 * RBAC Users Service
 * Responsible for: User entity CRUD operations
 * Backend: UserController (/api/admin/users)
 * 
 * This service handles ONLY user entity operations.
 * For user account management (status, password, roles), use userManagement.service.js
 */

import axiosServices from '../../utils/axios';

const BASE_URL = '/admin/users';

export const usersService = {
  /**
   * Get all users (list)
   * GET /api/admin/users
   */
  getAllUsers: () => {
    return axiosServices.get(BASE_URL);
  },

  /**
   * Get user by ID
   * GET /api/admin/users/{id}
   */
  getUserById: (id) => {
    return axiosServices.get(`${BASE_URL}/${id}`);
  },

  /**
   * Create new user
   * POST /api/admin/users
   */
  createUser: (userData) => {
    return axiosServices.post(BASE_URL, userData);
  },

  /**
   * Update user
   * PUT /api/admin/users/{id}
   */
  updateUser: (id, userData) => {
    return axiosServices.put(`${BASE_URL}/${id}`, userData);
  },

  /**
   * Delete user
   * DELETE /api/admin/users/{id}
   */
  deleteUser: (id) => {
    return axiosServices.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Search users
   * GET /api/admin/users/search?query={query}
   */
  searchUsers: (query) => {
    return axiosServices.get(`${BASE_URL}/search`, {
      params: { query }
    });
  },

  /**
   * Get users paginated
   * GET /api/admin/users/paginate?page={page}&size={size}
   */
  getUsersPaginated: (page = 0, size = 10) => {
    return axiosServices.get(`${BASE_URL}/paginate`, {
      params: { page, size }
    });
  }
};

export default usersService;
