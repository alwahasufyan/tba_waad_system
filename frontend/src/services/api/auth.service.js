/**
 * Session-Based Authentication Service
 * Phase C - Migration from JWT to Session Auth
 * 
 * This service handles authentication using HttpOnly cookies (JSESSIONID)
 * instead of storing JWT tokens in localStorage.
 * 
 * Key differences from JWT approach:
 * - NO token storage in localStorage/sessionStorage
 * - Relies on browser's automatic cookie handling
 * - Session managed by backend (Spring HTTP Session)
 * - More secure against XSS attacks
 */

import apiClient from './axiosClient';

/**
 * Login with username/password
 * Creates HTTP session, returns user info
 * NO token in response - browser automatically stores JSESSIONID cookie
 */
export const login = async (credentials) => {
  const userInfo = await apiClient.post('/auth/session/login', credentials);
  return { status: 'success', data: userInfo };
};

/**
 * Get current authenticated user from session
 * Returns user info if valid session exists
 * Returns { status: 'unauthenticated' } if no session (does NOT throw on 401)
 */
export const me = async () => {
  try {
    const userInfo = await apiClient.get('/auth/session/me');
    return { status: 'success', data: userInfo };
  } catch (error) {
    // Expected 401 when no session - return safe response instead of throwing
    if (error.response?.status === 401) {
      return { status: 'unauthenticated', data: null };
    }
    // Re-throw other errors (network, 500, etc.)
    throw error;
  }
};

/**
 * Logout - invalidates HTTP session
 * Clears backend session and JSESSIONID cookie
 */
export const logout = async () => {
  const result = await apiClient.post('/auth/session/logout');
  return { status: 'success', data: result };
};

/**
 * Check if user is authenticated
 * Tries to fetch current user - if succeeds, session is valid
 */
export const isAuthenticated = async () => {
  try {
    const response = await me();
    return response.status === 'success';
  } catch (error) {
    return false;
  }
};

// Export as default for backward compatibility
export default {
  login,
  me,
  logout,
  isAuthenticated
};
