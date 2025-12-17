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
 */

const axiosServices = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  // Phase C: Enable cookie-based auth (HttpOnly JSESSIONID)
  withCredentials: true
});

// ==============================|| REQUEST INTERCEPTOR - FIXED ||============================== //

axiosServices.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);

    // AUDIT FIX (TASK B): JWT removed from web frontend
    // Web uses session-based auth ONLY (JSESSIONID cookie sent automatically via withCredentials)
    // JWT auth kept in backend for future mobile app support
    // Mobile will use different endpoints or client identification

    // AUDIT FIX: CSRF Token Protection (Defense-in-Depth)
    // Read XSRF-TOKEN cookie and send as X-XSRF-TOKEN header for mutating requests
    // Only needed for POST/PUT/PATCH/DELETE (GET/HEAD/OPTIONS are CSRF-safe)
    const method = config.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
      
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
        console.log('🛡️ CSRF token attached');
      } else {
        console.warn('⚠️ No CSRF token found - request may be rejected');
      }
    }

    // FIX #2: Add Employer ID header with proper logic
    // - If user has EMPLOYER role => locked to their employerId
    // - Else (TBA staff) => use selectedEmployerId from switcher
    const { employerId, roles, user } = useRBACStore.getState();
    
    if (employerId) {
      config.headers['X-Employer-ID'] = employerId.toString();
      console.log('✅ X-Employer-ID header:', employerId);
    } else if (roles?.includes('EMPLOYER') && user?.employerId) {
      // Fallback: if RBAC store not initialized but user data exists
      config.headers['X-Employer-ID'] = user.employerId.toString();
      console.log('✅ X-Employer-ID header (fallback):', user.employerId);
    }

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
    
    console.error(`❌ API Error: ${method} ${url} [${status}]`, error.response?.data);

    // SIMPLIFIED: NO redirects in axios
    // Let router handle navigation
    // Just clear RBAC store on 401
    if (status === 401) {
      console.warn('🚫 401 Unauthorized - Session expired');
      
      // Clear RBAC store only (no redirect)
      useRBACStore.getState().clear();
    }

    if (status === 403) {
      console.error('🚫 403 Forbidden - Access denied');
    }

    if (status === 500) {
      console.error('🔥 500 Server Error');
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
