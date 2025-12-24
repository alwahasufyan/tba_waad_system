import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import MainLayout from 'layout/Dashboard';
import RouteGuard from './RouteGuard';

// Contexts - Phase D2.3 Table Refresh
import { TableRefreshLayout } from 'contexts/TableRefreshContext';

// ==============================|| LAZY LOADING - DASHBOARD ||============================== //

const Dashboard = Loadable(lazy(() => import('pages/dashboard')));

// ==============================|| LAZY LOADING - MEMBERS ||============================== //

const MembersList = Loadable(lazy(() => import('pages/members/MembersList')));
const MemberCreate = Loadable(lazy(() => import('pages/members/MemberCreate')));
const MemberEdit = Loadable(lazy(() => import('pages/members/MemberEdit')));
const MemberView = Loadable(lazy(() => import('pages/members/MemberView')));
const MemberImport = Loadable(lazy(() => import('pages/members/MemberImport')));

// ==============================|| LAZY LOADING - EMPLOYERS ||============================== //

const EmployersList = Loadable(lazy(() => import('pages/employers/EmployersList')));
const EmployerCreate = Loadable(lazy(() => import('pages/employers/EmployerCreate')));
const EmployerEdit = Loadable(lazy(() => import('pages/employers/EmployerEdit')));
const EmployerView = Loadable(lazy(() => import('pages/employers/EmployerView')));

// ==============================|| LAZY LOADING - CLAIMS ||============================== //

const ClaimsList = Loadable(lazy(() => import('pages/claims/ClaimsList')));
const ClaimCreate = Loadable(lazy(() => import('pages/claims/ClaimCreate')));
const ClaimEdit = Loadable(lazy(() => import('pages/claims/ClaimEdit')));
const ClaimView = Loadable(lazy(() => import('pages/claims/ClaimView')));
const ClaimsInbox = Loadable(lazy(() => import('pages/claims/ClaimsInbox')));
const SettlementInbox = Loadable(lazy(() => import('pages/claims/SettlementInbox')));

// ==============================|| LAZY LOADING - PROVIDERS ||============================== //

const ProvidersList = Loadable(lazy(() => import('pages/providers/ProvidersList')));
const ProviderCreate = Loadable(lazy(() => import('pages/providers/ProviderCreate')));
const ProviderEdit = Loadable(lazy(() => import('pages/providers/ProviderEdit')));
const ProviderView = Loadable(lazy(() => import('pages/providers/ProviderView')));

// ==============================|| LAZY LOADING - PROVIDER CONTRACTS ||============================== //

const ProviderContractsList = Loadable(lazy(() => import('pages/provider-contracts')));

// ==============================|| LAZY LOADING - VISITS ||============================== //

const VisitsList = Loadable(lazy(() => import('pages/visits/VisitsList')));
const VisitCreate = Loadable(lazy(() => import('pages/visits/VisitCreate')));
const VisitEdit = Loadable(lazy(() => import('pages/visits/VisitEdit')));
const VisitView = Loadable(lazy(() => import('pages/visits/VisitView')));

// ==============================|| LAZY LOADING - POLICIES ||============================== //

const PoliciesList = Loadable(lazy(() => import('pages/policies/PoliciesList')));
const PolicyCreate = Loadable(lazy(() => import('pages/policies/PolicyCreate')));
const PolicyEdit = Loadable(lazy(() => import('pages/policies/PolicyEdit')));
const PolicyView = Loadable(lazy(() => import('pages/policies/PolicyView')));

// ==============================|| LAZY LOADING - PRE-APPROVALS ||============================== //

const PreApprovalsList = Loadable(lazy(() => import('pages/pre-approvals/PreApprovalsList')));
const PreApprovalCreate = Loadable(lazy(() => import('pages/pre-approvals/PreApprovalCreate')));
const PreApprovalEdit = Loadable(lazy(() => import('pages/pre-approvals/PreApprovalEdit')));
const PreApprovalView = Loadable(lazy(() => import('pages/pre-approvals/PreApprovalView')));
const PreApprovalsInbox = Loadable(lazy(() => import('pages/pre-approvals/PreApprovalsInbox')));

// ==============================|| LAZY LOADING - BENEFIT PACKAGES ||============================== //

const BenefitPackagesList = Loadable(lazy(() => import('pages/benefit-packages/BenefitPackagesList')));
const BenefitPackageCreate = Loadable(lazy(() => import('pages/benefit-packages/BenefitPackageCreate')));
const BenefitPackageEdit = Loadable(lazy(() => import('pages/benefit-packages/BenefitPackageEdit')));
const BenefitPackageView = Loadable(lazy(() => import('pages/benefit-packages/BenefitPackageView')));

// ==============================|| LAZY LOADING - BENEFIT POLICIES ||============================== //

const BenefitPoliciesList = Loadable(lazy(() => import('pages/benefit-policies/BenefitPoliciesList')));
const BenefitPolicyView = Loadable(lazy(() => import('pages/benefit-policies/BenefitPolicyView')));

// ==============================|| LAZY LOADING - INSURANCE COMPANIES (LOCKED - SINGLE TENANT) ||============================== //

// All insurance company routes now redirect to locked page - single tenant mode
const InsuranceCompanyLocked = Loadable(lazy(() => import('pages/insurance-companies/InsuranceCompanyLocked')));

// ==============================|| LAZY LOADING - INSURANCE POLICIES ||============================== //

const InsurancePoliciesList = Loadable(lazy(() => import('pages/insurance-policies/InsurancePoliciesList')));
const InsurancePolicyCreate = Loadable(lazy(() => import('pages/insurance-policies/InsurancePolicyCreate')));
const InsurancePolicyEdit = Loadable(lazy(() => import('pages/insurance-policies/InsurancePolicyEdit')));
const InsurancePolicyView = Loadable(lazy(() => import('pages/insurance-policies/InsurancePolicyView')));

// ==============================|| LAZY LOADING - MEDICAL SERVICES ||============================== //

const MedicalServicesList = Loadable(lazy(() => import('pages/medical-services/MedicalServicesList')));
const MedicalServiceCreate = Loadable(lazy(() => import('pages/medical-services/MedicalServiceCreate')));
const MedicalServiceEdit = Loadable(lazy(() => import('pages/medical-services/MedicalServiceEdit')));
const MedicalServiceView = Loadable(lazy(() => import('pages/medical-services/MedicalServiceView')));

// ==============================|| LAZY LOADING - MEDICAL CATEGORIES ||============================== //

const MedicalCategoriesList = Loadable(lazy(() => import('pages/medical-categories/MedicalCategoriesList')));
const MedicalCategoryCreate = Loadable(lazy(() => import('pages/medical-categories/MedicalCategoryCreate')));
const MedicalCategoryEdit = Loadable(lazy(() => import('pages/medical-categories/MedicalCategoryEdit')));
const MedicalCategoryView = Loadable(lazy(() => import('pages/medical-categories/MedicalCategoryView')));

// ==============================|| LAZY LOADING - MEDICAL PACKAGES ||============================== //

const MedicalPackagesList = Loadable(lazy(() => import('pages/medical-packages')));
const MedicalPackageCreate = Loadable(lazy(() => import('pages/medical-packages/MedicalPackageCreate')));
const MedicalPackageEdit = Loadable(lazy(() => import('pages/medical-packages/MedicalPackageEdit')));
const MedicalPackageView = Loadable(lazy(() => import('pages/medical-packages/MedicalPackageView')));

// ==============================|| LAZY LOADING - COMPANIES ||============================== //

const CompaniesList = Loadable(lazy(() => import('pages/companies')));

// ==============================|| LAZY LOADING - RBAC ||============================== //

const RbacDashboard = Loadable(lazy(() => import('pages/rbac')));
const RbacUsersList = Loadable(lazy(() => import('pages/rbac/users')));
const RbacUserDetails = Loadable(lazy(() => import('pages/rbac/users/UserDetails')));
const RbacUserCreate = Loadable(lazy(() => import('pages/rbac/users/UserCreate')));
const RbacUserEdit = Loadable(lazy(() => import('pages/rbac/users/UserEdit')));
const RbacRolesList = Loadable(lazy(() => import('pages/rbac/roles')));
const RbacRoleDetails = Loadable(lazy(() => import('pages/rbac/roles/RoleDetails')));

// ==============================|| LAZY LOADING - REVIEWER COMPANIES ||============================== //

const ReviewerCompaniesList = Loadable(lazy(() => import('pages/reviewer-companies')));

// ==============================|| LAZY LOADING - ADMIN ||============================== //

const AdminCompaniesList = Loadable(lazy(() => import('pages/admin/companies')));
const AdminUsersList = Loadable(lazy(() => import('pages/admin/users')));
const AdminRolesList = Loadable(lazy(() => import('pages/admin/roles')));

// ==============================|| LAZY LOADING - SETTINGS ||============================== //

const Settings = Loadable(lazy(() => import('pages/settings')));
const SettingsUsers = Loadable(lazy(() => import('pages/settings/users')));

// ==============================|| LAZY LOADING - PROFILE ||============================== //

const ProfileOverview = Loadable(lazy(() => import('pages/profile/ProfileOverview')));
const AccountSettings = Loadable(lazy(() => import('pages/profile/AccountSettings')));

// ==============================|| LAZY LOADING - AUDIT ||============================== //

const AuditLog = Loadable(lazy(() => import('pages/audit')));

// ==============================|| LAZY LOADING - REPORTS ||============================== //

const ReportsPage = Loadable(lazy(() => import('pages/reports')));

// ==============================|| LAZY LOADING - ERROR PAGES ||============================== //

const NoAccess = Loadable(lazy(() => import('pages/errors/NoAccess')));
const Error403 = Loadable(lazy(() => import('pages/errors/Forbidden403')));
const Error404 = Loadable(lazy(() => import('pages/errors/NotFound404')));
const Error500 = Loadable(lazy(() => import('pages/errors/ServerError500')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    // Dashboard
    {
      path: 'dashboard',
      element: (
        <RouteGuard allowedRoles={['ADMIN', 'EMPLOYER']}>
          <Dashboard />
        </RouteGuard>
      )
    },

    // Members Module
    {
      path: 'members',
      children: [
        {
          path: '',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'EMPLOYER']}>
              <MembersList />
            </RouteGuard>
          )
        },
        {
          path: 'add',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'EMPLOYER']}>
              <MemberCreate />
            </RouteGuard>
          )
        },
        {
          path: 'import',
          element: (
            <RouteGuard allowedRoles={['ADMIN']}>
              <MemberImport />
            </RouteGuard>
          )
        },
        {
          path: 'edit/:id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'EMPLOYER']}>
              <MemberEdit />
            </RouteGuard>
          )
        },
        {
          path: ':id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'EMPLOYER']}>
              <MemberView />
            </RouteGuard>
          )
        }
      ]
    },

    // Employers Module
    {
      path: 'employers',
      children: [
        {
          path: '',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <EmployersList />
            </RouteGuard>
          )
        },
        {
          path: 'create',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <EmployerCreate />
            </RouteGuard>
          )
        },
        {
          path: 'edit/:id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <EmployerEdit />
            </RouteGuard>
          )
        },
        {
          path: ':id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <EmployerView />
            </RouteGuard>
          )
        }
      ]
    },

    // Claims Module
    {
      path: 'claims',
      children: [
        {
          path: '',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'EMPLOYER', 'REVIEWER']}>
              <ClaimsList />
            </RouteGuard>
          )
        },
        {
          path: 'inbox',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'REVIEWER']}>
              <ClaimsInbox />
            </RouteGuard>
          )
        },
        {
          path: 'settlement',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'FINANCE']}>
              <SettlementInbox />
            </RouteGuard>
          )
        },
        {
          path: 'add',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'EMPLOYER']}>
              <ClaimCreate />
            </RouteGuard>
          )
        },
        {
          path: 'edit/:id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'EMPLOYER']}>
              <ClaimEdit />
            </RouteGuard>
          )
        },
        {
          path: ':id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'EMPLOYER', 'REVIEWER']}>
              <ClaimView />
            </RouteGuard>
          )
        }
      ]
    },

    // Providers Module
    {
      path: 'providers',
      children: [
        {
          path: '',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'EMPLOYER']}>
              <ProvidersList />
            </RouteGuard>
          )
        },
        {
          path: 'add',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <ProviderCreate />
            </RouteGuard>
          )
        },
        {
          path: 'edit/:id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <ProviderEdit />
            </RouteGuard>
          )
        },
        {
          path: ':id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'EMPLOYER']}>
              <ProviderView />
            </RouteGuard>
          )
        }
      ]
    },

    // Provider Contracts Module
    {
      path: 'provider-contracts',
      element: (
        <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
          <ProviderContractsList />
        </RouteGuard>
      )
    },

    // Visits Module
    {
      path: 'visits',
      element: (
        <RouteGuard allowedRoles={['ADMIN', 'REVIEWER']}>
          <VisitsList />
        </RouteGuard>
      )
    },

    // Policies Module
    {
      path: 'policies',
      children: [
        {
          path: '',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'EMPLOYER']}>
              <PoliciesList />
            </RouteGuard>
          )
        },
        {
          path: 'add',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <PolicyCreate />
            </RouteGuard>
          )
        },
        {
          path: 'edit/:id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <PolicyEdit />
            </RouteGuard>
          )
        },
        {
          path: ':id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'EMPLOYER']}>
              <PolicyView />
            </RouteGuard>
          )
        }
      ]
    },

    // Pre-Approvals Module
    {
      path: 'pre-approvals',
      children: [
        {
          path: '',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'REVIEWER']}>
              <PreApprovalsList />
            </RouteGuard>
          )
        },
        {
          path: 'inbox',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'REVIEWER']}>
              <PreApprovalsInbox />
            </RouteGuard>
          )
        },
        {
          path: 'add',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'EMPLOYER']}>
              <PreApprovalCreate />
            </RouteGuard>
          )
        },
        {
          path: 'edit/:id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'REVIEWER']}>
              <PreApprovalEdit />
            </RouteGuard>
          )
        },
        {
          path: ':id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'REVIEWER']}>
              <PreApprovalView />
            </RouteGuard>
          )
        }
      ]
    },

    // Benefit Packages Module
    {
      path: 'benefit-packages',
      element: (
        <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
          <BenefitPackagesList />
        </RouteGuard>
      )
    },

    // Insurance Companies Module - LOCKED (Single Tenant Mode)
    // All routes redirect to locked page explaining the fixed insurance company
    {
      path: 'insurance-companies',
      children: [
        {
          path: '',
          element: <InsuranceCompanyLocked />
        },
        {
          path: 'add',
          element: <InsuranceCompanyLocked />
        },
        {
          path: 'edit/:id',
          element: <InsuranceCompanyLocked />
        },
        {
          path: ':id',
          element: <InsuranceCompanyLocked />
        }
      ]
    },

    // Insurance Policies Module
    {
      path: 'insurance-policies',
      children: [
        {
          path: '',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <InsurancePoliciesList />
            </RouteGuard>
          )
        },
        {
          path: 'add',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <InsurancePolicyCreate />
            </RouteGuard>
          )
        },
        {
          path: 'edit/:id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <InsurancePolicyEdit />
            </RouteGuard>
          )
        },
        {
          path: ':id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <InsurancePolicyView />
            </RouteGuard>
          )
        }
      ]
    },

    // Medical Services Module - Wrapped with TableRefreshLayout (Phase D2.3)
    {
      path: 'medical-services',
      element: <TableRefreshLayout />,
      children: [
        {
          path: '',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY']}>
              <MedicalServicesList />
            </RouteGuard>
          )
        },
        {
          path: 'add',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY']}>
              <MedicalServiceCreate />
            </RouteGuard>
          )
        },
        {
          path: 'edit/:id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY']}>
              <MedicalServiceEdit />
            </RouteGuard>
          )
        },
        {
          path: ':id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <MedicalServiceView />
            </RouteGuard>
          )
        }
      ]
    },

    // Medical Categories Module - Wrapped with TableRefreshLayout (Phase D2.4)
    {
      path: 'medical-categories',
      element: <TableRefreshLayout />,
      children: [
        {
          path: '',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY']}>
              <MedicalCategoriesList />
            </RouteGuard>
          )
        },
        {
          path: 'add',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY']}>
              <MedicalCategoryCreate />
            </RouteGuard>
          )
        },
        {
          path: 'edit/:id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY']}>
              <MedicalCategoryEdit />
            </RouteGuard>
          )
        },
        {
          path: ':id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <MedicalCategoryView />
            </RouteGuard>
          )
        }
      ]
    },

    // Medical Packages Module
    {
      path: 'medical-packages',
      children: [
        {
          path: '',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <MedicalPackagesList />
            </RouteGuard>
          )
        },
        {
          path: 'add',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY']}>
              <MedicalPackageCreate />
            </RouteGuard>
          )
        },
        {
          path: 'edit/:id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY']}>
              <MedicalPackageEdit />
            </RouteGuard>
          )
        },
        {
          path: ':id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <MedicalPackageView />
            </RouteGuard>
          )
        }
      ]
    },

    // Benefit Packages Module
    {
      path: 'benefit-packages',
      children: [
        {
          path: '',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <BenefitPackagesList />
            </RouteGuard>
          )
        },
        {
          path: 'create',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY']}>
              <BenefitPackageCreate />
            </RouteGuard>
          )
        },
        {
          path: 'edit/:id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY']}>
              <BenefitPackageEdit />
            </RouteGuard>
          )
        },
        {
          path: 'view/:id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <BenefitPackageView />
            </RouteGuard>
          )
        }
      ]
    },

    // Benefit Policies Module (NEW)
    {
      path: 'benefit-policies',
      children: [
        {
          path: '',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'EMPLOYER']}>
              <BenefitPoliciesList />
            </RouteGuard>
          )
        },
        {
          path: ':id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'EMPLOYER']}>
              <BenefitPolicyView />
            </RouteGuard>
          )
        }
      ]
    },

    // Visits Module
    {
      path: 'visits',
      children: [
        {
          path: '',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <VisitsList />
            </RouteGuard>
          )
        },
        {
          path: 'create',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY']}>
              <VisitCreate />
            </RouteGuard>
          )
        },
        {
          path: 'edit/:id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY']}>
              <VisitEdit />
            </RouteGuard>
          )
        },
        {
          path: 'view/:id',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
              <VisitView />
            </RouteGuard>
          )
        }
      ]
    },

    // Companies Module
    {
      path: 'companies',
      element: (
        <RouteGuard allowedRoles={['SUPER_ADMIN']}>
          <CompaniesList />
        </RouteGuard>
      )
    },

    // Reviewer Companies Module
    {
      path: 'reviewer-companies',
      element: (
        <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
          <ReviewerCompaniesList />
        </RouteGuard>
      )
    },

    // Admin Module
    {
      path: 'admin',
      children: [
        {
          path: 'companies',
          element: (
            <RouteGuard allowedRoles={['SUPER_ADMIN']}>
              <AdminCompaniesList />
            </RouteGuard>
          )
        },
        {
          path: 'users',
          element: (
            <RouteGuard allowedRoles={['SUPER_ADMIN']}>
              <AdminUsersList />
            </RouteGuard>
          )
        },
        {
          path: 'roles',
          element: (
            <RouteGuard allowedRoles={['SUPER_ADMIN']}>
              <AdminRolesList />
            </RouteGuard>
          )
        }
      ]
    },

    // RBAC Module
    {
      path: 'rbac',
      children: [
        {
          path: '',
          element: (
            <RouteGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <RbacDashboard />
            </RouteGuard>
          )
        },
        {
          path: 'users',
          children: [
            {
              path: '',
              element: (
                <RouteGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                  <RbacUsersList />
                </RouteGuard>
              )
            },
            {
              path: 'create',
              element: (
                <RouteGuard allowedRoles={['SUPER_ADMIN']}>
                  <RbacUserCreate />
                </RouteGuard>
              )
            },
            {
              path: ':id',
              element: (
                <RouteGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                  <RbacUserDetails />
                </RouteGuard>
              )
            },
            {
              path: ':id/edit',
              element: (
                <RouteGuard allowedRoles={['SUPER_ADMIN']}>
                  <RbacUserEdit />
                </RouteGuard>
              )
            }
          ]
        },
        {
          path: 'roles',
          children: [
            {
              path: '',
              element: (
                <RouteGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                  <RbacRolesList />
                </RouteGuard>
              )
            },
            {
              path: ':id',
              element: (
                <RouteGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                  <RbacRoleDetails />
                </RouteGuard>
              )
            }
          ]
        }
      ]
    },

    // Settings
    {
      path: 'settings',
      children: [
        {
          path: '',
          element: (
            <RouteGuard allowedRoles={['ADMIN', 'EMPLOYER']}>
              <Settings />
            </RouteGuard>
          )
        },
        {
          path: 'users',
          element: (
            <RouteGuard allowedRoles={['ADMIN']}>
              <SettingsUsers />
            </RouteGuard>
          )
        }
      ]
    },

    // Profile
    {
      path: 'profile',
      children: [
        {
          path: '',
          element: <ProfileOverview />
        },
        {
          path: 'account',
          element: <AccountSettings />
        }
      ]
    },

    // Reports Module
    {
      path: 'reports',
      element: (
        <RouteGuard allowedRoles={['ADMIN', 'SUPER_ADMIN', 'INSURANCE_COMPANY']}>
          <ReportsPage />
        </RouteGuard>
      )
    },

    // Audit Log
    {
      path: 'audit',
      element: (
        <RouteGuard allowedRoles={['ADMIN', 'INSURANCE_COMPANY', 'REVIEWER']}>
          <AuditLog />
        </RouteGuard>
      )
    },

    // Error Pages
    {
      path: '403',
      element: <NoAccess />
    },
    {
      path: 'forbidden',
      element: <Error403 />
    },
    {
      path: '404',
      element: <Error404 />
    },
    {
      path: '500',
      element: <Error500 />
    },
    {
      path: '*',
      element: <Error404 />
    }
  ]
};

export default MainRoutes;
