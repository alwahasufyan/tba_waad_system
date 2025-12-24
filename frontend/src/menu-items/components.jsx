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
  CardGiftcard as CardGiftcardIcon,
  Inbox as InboxIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Policy as PolicyIcon
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
      hide: ['employers', 'providers', 'provider-contracts', 'policies', 'audit', 'claims-inbox', 'pre-approvals-inbox', 'settlement-inbox'],
      show: ['dashboard', 'members', 'claims', 'visits', 'pre-approvals', 'medical-categories', 'medical-services', 'medical-packages', 'benefit-packages', 'benefit-policies', 'settings']
    },
    INSURANCE_COMPANY: {
      hide: ['employers'],
      show: ['dashboard', 'members', 'providers', 'claims', 'visits', 'pre-approvals', 'medical-categories', 'medical-services', 'medical-packages', 'benefit-packages', 'benefit-policies', 'provider-contracts', 'policies', 'audit', 'settings', 'claims-inbox', 'pre-approvals-inbox', 'settlement-inbox']
    },
    REVIEWER: {
      hide: ['employers', 'providers', 'members', 'visits', 'provider-contracts', 'policies', 'settlement-inbox', 'benefit-policies'],
      show: ['dashboard', 'claims', 'pre-approvals', 'medical-categories', 'medical-services', 'medical-packages', 'benefit-packages', 'audit', 'settings', 'claims-inbox', 'pre-approvals-inbox']
    },
    FINANCE: {
      hide: ['employers', 'providers', 'members', 'visits', 'provider-contracts', 'policies', 'claims-inbox', 'pre-approvals-inbox', 'benefit-policies'],
      show: ['dashboard', 'claims', 'settlement-inbox', 'audit', 'settings']
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


// ========== القائمة الجانبية النهائية حسب متطلبات TPA ========== //
const menuItem = [
  {
    id: 'group-dashboard',
    title: 'لوحة التحكم',
    type: 'group',
    children: [
      {
        id: 'dashboard',
        title: 'لوحة التحكم',
        type: 'item',
        url: '/dashboard',
        icon: DashboardIcon,
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'group-contracts',
    title: 'الجهات والعقود',
    type: 'group',
    children: [
      {
        id: 'employers',
        title: 'جهات العمل',
        type: 'item',
        url: '/employers',
        icon: BusinessIcon
      },
      {
        id: 'insurance-companies',
        title: 'شركات التأمين',
        type: 'item',
        url: '/insurance-companies',
        icon: BusinessIcon
      },
      {
        id: 'benefit-policies',
        title: 'وثائق المنافع',
        type: 'item',
        url: '/benefit-policies',
        icon: PolicyIcon,
        permission: ['benefit_policies.view']
      },
      {
        id: 'provider-contracts',
        title: 'عقود مقدمي الخدمة',
        type: 'item',
        url: '/provider-contracts',
        icon: BusinessCenterIcon
      }
    ]
  },
  {
    id: 'group-medical-network',
    title: 'الشبكة الطبية',
    type: 'group',
    children: [
      {
        id: 'providers',
        title: 'مقدمو الخدمة',
        type: 'item',
        url: '/providers',
        icon: LocalHospitalIcon
      },
      {
        id: 'medical-categories',
        title: 'تصنيفات الخدمات الطبية',
        type: 'item',
        url: '/medical-categories',
        icon: CategoryIcon
      },
      {
        id: 'medical-services',
        title: 'الخدمات الطبية',
        type: 'item',
        url: '/medical-services',
        icon: MedicalServicesIcon
      },
      {
        id: 'medical-packages',
        title: 'حزم الخدمات الطبية',
        type: 'item',
        url: '/medical-packages',
        icon: InventoryIcon
      }
    ]
  },
  {
    id: 'group-members',
    title: 'الأعضاء والمستفيدون',
    type: 'group',
    children: [
      {
        id: 'members',
        title: 'المؤمن عليهم',
        type: 'item',
        url: '/members',
        icon: PeopleAltIcon
      }
      // أفراد العائلة يظهرون داخل صفحة العضو فقط
    ]
  },
  {
    id: 'group-medical-ops',
    title: 'التشغيل الطبي',
    type: 'group',
    children: [
      {
        id: 'pre-approvals',
        title: 'الموافقات المسبقة',
        type: 'item',
        url: '/pre-approvals',
        icon: DescriptionIcon
      },
      {
        id: 'visits',
        title: 'الزيارات الطبية',
        type: 'item',
        url: '/visits',
        icon: LocalHospitalIcon
      },
      {
        id: 'claims',
        title: 'المطالبات',
        type: 'item',
        url: '/claims',
        icon: ReceiptIcon
      }
    ]
  },
  {
    id: 'group-reports',
    title: 'التقارير والتدقيق',
    type: 'group',
    children: [
      {
        id: 'reports',
        title: 'التقارير',
        type: 'item',
        url: '/reports',
        icon: AssessmentIcon
      },
      {
        id: 'audit',
        title: 'سجل التدقيق',
        type: 'item',
        url: '/audit',
        icon: AssessmentIcon
      }
    ]
  },
  {
    id: 'group-admin',
    title: 'إدارة النظام',
    type: 'group',
    children: [
      {
        id: 'admin-users',
        title: 'المستخدمون',
        type: 'item',
        url: '/admin/users',
        icon: PeopleAltIcon,
        permission: ['admin.users.view']
      },
      {
        id: 'rbac',
        title: 'الصلاحيات',
        type: 'item',
        url: '/rbac',
        icon: AssignmentIcon,
        permission: ['rbac.view']
      },
      {
        id: 'settings',
        title: 'إعدادات النظام',
        type: 'item',
        url: '/settings',
        icon: SettingsIcon,
        permission: ['settings.view']
      }
    ]
  }
];

export default menuItem;
