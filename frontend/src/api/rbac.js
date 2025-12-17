import { create } from 'zustand';

// ==============================|| RBAC STORE - ROLE-BASED ACCESS CONTROL ||============================== //

/**
 * Zustand store for RBAC (Role-Based Access Control) and Employer Context
 * This store manages:
 * - User roles and permissions
 * - Current employer context (multi-employer switching)
 * - User information
 * - Access control for routes and menu items
 */

const STORAGE_KEYS = {
  ROLES: 'userRoles',
  USER: 'userData',
  EMPLOYER_ID: 'selectedEmployerId',
  TOKEN: 'serviceToken',
  PERMISSIONS: 'userPermissions'
};

export const useRBACStore = create((set, get) => ({
  // State
  roles: [],
  permissions: [],
  employerId: null,
  user: null,
  isInitialized: false,

  // Actions
  setRoles: (roles) => {
    set({ roles });
    if (roles && roles.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
    }
  },

  setUser: (user) => {
    set({ user });
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  },

  setEmployerId: (employerId) => {
    const { user, roles } = get();

    // EMPLOYER role cannot switch companies - locked to their own employerId
    if (roles.includes('EMPLOYER') && user?.employerId) {
      console.warn('EMPLOYER role cannot switch companies. Using locked employerId:', user.employerId);
      set({ employerId: user.employerId });
      localStorage.setItem(STORAGE_KEYS.EMPLOYER_ID, user.employerId.toString());
      return;
    }

    // For other roles, allow switching
    set({ employerId });
    if (employerId) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYER_ID, employerId.toString());
    } else {
      localStorage.removeItem(STORAGE_KEYS.EMPLOYER_ID);
    }
  },

  setPermissions: (permissions) => {
    set({ permissions });
    if (permissions) {
      localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissions));
    }
  },

  /**
   * Initialize RBAC state from backend user data or localStorage
   * Called after login or on app startup
   * @param {Object} userData - User data from backend (optional)
   */
  initialize: (userData = null) => {
    try {
      let roles = [];
      let user = null;
      let employerId = null;
      let permissions = [];

      if (userData) {
        // Initialize from backend response (login)
        roles = userData.roles || [];
        user = userData;
        permissions = userData.permissions || [];

        // Save to localStorage
        localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissions));

        // Set employer context
        if (roles.includes('EMPLOYER') && user.employerId) {
          // EMPLOYER role locked to their company
          employerId = user.employerId;
        } else {
          // Other roles: try to restore from localStorage
          const storedEmployerId = localStorage.getItem(STORAGE_KEYS.EMPLOYER_ID);
          employerId = storedEmployerId ? parseInt(storedEmployerId, 10) : null;
        }

        if (employerId) {
          localStorage.setItem(STORAGE_KEYS.EMPLOYER_ID, employerId.toString());
        }
      } else {
        // Initialize from localStorage (page refresh)
        const rolesStr = localStorage.getItem(STORAGE_KEYS.ROLES);
        roles = rolesStr ? JSON.parse(rolesStr) : [];

        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        user = userStr ? JSON.parse(userStr) : null;

        const employerIdStr = localStorage.getItem(STORAGE_KEYS.EMPLOYER_ID);
        employerId = employerIdStr ? parseInt(employerIdStr, 10) : null;

        const permissionsStr = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
        permissions = permissionsStr ? JSON.parse(permissionsStr) : [];

        // EMPLOYER role MUST use their own employerId (locked)
        if (roles.includes('EMPLOYER') && user?.employerId) {
          employerId = user.employerId;
          localStorage.setItem(STORAGE_KEYS.EMPLOYER_ID, user.employerId.toString());
        }
      }

      set({
        roles,
        permissions,
        user,
        employerId,
        isInitialized: true
      });

      console.log('🔒 RBAC Initialized:', { roles, employerId, user: user?.username || user?.name });
    } catch (error) {
      console.error('Failed to initialize RBAC:', error);
      set({ isInitialized: true });
    }
  },

  /**
   * Clear RBAC state (on logout)
   */
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.ROLES);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.EMPLOYER_ID);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);

    set({
      roles: [],
      permissions: [],
      employerId: null,
      user: null,
      isInitialized: false
    });
  },

  /**
   * Check if user has SUPER_ADMIN role (bypass all checks)
   * @returns {boolean}
   */
  isSuperAdmin: () => {
    const { roles } = get();
    return roles.includes('SUPER_ADMIN');
  },

  /**
   * Get user's primary role (simplified - each user has ONE role)
   * @returns {string|null}
   */
  getPrimaryRole: () => {
    const { roles } = get();
    return roles.length > 0 ? roles[0] : null;
  },

  /**
   * Check if user's role matches one of the allowed roles (simplified)
   * @param {string[]} allowedRoles - Array of allowed role names
   * @returns {boolean}
   */
  hasRole: (allowedRoles) => {
    const { roles } = get();
    const primaryRole = roles[0];

    // SUPER_ADMIN bypasses all checks
    if (primaryRole === 'SUPER_ADMIN') return true;

    // If no specific roles required, authenticated is enough
    if (!allowedRoles || allowedRoles.length === 0) return true;

    // Simple check: is primary role in allowed list?
    return allowedRoles.includes(primaryRole);
  },

  /**
   * Check if user is EMPLOYER role (locked to their company)
   * @returns {boolean}
   */
  isEmployerRole: () => {
    const { roles } = get();
    return roles[0] === 'EMPLOYER';
  },

  /**
   * Check if employer switcher should be visible
   * EMPLOYER role cannot switch companies
   * @returns {boolean}
   */
  canSwitchEmployer: () => {
    const { roles } = get();
    return roles[0] !== 'EMPLOYER';
  }
}));

// ==============================|| EXPORTED HOOKS - SIMPLIFIED ||============================== //

/**
 * Hook to get user's primary role (simplified - each user has ONE role)
 * @returns {string|null}
 */
export const useRole = () => {
  const roles = useRBACStore((state) => state.roles);
  return roles.length > 0 ? roles[0] : null;
};

/**
 * Hook to get all user roles (for compatibility, but users should have ONE role)
 * @returns {string[]}
 */
export const useRoles = () => {
  return useRBACStore((state) => state.roles);
};

/**
 * Hook to get employer context (current selected employer)
 * @returns {{ employerId: number|null, setEmployerId: function, canSwitch: boolean }}
 */
export const useEmployerContext = () => {
  const employerId = useRBACStore((state) => state.employerId);
  const setEmployerId = useRBACStore((state) => state.setEmployerId);
  const canSwitchEmployer = useRBACStore((state) => state.canSwitchEmployer);

  return {
    employerId,
    setEmployerId,
    canSwitch: canSwitchEmployer()
  };
};

/**
 * Hook to get current user data
 * @returns {Object|null}
 */
export const useUser = () => {
  return useRBACStore((state) => state.user);
};

/**
 * Hook to get simplified RBAC state (no complex permission logic)
 * @returns {Object}
 */
export const useRBAC = () => {
  const roles = useRBACStore((state) => state.roles);
  const employerId = useRBACStore((state) => state.employerId);
  const user = useRBACStore((state) => state.user);
  const isInitialized = useRBACStore((state) => state.isInitialized);
  const hasRole = useRBACStore((state) => state.hasRole);
  const getPrimaryRole = useRBACStore((state) => state.getPrimaryRole);
  const isSuperAdmin = useRBACStore((state) => state.isSuperAdmin);
  const isEmployerRole = useRBACStore((state) => state.isEmployerRole);
  const canSwitchEmployer = useRBACStore((state) => state.canSwitchEmployer);
  const permissions = useRBACStore((state) => state.permissions);

  return {
    roles,
    permissions,
    primaryRole: getPrimaryRole(),
    employerId,
    user,
    isInitialized,
    hasRole,
    isSuperAdmin: isSuperAdmin(),
    isEmployerRole: isEmployerRole(),
    canSwitch: canSwitchEmployer()
  };
};

export default useRBACStore;
