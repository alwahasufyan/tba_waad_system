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
  Assignment as AssignmentIcon,
  BusinessCenter as BusinessCenterIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Gavel as GavelIcon,
  CardGiftcard as CardGiftcardIcon
} from '@mui/icons-material';

// ==============================|| RBAC MENU FILTERING ||============================== //

/**
 * Filter menu items based on user roles (RBAC)
 * Enterprise Closed System - Al-Waha Insurance Only
 * @param {Array} menuItems - Full menu structure
 * @param {Array} userRoles - User's assigned roles
 * @returns {Array} Filtered menu items
 */
export const filterMenuByRoles = (menuItems, userRoles = []) => {
  // ADMIN sees everything
  if (userRoles.includes('SUPER_ADMIN') || userRoles.includes('ADMIN')) {
    return menuItems;
  }

  const roleRules = {
    EMPLOYER: {
      hide: ['employers', 'providers', 'provider-contracts', 'policies', 'audit'],
      show: ['dashboard', 'members', 'claims', 'visits', 'pre-approvals', 'medical-categories', 'medical-services', 'medical-packages', 'benefit-packages', 'settings']
    },
    INSURANCE_COMPANY: {
      hide: ['employers'],
      show: ['dashboard', 'members', 'providers', 'claims', 'visits', 'pre-approvals', 'medical-categories', 'medical-services', 'medical-packages', 'benefit-packages', 'provider-contracts', 'policies', 'audit', 'settings']
    },
    REVIEWER: {
      hide: ['employers', 'providers', 'members', 'visits', 'provider-contracts', 'policies'],
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
    title: 'الرئيسية',
    type: 'group',
    children: [
      {
        id: 'dashboard',
        title: 'لوحة التحكم',
        type: 'item',
        url: '/dashboard',
        icon: DashboardIcon,
        breadcrumbs: false,
        search: 'dashboard home main لوحة التحكم الرئيسية'
      }
    ]
  },
  {
    id: 'group-management',
    title: 'إدارة البيانات',
    type: 'group',
    children: [
      {
        id: 'members',
        title: 'الأعضاء',
        type: 'item',
        url: '/members',
        icon: PeopleAltIcon,
        breadcrumbs: true,
        search: 'members patients insurance holders beneficiaries الأعضاء المشتركين'
      },
      {
        id: 'employers',
        title: 'جهات العمل',
        type: 'item',
        url: '/employers',
        icon: BusinessIcon,
        breadcrumbs: true,
        search: 'employers companies organizations clients جهات العمل الشركات'
      },
      {
        id: 'providers',
        title: 'مقدمي الخدمة',
        type: 'item',
        url: '/providers',
        icon: LocalHospitalIcon,
        breadcrumbs: true,
        search: 'providers hospitals clinics healthcare facilities مقدمي الخدمة المستشفيات'
      }
    ]
  },
  {
    id: 'group-claims',
    title: 'المطالبات والخدمات',
    type: 'group',
    children: [
      {
        id: 'claims',
        title: 'المطالبات',
        type: 'item',
        url: '/claims',
        icon: ReceiptIcon,
        breadcrumbs: true,
        search: 'claims requests reimbursement billing المطالبات الفواتير'
      },
      {
        id: 'visits',
        title: 'الزيارات',
        type: 'item',
        url: '/visits',
        icon: AssignmentIcon,
        breadcrumbs: true,
        search: 'visits appointments consultations الزيارات المواعيد'
      },
      {
        id: 'pre-approvals',
        title: 'الموافقات المسبقة',
        type: 'item',
        url: '/pre-approvals',
        icon: DescriptionIcon,
        breadcrumbs: true,
        search: 'pre-approvals authorization approval requests الموافقات المسبقة'
      }
    ]
  },
  {
    id: 'group-medical',
    title: 'الإعدادات الطبية',
    type: 'group',
    children: [
      {
        id: 'medical-categories',
        title: 'التصنيفات الطبية',
        type: 'item',
        url: '/medical-categories',
        icon: CategoryIcon,
        breadcrumbs: true,
        search: 'medical categories services types التصنيفات الطبية'
      },
      {
        id: 'medical-services',
        title: 'الخدمات الطبية',
        type: 'item',
        url: '/medical-services',
        icon: MedicalServicesIcon,
        breadcrumbs: true,
        search: 'medical services procedures treatments الخدمات الطبية'
      },
      {
        id: 'medical-packages',
        title: 'الباقات الطبية',
        type: 'item',
        url: '/medical-packages',
        icon: InventoryIcon,
        breadcrumbs: true,
        search: 'medical packages bundles plans الباقات الطبية'
      },
      {
        id: 'benefit-packages',
        title: 'باقات المنافع',
        type: 'item',
        url: '/benefit-packages',
        icon: CardGiftcardIcon,
        breadcrumbs: true,
        search: 'benefit packages insurance coverage plans باقات المنافع التغطية'
      }
    ]
  },
  {
    id: 'group-contracts',
    title: 'العقود والوثائق',
    type: 'group',
    children: [
      {
        id: 'provider-contracts',
        title: 'عقود مقدمي الخدمة',
        type: 'item',
        url: '/provider-contracts',
        icon: BusinessCenterIcon,
        breadcrumbs: true,
        search: 'provider contracts agreements partnerships عقود مقدمي الخدمة'
      },
      {
        id: 'policies',
        title: 'وثائق التأمين',
        type: 'item',
        url: '/policies',
        icon: GavelIcon,
        breadcrumbs: true,
        search: 'policies insurance coverage plans وثائق التأمين البوالص'
      }
    ]
  },
  {
    id: 'group-settings',
    title: 'الإعدادات',
    type: 'group',
    children: [
      {
        id: 'settings',
        title: 'إعدادات النظام',
        type: 'item',
        url: '/settings',
        icon: SettingsIcon,
        breadcrumbs: true,
        search: 'settings configuration system إعدادات النظام'
      },
      {
        id: 'audit',
        title: 'سجل المراجعة',
        type: 'item',
        url: '/audit',
        icon: AssessmentIcon,
        breadcrumbs: true,
        search: 'audit log history سجل المراجعة'
      }
    ]
  }
];

export default menuItem;
