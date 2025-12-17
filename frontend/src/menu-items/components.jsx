// material-ui icons
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  LocalHospital as LocalHospitalIcon,
  Receipt as ReceiptIcon,
  Description as DescriptionIcon,
  PeopleAlt as PeopleAltIcon,
  MedicalServices as MedicalServicesIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Assignment as AssignmentIcon,
  BusinessCenter as BusinessCenterIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  Badge as BadgeIcon,
  Gavel as GavelIcon,
  CardGiftcard as CardGiftcardIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';

// ==============================|| RBAC MENU FILTERING ||============================== //

/**
 * Filter menu items based on user roles (RBAC)
 * @param {Array} menuItems - Full menu structure
 * @param {Array} userRoles - User's assigned roles
 * @returns {Array} Filtered menu items
 */
export const filterMenuByRoles = (menuItems, userRoles = []) => {
  // ADMIN sees everything
  if (userRoles.includes('ADMIN')) {
    return menuItems;
  }

  const roleRules = {
    EMPLOYER: {
      hide: ['employers', 'insurance-companies', 'providers', 'provider-contracts', 'policies', 'users', 'roles', 'companies', 'audit'],
      show: ['dashboard', 'members', 'claims', 'visits', 'pre-approvals', 'medical-categories', 'medical-services', 'medical-packages', 'benefit-packages', 'settings']
    },
    INSURANCE_COMPANY: {
      hide: ['employers', 'users', 'roles', 'companies'],
      show: ['dashboard', 'members', 'providers', 'insurance-companies', 'claims', 'visits', 'pre-approvals', 'medical-categories', 'medical-services', 'medical-packages', 'benefit-packages', 'provider-contracts', 'policies', 'audit', 'settings']
    },
    REVIEWER: {
      hide: ['employers', 'insurance-companies', 'providers', 'members', 'visits', 'provider-contracts', 'policies', 'users', 'roles', 'companies'],
      show: ['dashboard', 'claims', 'pre-approvals', 'medical-categories', 'medical-services', 'medical-packages', 'benefit-packages', 'audit', 'settings']
    }
  };

  // Get hide rules for all user roles
  const hideItems = new Set();
  userRoles.forEach(role => {
    if (roleRules[role]) {
      roleRules[role].hide.forEach(item => hideItems.add(item));
    }
  });

  // Filter menu items recursively
  const filterItems = (items) => {
    return items
      .map(item => {
        // If item has children, filter them recursively
        if (item.children) {
          const filteredChildren = filterItems(item.children);
          // Only include group if it has visible children
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }
          return null;
        }

        // Hide item if it's in the hide list
        if (hideItems.has(item.id)) {
          return null;
        }

        return item;
      })
      .filter(Boolean); // Remove null items
  };

  return filterItems(menuItems);
};

// ==============================|| MENU ITEMS ||============================== //

const menuItem = [
  {
    id: 'group-main',
    title: 'Main',
    type: 'group',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        url: '/dashboard',
        icon: DashboardIcon,
        breadcrumbs: false,
        search: 'dashboard home main'
      }
    ]
  },
  {
    id: 'group-management',
    title: 'Management',
    type: 'group',
    children: [
      {
        id: 'members',
        title: 'Members',
        type: 'item',
        url: '/members',
        icon: PeopleAltIcon,
        breadcrumbs: true,
        search: 'members patients insurance holders beneficiaries'
      },
      {
        id: 'employers',
        title: 'Employers',
        type: 'item',
        url: '/employers',
        icon: BusinessIcon,
        breadcrumbs: true,
        search: 'employers companies organizations clients'
      },
      {
        id: 'providers',
        title: 'Providers',
        type: 'item',
        url: '/providers',
        icon: LocalHospitalIcon,
        breadcrumbs: true,
        search: 'providers hospitals clinics healthcare facilities'
      },
      {
        id: 'insurance-companies',
        title: 'Insurance Companies',
        type: 'item',
        url: '/insurance-companies',
        icon: HealthAndSafetyIcon,
        breadcrumbs: true,
        search: 'insurance companies payers'
      }
    ]
  },
  {
    id: 'group-claims',
    title: 'Claims & Services',
    type: 'group',
    children: [
      {
        id: 'claims',
        title: 'Claims',
        type: 'item',
        url: '/claims',
        icon: ReceiptIcon,
        breadcrumbs: true,
        search: 'claims requests reimbursement billing'
      },
      {
        id: 'visits',
        title: 'Visits',
        type: 'item',
        url: '/visits',
        icon: AssignmentIcon,
        breadcrumbs: true,
        search: 'visits appointments consultations'
      },
      {
        id: 'pre-approvals',
        title: 'Pre-Approvals',
        type: 'item',
        url: '/pre-approvals',
        icon: DescriptionIcon,
        breadcrumbs: true,
        search: 'pre-approvals authorization approval requests'
      }
    ]
  },
  {
    id: 'group-medical',
    title: 'Medical Setup',
    type: 'group',
    children: [
      {
        id: 'medical-categories',
        title: 'Medical Categories',
        type: 'item',
        url: '/medical-categories',
        icon: CategoryIcon,
        breadcrumbs: true,
        search: 'medical categories services types'
      },
      {
        id: 'medical-services',
        title: 'Medical Services',
        type: 'item',
        url: '/medical-services',
        icon: MedicalServicesIcon,
        breadcrumbs: true,
        search: 'medical services procedures treatments'
      },
      {
        id: 'medical-packages',
        title: 'Medical Packages',
        type: 'item',
        url: '/medical-packages',
        icon: InventoryIcon,
        breadcrumbs: true,
        search: 'medical packages bundles plans'
      },
      {
        id: 'benefit-packages',
        title: 'Benefit Packages',
        type: 'item',
        url: '/benefit-packages',
        icon: CardGiftcardIcon,
        breadcrumbs: true,
        search: 'benefit packages insurance coverage plans'
      },
      {
        id: 'visits',
        title: 'Visits',
        type: 'item',
        url: '/visits',
        icon: EventNoteIcon,
        breadcrumbs: true,
        search: 'visits appointments patient records'
      }
    ]
  },
  {
    id: 'group-contracts',
    title: 'Contracts & Policies',
    type: 'group',
    children: [
      {
        id: 'provider-contracts',
        title: 'Provider Contracts',
        type: 'item',
        url: '/provider-contracts',
        icon: BusinessCenterIcon,
        breadcrumbs: true,
        search: 'provider contracts agreements partnerships'
      },
      {
        id: 'policies',
        title: 'Insurance Policies',
        type: 'item',
        url: '/policies',
        icon: GavelIcon,
        breadcrumbs: true,
        search: 'policies insurance coverage plans'
      }
    ]
  },
  {
    id: 'group-admin',
    title: 'Administration',
    type: 'group',
    children: [
      {
        id: 'users',
        title: 'Users',
        type: 'item',
        url: '/admin/users',
        icon: GroupIcon,
        breadcrumbs: true,
        search: 'users accounts staff employees'
      },
      {
        id: 'roles',
        title: 'Roles',
        type: 'item',
        url: '/admin/roles',
        icon: BadgeIcon,
        breadcrumbs: true,
        search: 'roles permissions access rights'
      },
      {
        id: 'companies',
        title: 'Companies',
        type: 'item',
        url: '/admin/companies',
        icon: BusinessIcon,
        breadcrumbs: true,
        search: 'companies organizations branches entities'
      },
      {
        id: 'audit',
        title: 'Audit Log',
        type: 'item',
        url: '/audit',
        icon: AssessmentIcon,
        breadcrumbs: true,
        search: 'audit log history tracking changes'
      },
      {
        id: 'settings',
        title: 'Settings',
        type: 'item',
        url: '/settings',
        icon: SettingsIcon,
        breadcrumbs: true,
        search: 'settings configuration preferences options'
      }
    ]
  }
];

export default menuItem;
