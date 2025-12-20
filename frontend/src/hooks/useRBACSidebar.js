import { useMemo, useState, useEffect } from 'react';
import {
  Dashboard,
  People,
  Business,
  Receipt,
  LocalHospital,
  Settings,
  Security,
  Timeline,
  MedicalServices,
  Category,
  LocalOffer,
  AssignmentInd,
  Description,
  AdminPanelSettings,
  ManageAccounts,
  Shield,
  ViewModule,
  ToggleOn,
  Assignment
} from '@mui/icons-material';
import { useRBAC } from 'api/rbac';
import axios from 'utils/axios';

/**
 * useRBACSidebar Hook
 * Phase B2 - Dynamic Role-Based Sidebar with Feature Toggles
 *
 * Returns sidebar menu items based on:
 * 1. User role (SUPER_ADMIN, INSURANCE_ADMIN, EMPLOYER_ADMIN, PROVIDER, USER)
 * 2. RBAC permissions
 * 3. Feature toggles (for EMPLOYER_ADMIN only from backend Phase 9)
 */
const useRBACSidebar = () => {
  const { user, roles, permissions, hasRole } = useRBAC();
  const [featureToggles, setFeatureToggles] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch feature toggles for EMPLOYER_ADMIN
  useEffect(() => {
    const fetchFeatureToggles = async () => {
      // Only fetch for EMPLOYER_ADMIN
      if (!hasRole('EMPLOYER_ADMIN')) {
        setLoading(false);
        return;
      }

      const employerId = user?.employerId;
      if (!employerId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/company-settings/employer/${employerId}`);
        if (response.data && response.data.data) {
          setFeatureToggles(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch feature toggles:', error);
        // Default to all features disabled on error
        setFeatureToggles({
          canViewClaims: false,
          canViewVisits: false,
          canEditMembers: true,
          canDownloadAttachments: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeatureToggles();
  }, [user, hasRole]);

  const sidebarItems = useMemo(() => {
    if (!user || !roles || roles.length === 0) {
      return [];
    }

    // Define all possible menu items - using translation keys from ar.json/en.json
    const allItems = [
      {
        id: 'dashboard',
        label: 'nav.dashboard',
        icon: Dashboard,
        path: '/dashboard',
        roles: ['SUPER_ADMIN', 'INSURANCE_ADMIN'],
        permissions: []
      },
      {
        id: 'members',
        label: 'nav.members',
        icon: People,
        path: '/members',
        roles: ['SUPER_ADMIN', 'INSURANCE_ADMIN', 'EMPLOYER_ADMIN'],
        permissions: ['MANAGE_MEMBERS', 'VIEW_MEMBERS']
      },
      {
        id: 'employers',
        label: 'nav.employers',
        icon: Business,
        path: '/employers',
        roles: ['SUPER_ADMIN', 'INSURANCE_ADMIN'],
        permissions: ['MANAGE_EMPLOYERS', 'VIEW_EMPLOYERS']
      },
      {
        id: 'claims',
        label: 'nav.claims',
        icon: Receipt,
        path: '/claims',
        roles: ['SUPER_ADMIN', 'INSURANCE_ADMIN', 'EMPLOYER_ADMIN', 'PROVIDER'],
        permissions: ['VIEW_CLAIMS', 'MANAGE_CLAIMS'],
        featureToggle: 'canViewClaims' // For EMPLOYER_ADMIN only
      },
      {
        id: 'visits',
        label: 'nav.visits',
        icon: LocalHospital,
        path: '/visits',
        roles: ['SUPER_ADMIN', 'INSURANCE_ADMIN', 'EMPLOYER_ADMIN', 'PROVIDER'],
        permissions: ['VIEW_VISITS', 'MANAGE_VISITS'],
        featureToggle: 'canViewVisits' // For EMPLOYER_ADMIN only
      },
      {
        id: 'medical-services',
        label: 'nav.medical-services',
        icon: MedicalServices,
        path: '/medical-services',
        roles: ['SUPER_ADMIN', 'INSURANCE_ADMIN'],
        permissions: ['MANAGE_MEDICAL_SERVICES']
      },
      {
        id: 'medical-categories',
        label: 'nav.medical-categories',
        icon: Category,
        path: '/medical-categories',
        roles: ['SUPER_ADMIN', 'INSURANCE_ADMIN'],
        permissions: ['MANAGE_MEDICAL_CATEGORIES']
      },
      {
        id: 'medical-packages',
        label: 'nav.medical-packages',
        icon: LocalOffer,
        path: '/medical-packages',
        roles: ['SUPER_ADMIN', 'INSURANCE_ADMIN'],
        permissions: ['MANAGE_MEDICAL_PACKAGES']
      },
      {
        id: 'providers',
        label: 'nav.providers',
        icon: AssignmentInd,
        path: '/providers',
        roles: ['SUPER_ADMIN', 'INSURANCE_ADMIN'],
        permissions: ['MANAGE_PROVIDERS', 'VIEW_PROVIDERS']
      },
      {
        id: 'benefit-packages',
        label: 'nav.benefit-packages',
        icon: LocalOffer,
        path: '/benefit-packages',
        roles: ['SUPER_ADMIN', 'INSURANCE_ADMIN'],
        permissions: ['MANAGE_BENEFIT_PACKAGES']
      },
      {
        id: 'pre-approvals',
        label: 'nav.pre-approvals',
        icon: Assignment,
        path: '/pre-approvals',
        roles: ['SUPER_ADMIN', 'INSURANCE_ADMIN', 'PROVIDER'],
        permissions: ['VIEW_PRE_APPROVALS', 'MANAGE_PRE_APPROVALS']
      },
      {
        id: 'policies',
        label: 'nav.policies',
        icon: Description,
        path: '/policies',
        roles: ['SUPER_ADMIN', 'INSURANCE_ADMIN'],
        permissions: ['MANAGE_POLICIES']
      },
      {
        id: 'companies',
        label: 'nav.insurance-companies',
        icon: Business,
        path: '/insurance-companies',
        roles: ['SUPER_ADMIN'],
        permissions: []
      },
      {
        id: 'rbac',
        label: 'nav.rbac',
        icon: Security,
        path: '/rbac',
        roles: ['SUPER_ADMIN'],
        permissions: []
      },
      {
        id: 'settings',
        label: 'nav.settings',
        icon: Settings,
        path: '/settings',
        roles: ['SUPER_ADMIN', 'INSURANCE_ADMIN'],
        permissions: []
      },
      {
        id: 'audit',
        label: 'nav.audit',
        icon: Timeline,
        path: '/audit',
        roles: ['SUPER_ADMIN', 'INSURANCE_ADMIN'],
        permissions: []
      }
      // ==================== SYSTEM ADMINISTRATION - DISABLED ====================
      // System Admin UI has been removed from frontend
      // {
      //   id: 'system-admin',
      //   label: 'nav.system-admin',
      //   icon: AdminPanelSettings,
      //   path: '/system-admin',
      //   roles: ['SUPER_ADMIN'],
      //   permissions: [],
      //   isGroup: true,
      //   children: [...]
      // }
    ];

    // Filter items based on role, permissions, and feature toggles
    const filteredItems = allItems.filter((item) => {
      // SUPER_ADMIN bypasses ALL checks - sees everything
      if (roles.includes('SUPER_ADMIN')) return true;
      
      // Check role access
      const hasRoleAccess = item.roles.some((role) => roles.includes(role));
      if (!hasRoleAccess) return false;

      // Check permissions (if any permission matches OR no permissions required)
      const hasPermissionAccess = item.permissions.length === 0 || item.permissions.some((perm) => permissions.includes(perm));

      if (!hasPermissionAccess) return false;

      // Special handling for EMPLOYER_ADMIN with feature toggles
      if (hasRole('EMPLOYER_ADMIN') && item.featureToggle) {
        // If still loading feature toggles, hide the item
        if (loading) return false;

        // If feature toggles loaded, check the specific toggle
        if (featureToggles && featureToggles[item.featureToggle] === false) {
          return false;
        }
      }

      return true;
    });

    return filteredItems.map((item) => ({
      id: item.id,
      translationKey: item.label,
      icon: item.icon,
      path: item.path,
      visible: true
    }));
  }, [user, roles, permissions, featureToggles, loading, hasRole]);

  return {
    sidebarItems,
    loading
  };
};

export default useRBACSidebar;
