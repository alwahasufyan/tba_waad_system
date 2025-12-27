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
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Gavel as GavelIcon,
  CardGiftcard as CardGiftcardIcon,
  Inbox as InboxIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Policy as PolicyIcon,
  Handshake as HandshakeIcon,
  ManageAccounts as ManageAccountsIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  FactCheck as FactCheckIcon,
  AssignmentInd as AssignmentIndIcon
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
      hide: ['employers', 'providers', 'provider-contracts', 'policies', 'audit', 'claims-inbox', 'pre-approvals-inbox', 'settlement-inbox', 'admin-users', 'rbac'],
      show: ['dashboard', 'members', 'claims', 'visits', 'pre-approvals', 'medical-categories', 'medical-services', 'medical-packages', 'benefit-policies', 'settings', 'reports', 'employer-dashboard', 'claims-report']
    },
    EMPLOYER_ADMIN: {
      hide: ['employers', 'providers', 'provider-contracts', 'policies', 'claims-inbox', 'pre-approvals-inbox', 'settlement-inbox', 'admin-users', 'rbac'],
      show: ['dashboard', 'members', 'claims', 'visits', 'pre-approvals', 'medical-categories', 'medical-services', 'medical-packages', 'benefit-policies', 'settings', 'reports', 'employer-dashboard', 'claims-report', 'audit']
    },
    INSURANCE_COMPANY: {
      hide: ['employers', 'admin-users', 'rbac'],
      show: ['dashboard', 'members', 'providers', 'claims', 'visits', 'pre-approvals', 'medical-categories', 'medical-services', 'medical-packages', 'benefit-policies', 'provider-contracts', 'audit', 'settings', 'reports', 'employer-dashboard', 'claims-report']
    },
    REVIEWER: {
      hide: ['employers', 'providers', 'members', 'visits', 'provider-contracts', 'policies', 'settlement-inbox', 'benefit-policies', 'admin-users', 'rbac'],
      show: ['dashboard', 'claims', 'pre-approvals', 'medical-categories', 'medical-services', 'medical-packages', 'audit', 'settings', 'reports', 'claims-report']
    },
    FINANCE: {
      hide: ['employers', 'providers', 'members', 'visits', 'provider-contracts', 'policies', 'claims-inbox', 'pre-approvals-inbox', 'benefit-policies', 'admin-users', 'rbac'],
      show: ['dashboard', 'claims', 'settlement-inbox', 'audit', 'settings', 'reports']
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

/**
 * ====================================================
 * القائمة الجانبية النهائية - نظام TPA المؤسسي
 * FINAL SIDEBAR MENU - TPA Enterprise Standard
 * ====================================================
 * 
 * هيكل القائمة المُعاد تنظيمه وفقاً لسير العمل المؤسسي:
 * 
 * 1️⃣ لوحة التحكم (Dashboard)
 * 2️⃣ الجهات والعقود (Entities & Contracts)
 * 3️⃣ الشبكة الطبية (Medical Network)
 * 4️⃣ الأعضاء والمستفيدون (Members & Beneficiaries)
 * 5️⃣ التشغيل الطبي (Medical Operations)
 * 6️⃣ التقارير والتدقيق (Reports & Audit)
 * 7️⃣ إدارة النظام (System Administration)
 * 
 * ⚠️ ملاحظات مهمة:
 * - جميع المسارات (routes) موجودة ولم يتم تغييرها
 * - تمت إزالة benefit-packages (قديم/مكرر مع benefit-policies)
 * - أفراد العائلة يظهرون داخل صفحة العضو فقط
 */
const menuItem = [
  // ==========================================
  // 1️⃣ لوحة التحكم (Dashboard)
  // ==========================================
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

  // ==========================================
  // 2️⃣ الجهات والعقود (Entities & Contracts)
  // ==========================================
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
        icon: HandshakeIcon
      }
    ]
  },

  // ==========================================
  // 3️⃣ الشبكة الطبية (Medical Network)
  // ==========================================
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

  // ==========================================
  // 4️⃣ الأعضاء والمستفيدون (Members & Beneficiaries)
  // ==========================================
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
      // أفراد العائلة يظهرون داخل صفحة العضو فقط - لا حاجة لعنصر قائمة منفصل
    ]
  },

  // ==========================================
  // 5️⃣ التشغيل الطبي (Medical Operations)
  // ==========================================
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
        icon: FactCheckIcon
      },
      {
        id: 'visits',
        title: 'الزيارات الطبية',
        type: 'item',
        url: '/visits',
        icon: AssignmentIndIcon
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

  // ==========================================
  // 6️⃣ التقارير والتدقيق (Reports & Audit)
  // ==========================================
  {
    id: 'group-reports',
    title: 'التقارير والتدقيق',
    type: 'group',
    children: [
      {
        id: 'reports',
        title: 'التقارير',
        type: 'collapse',
        icon: AssessmentIcon,
        children: [
          {
            id: 'reports-index',
            title: 'نظرة عامة',
            type: 'item',
            url: '/reports',
            breadcrumbs: false
          },
          {
            id: 'employer-dashboard',
            title: 'لوحة صاحب العمل',
            type: 'item',
            url: '/reports/employer-dashboard'
          },
          {
            id: 'claims-report',
            title: 'تقرير المطالبات',
            type: 'item',
            url: '/reports/claims'
          }
        ]
      },
      {
        id: 'audit',
        title: 'سجل التدقيق',
        type: 'item',
        url: '/audit',
        icon: TimelineIcon
      }
    ]
  },

  // ==========================================
  // 7️⃣ إدارة النظام (System Administration)
  // ==========================================
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
        icon: ManageAccountsIcon,
        permission: ['admin.users.view']
      },
      {
        id: 'rbac',
        title: 'الصلاحيات',
        type: 'item',
        url: '/rbac',
        icon: SecurityIcon,
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

  // ==========================================
  // ❌ العناصر المُزالة / المُلغاة (Removed / Deprecated)
  // ==========================================
  // - benefit-packages: قديم ومكرر مع benefit-policies
  // - policies: تم استبداله بـ benefit-policies
  // - insurance-policies: تم دمجه مع benefit-policies
];

export default menuItem;
