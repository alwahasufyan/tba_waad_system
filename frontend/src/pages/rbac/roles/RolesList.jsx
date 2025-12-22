/**
 * RBAC Roles List Page - Phase D3 Step 2
 * Follows TbaDataTable Pattern from Medical Packages
 *
 * ⚠️ Pattern: ModernPageHeader → MainCard → TbaDataTable
 *
 * Rules Applied:
 * 1. icon={Component} - NEVER JSX
 * 2. Arabic only - No English labels
 * 3. Defensive optional chaining
 * 4. TbaDataTable for server-side pagination/sorting/filtering
 * 5. TableRefreshContext for post-create/edit refresh
 */

import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI Components
import { Box, Chip, IconButton, Stack, Tooltip, Typography, Avatar } from '@mui/material';

// MUI Icons - Always as Component, NEVER as JSX
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import LockIcon from '@mui/icons-material/Lock';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import TbaDataTable from 'components/tba/TbaDataTable';

// Contexts
import { useTableRefresh } from 'contexts/TableRefreshContext';

// Services
import { rolesService } from 'services/rbac';

// ============================================================================
// CONSTANTS
// ============================================================================

const QUERY_KEY = 'rbac-roles';

// Protected roles that cannot be modified
const PROTECTED_ROLES = ['SUPER_ADMIN'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get role color based on role name
 */
const getRoleColor = (roleName) => {
  const roleColors = {
    SUPER_ADMIN: 'error',
    ADMIN: 'warning',
    MANAGER: 'info',
    EMPLOYER: 'primary',
    REVIEWER: 'secondary',
    MEMBER: 'default'
  };
  return roleColors[roleName] || 'primary';
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const RolesList = () => {
  const navigate = useNavigate();

  // ========================================
  // TABLE REFRESH CONTEXT
  // ========================================

  const { refreshKey } = useTableRefresh();

  // ========================================
  // NAVIGATION HANDLERS
  // ========================================

  const handleNavigateView = useCallback(
    (id) => {
      navigate(`/rbac/roles/${id}`);
    },
    [navigate]
  );

  const handleNavigateEdit = useCallback(
    (id) => {
      navigate(`/rbac/roles/${id}/edit`);
    },
    [navigate]
  );

  // ========================================
  // FETCHER FUNCTION
  // ========================================

  const fetcher = useCallback(async (params) => {
    const response = await rolesService.getRolesTable(params);
    return response;
  }, []);

  // ========================================
  // COLUMN DEFINITIONS
  // ========================================

  const columns = useMemo(
    () => [
      // Role Name Column
      {
        accessorKey: 'name',
        header: 'الدور',
        size: 200,
        Cell: ({ row }) => {
          const roleName = row.original?.name || '';
          const isProtected = PROTECTED_ROLES.includes(roleName);

          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: `${getRoleColor(roleName)}.main`
                }}
              >
                <AdminPanelSettingsIcon fontSize="small" />
              </Avatar>
              <Box>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="body2" fontWeight="medium">
                    {row.original?.nameAr || row.original?.name || '-'}
                  </Typography>
                  {isProtected && (
                    <Tooltip title="دور محمي من النظام">
                      <LockIcon sx={{ fontSize: 14, color: 'error.main' }} />
                    </Tooltip>
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {roleName}
                </Typography>
              </Box>
            </Stack>
          );
        }
      },

      // Description Column
      {
        accessorKey: 'description',
        header: 'الوصف',
        size: 250,
        Cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 230 }}>
            {row.original?.description || row.original?.descriptionAr || '-'}
          </Typography>
        )
      },

      // Permissions Count Column
      {
        accessorKey: 'permissions',
        header: 'الصلاحيات',
        size: 120,
        enableSorting: false,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => {
          const count = row.original?.permissions?.length || 0;
          return (
            <Chip
              label={`${count} صلاحية`}
              size="small"
              color={count > 10 ? 'success' : count > 0 ? 'info' : 'default'}
              variant="light"
              icon={<SecurityIcon sx={{ fontSize: '14px !important' }} />}
            />
          );
        }
      },

      // Users Count Column
      {
        accessorKey: 'usersCount',
        header: 'المستخدمين',
        size: 120,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => {
          const count = row.original?.usersCount || row.original?.users?.length || 0;
          return (
            <Chip
              label={`${count} مستخدم`}
              size="small"
              color={count > 0 ? 'primary' : 'default'}
              variant="light"
              icon={<PeopleIcon sx={{ fontSize: '14px !important' }} />}
            />
          );
        }
      },

      // Status Column
      {
        accessorKey: 'active',
        header: 'الحالة',
        size: 100,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => (
          <Chip
            label={row.original?.active !== false ? 'نشط' : 'معطل'}
            color={row.original?.active !== false ? 'success' : 'default'}
            size="small"
            variant="light"
          />
        )
      },

      // Actions Column
      {
        id: 'actions',
        header: 'الإجراءات',
        size: 100,
        enableSorting: false,
        enableHiding: false,
        enableColumnFilter: false,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => {
          const roleName = row.original?.name || '';
          const isProtected = PROTECTED_ROLES.includes(roleName);

          return (
            <Stack direction="row" spacing={0.5} justifyContent="center">
              <Tooltip title="عرض وإدارة الصلاحيات">
                <IconButton size="small" color="primary" onClick={() => handleNavigateView(row.original?.id)}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title={isProtected ? 'دور محمي لا يمكن تعديله' : 'تعديل الدور'}>
                <span>
                  <IconButton
                    size="small"
                    color="info"
                    onClick={() => handleNavigateEdit(row.original?.id)}
                    disabled={isProtected}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    [handleNavigateView, handleNavigateEdit]
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <Box>
      {/* ====== PAGE HEADER ====== */}
      <ModernPageHeader
        title="إدارة الأدوار"
        subtitle="عرض وإدارة أدوار النظام وصلاحياتها"
        icon={AdminPanelSettingsIcon}
        breadcrumbs={[
          { label: 'الرئيسية', path: '/' },
          { label: 'الصلاحيات', path: '/rbac' },
          { label: 'الأدوار' }
        ]}
      />

      {/* ====== MAIN CARD WITH TABLE ====== */}
      <MainCard>
        <TbaDataTable
          columns={columns}
          fetcher={fetcher}
          queryKey={QUERY_KEY}
          refreshKey={refreshKey}
          enableExport={true}
          enablePrint={true}
          enableFilters={true}
          exportFilename="rbac_roles"
          printTitle="تقرير الأدوار"
        />
      </MainCard>
    </Box>
  );
};

export default RolesList;
