/**
 * RBAC Users List Page - Phase D3 Step 2
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
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography, Avatar } from '@mui/material';

// MUI Icons - Always as Component, NEVER as JSX
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import TbaDataTable from 'components/tba/TbaDataTable';

// Contexts
import { useTableRefresh } from 'contexts/TableRefreshContext';

// Services
import { usersService } from 'services/rbac';

// ============================================================================
// CONSTANTS
// ============================================================================

const QUERY_KEY = 'rbac-users';

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
  return roleColors[roleName] || 'default';
};

/**
 * Get initials from name
 */
const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UsersList = () => {
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
      navigate(`/rbac/users/${id}`);
    },
    [navigate]
  );

  const handleNavigateEdit = useCallback(
    (id) => {
      navigate(`/rbac/users/${id}/edit`);
    },
    [navigate]
  );

  // ========================================
  // FETCHER FUNCTION
  // ========================================

  const fetcher = useCallback(async (params) => {
    const response = await usersService.getUsersTable(params);
    return response;
  }, []);

  // ========================================
  // COLUMN DEFINITIONS
  // ========================================

  const columns = useMemo(
    () => [
      // User Avatar & Name Column
      {
        accessorKey: 'username',
        header: 'المستخدم',
        size: 200,
        Cell: ({ row }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
              {getInitials(row.original?.fullName || row.original?.username)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {row.original?.fullName || row.original?.username || '-'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                @{row.original?.username || '-'}
              </Typography>
            </Box>
          </Stack>
        )
      },

      // Email Column
      {
        accessorKey: 'email',
        header: 'البريد الإلكتروني',
        size: 200,
        Cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {row.original?.email || '-'}
          </Typography>
        )
      },

      // Roles Column
      {
        accessorKey: 'roles',
        header: 'الأدوار',
        size: 250,
        enableSorting: false,
        Cell: ({ row }) => {
          const roles = row.original?.roles || [];
          if (roles.length === 0) {
            return (
              <Typography variant="caption" color="text.disabled">
                لا توجد أدوار
              </Typography>
            );
          }
          return (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {roles.slice(0, 3).map((role) => (
                <Chip
                  key={role?.id || role?.name}
                  label={role?.nameAr || role?.name || '-'}
                  size="small"
                  color={getRoleColor(role?.name)}
                  variant="light"
                  icon={<AdminPanelSettingsIcon sx={{ fontSize: '14px !important' }} />}
                />
              ))}
              {roles.length > 3 && (
                <Chip label={`+${roles.length - 3}`} size="small" variant="outlined" />
              )}
            </Stack>
          );
        }
      },

      // Status Column
      {
        accessorKey: 'enabled',
        header: 'الحالة',
        size: 100,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => (
          <Chip
            label={row.original?.enabled !== false ? 'نشط' : 'معطل'}
            color={row.original?.enabled !== false ? 'success' : 'default'}
            size="small"
            variant="light"
          />
        )
      },

      // Last Login Column
      {
        accessorKey: 'lastLogin',
        header: 'آخر دخول',
        size: 150,
        Cell: ({ row }) => {
          const lastLogin = row.original?.lastLogin;
          if (!lastLogin) return <Typography variant="caption" color="text.disabled">لم يسجل الدخول</Typography>;
          return (
            <Typography variant="body2" color="text.secondary">
              {new Date(lastLogin).toLocaleDateString('ar-LY')}
            </Typography>
          );
        }
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
        Cell: ({ row }) => (
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <Tooltip title="عرض وإدارة الصلاحيات">
              <IconButton size="small" color="primary" onClick={() => handleNavigateView(row.original?.id)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="تعديل المستخدم">
              <IconButton size="small" color="info" onClick={() => handleNavigateEdit(row.original?.id)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )
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
        title="إدارة المستخدمين"
        subtitle="عرض وإدارة المستخدمين وصلاحياتهم"
        icon={PeopleAltIcon}
        breadcrumbs={[
          { label: 'الرئيسية', path: '/' },
          { label: 'الصلاحيات', path: '/rbac' },
          { label: 'المستخدمين' }
        ]}
        actions={
          <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => navigate('/rbac/users/create')}>
            إضافة مستخدم
          </Button>
        }
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
          exportFilename="rbac_users"
          printTitle="تقرير المستخدمين"
        />
      </MainCard>
    </Box>
  );
};

export default UsersList;
