import axios from 'axios';
import { useRBACStore } from 'api/rbac';

// ==============================|| AXIOS CLIENT - FIXED ||============================== //

/**
 * CRITICAL FIXES:
 * 1. Force baseURL to http://localhost:8080/api
 * 2. Always attach Authorization header
 * 3. Proper employer header logic
 * 4. Enhanced error logging
 * 5. RBAC store cleanup on 401
 * 6. URL normalization to prevent /api/api duplication
 */

// Normalize base URL - ensure it ends with /api but not /api/api
const normalizeBaseUrl = (url) => {
  if (!url) return 'http://localhost:8080/api';
  // Remove trailing slash
  url = url.replace(/\/+$/, '');
  // If URL ends with /api/api, fix it
  if (url.endsWith('/api/api')) {
    url = url.replace(/\/api\/api$/, '/api');
  }
  // If URL doesn't end with /api, add it
  if (!url.endsWith('/api')) {
    url = url + '/api';
  }
  return url;
};

const axiosServices = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  // Phase C: Enable cookie-based auth (HttpOnly JSESSIONID)
  withCredentials: true
});

// ==============================|| REQUEST INTERCEPTOR - SIMPLIFIED ||============================== //

axiosServices.interceptors.request.use(
  (config) => {
    // Normalize URL to prevent /api/api duplication
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api\//, '/');
      console.warn('⚠️ Normalized URL: removed duplicate /api/ prefix');
    }

    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);

    // Session-based auth: JSESSIONID cookie sent automatically via withCredentials: true
    // CSRF disabled in backend for REST API (CORS provides protection)
    // No need to handle CSRF tokens manually

    // NOTE: X-Employer-ID header REMOVED
    // Employers are not auto-loaded or used for filtering
    // All data access is based on user authentication only

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ==============================|| RESPONSE INTERCEPTOR - SIMPLIFIED ||============================== //

axiosServices.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} [${response.status}]`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();
    const errorData = error.response?.data;

    console.error(`❌ API Error: ${method} ${url} [${status}]`, errorData);

    // SIMPLIFIED: NO redirects in axios
    // Let router handle navigation
    // Just clear RBAC store on 401
    if (status === 401) {
      console.warn('🚫 401 Unauthorized - Session expired');

      // Clear RBAC store only (no redirect)
      useRBACStore.getState().clear();
    }

    // ==========================================
    // ENHANCED 403 HANDLING  
    // ==========================================
    if (status === 403) {
      console.error('🚫 403 Forbidden - Access denied');

      // Extract user-friendly message from backend response
      const backendMessage = errorData?.message || errorData?.error || 'Access denied';

      // Dispatch custom event for UI components to handle
      window.dispatchEvent(new CustomEvent('api:forbidden', {
        detail: {
          url,
          method,
          message: backendMessage,
          resource: url?.split('/').filter(Boolean)[0] || 'resource'
        }
      }));

      // Enhance error object with user-friendly message
      error.userMessage = `ليس لديك صلاحية لتنفيذ هذا الإجراء. الرجاء التواصل مع المسؤول.`;
      error.technicalMessage = backendMessage;
    }

    if (status === 500) {
      console.error('🔥 500 Server Error');
      error.userMessage = 'حدث خطأ في الخادم. الرجاء المحاولة لاحقاً.';
    }

    return Promise.reject(error);
  }
);

// ==============================|| LEGACY FETCHERS (for backward compatibility) ||============================== //

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  const res = await axiosServices.get(url, { ...config });
  return res.data;
};

export const fetcherPost = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  const res = await axiosServices.post(url, { ...config });
  return res.data;
};

export default axiosServices;
