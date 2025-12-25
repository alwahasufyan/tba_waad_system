/**
 * Providers List Page - Phase D2.4 (TbaDataTable Pattern)
 * Healthcare Providers (Hospitals, Clinics, Labs, Pharmacies)
 *
 * ⚠️ Pattern: ModernPageHeader → MainCard → TbaDataTable
 *
 * Rules Applied:
 * 1. icon={Component} - NEVER JSX
 * 2. Arabic only - No English labels
 * 3. Defensive optional chaining
 * 4. TbaDataTable for server-side pagination/sorting/filtering
 * 5. TableRefreshContext for post-create/edit refresh (Phase D2.3)
 */

import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI Components
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';

// MUI Icons - Always as Component, NEVER as JSX
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import TbaDataTable from 'components/tba/TbaDataTable';
import TableErrorBoundary from 'components/TableErrorBoundary';
import PermissionGuard from 'components/PermissionGuard';

// Insurance UX Components - Phase B2
import { NetworkBadge, CardStatusBadge } from 'components/insurance';

// Contexts
import { useTableRefresh } from 'contexts/TableRefreshContext';

// Services
import { providersService } from 'services/api';

// ============================================================================
// CONSTANTS
// ============================================================================

const QUERY_KEY = 'providers';

// Provider Type Labels (Arabic)
const PROVIDER_TYPE_LABELS_AR = {
  HOSPITAL: 'مستشفى',
  CLINIC: 'عيادة',
  LAB: 'مختبر',
  LABORATORY: 'مختبر',
  PHARMACY: 'صيدلية',
  RADIOLOGY: 'مركز أشعة'
};

// Provider Type Colors
const PROVIDER_TYPE_COLORS = {
  HOSPITAL: 'error',
  CLINIC: 'primary',
  LAB: 'warning',
  LABORATORY: 'warning',
  PHARMACY: 'success',
  RADIOLOGY: 'info'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get network tier from provider
 */
const getNetworkTier = (provider) => {
  if (provider?.networkStatus) return provider.networkStatus;
  if (provider?.inNetwork === true) return 'IN_NETWORK';
  if (provider?.inNetwork === false) return 'OUT_OF_NETWORK';
  if (provider?.contracted === true) return 'IN_NETWORK';
  if (provider?.contracted === false) return 'OUT_OF_NETWORK';
  return null;
};

/**
 * Get provider status
 */
const getProviderStatus = (provider) => {
  if (provider?.status) return provider.status;
  if (provider?.active === true) return 'ACTIVE';
  if (provider?.active === false) return 'INACTIVE';
  return 'ACTIVE';
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProvidersList() {
  const navigate = useNavigate();

  // ========================================
  // TABLE REFRESH CONTEXT (Phase D2.3)
  // ========================================

  const { refreshKey, triggerRefresh } = useTableRefresh();

  // ========================================
  // NAVIGATION HANDLERS
  // ========================================

  const handleNavigateAdd = useCallback(() => {
    navigate('/providers/add');
  }, [navigate]);

  const handleNavigateView = useCallback(
    (id) => {
      navigate(`/providers/${id}`);
    },
    [navigate]
  );

  const handleNavigateEdit = useCallback(
    (id) => {
      navigate(`/providers/edit/${id}`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (id, name) => {
      const confirmMessage = `هل أنت متأكد من حذف مقدم الخدمة "${name}"؟`;
      if (!window.confirm(confirmMessage)) return;

      try {
        await providersService.remove(id);
        // Trigger refresh via context - no page reload needed
        triggerRefresh();
      } catch (err) {
        console.error('[Providers] Delete failed:', err);
        alert('فشل حذف مقدم الخدمة. يرجى المحاولة لاحقاً');
      }
    },
    [triggerRefresh]
  );

  // ========================================
  // FETCHER FUNCTION
  // ========================================

  const fetcher = useCallback(async (params) => {
    return providersService.getAll(params);
  }, []);

  // ========================================
  // COLUMN DEFINITIONS
  // ========================================

  const columns = useMemo(
    () => [
      // Name Column
      {
        accessorKey: 'name',
        header: 'اسم مقدم الخدمة',
        size: 200,
        Cell: ({ row }) => {
          const provider = row.original;
          const name = provider?.name ?? provider?.nameArabic ?? provider?.nameEnglish ?? '-';
          return (
            <Typography variant="body2" fontWeight={500}>
              {name}
            </Typography>
          );
        }
      },

      // Provider Type Column
      {
        accessorKey: 'providerType',
        header: 'نوع مقدم الخدمة',
        size: 130,
        Cell: ({ row }) => {
          const type = row.original?.providerType;
          return (
            <Chip
              label={PROVIDER_TYPE_LABELS_AR[type] ?? type ?? '-'}
              color={PROVIDER_TYPE_COLORS[type] || 'default'}
              size="small"
              variant="outlined"
            />
          );
        }
      },

      // License Number Column
      {
        accessorKey: 'licenseNumber',
        header: 'رقم الترخيص',
        size: 130,
        Cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {row.original?.licenseNumber ?? '-'}
          </Typography>
        )
      },

      // City Column
      {
        accessorKey: 'city',
        header: 'المدينة',
        size: 120,
        Cell: ({ row }) => (
          <Typography variant="body2">
            {row.original?.city ?? row.original?.region ?? '-'}
          </Typography>
        )
      },

      // Phone Column
      {
        accessorKey: 'phone',
        header: 'الهاتف',
        size: 130,
        Cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary" dir="ltr">
            {row.original?.phone ?? row.original?.contactPhone ?? '-'}
          </Typography>
        )
      },

      // Network Status Column
      {
        accessorKey: 'networkStatus',
        header: 'حالة الشبكة',
        size: 130,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        enableSorting: false,
        Cell: ({ row }) => {
          const networkTier = getNetworkTier(row.original);
          if (!networkTier) {
            return <Typography variant="body2" color="text.secondary">-</Typography>;
          }
          return (
            <NetworkBadge
              networkTier={networkTier}
              showLabel={true}
              size="small"
              language="ar"
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
        Cell: ({ row }) => {
          const status = getProviderStatus(row.original);
          return (
            <CardStatusBadge
              status={status}
              size="small"
              language="ar"
            />
          );
        }
      },

      // Actions Column
      {
        id: 'actions',
        header: 'الإجراءات',
        size: 130,
        enableSorting: false,
        enableHiding: false,
        enableColumnFilter: false,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => (
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <Tooltip title="عرض">
              <IconButton size="small" color="primary" onClick={() => handleNavigateView(row.original?.id)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="تعديل">
              <IconButton size="small" color="info" onClick={() => handleNavigateEdit(row.original?.id)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="حذف">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(row.original?.id, row.original?.name || row.original?.nameArabic)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    [handleNavigateView, handleNavigateEdit, handleDelete]
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <Box>
      {/* ====== PAGE HEADER ====== */}
      <ModernPageHeader
        title="مقدمي الخدمات الصحية"
        subtitle="إدارة المستشفيات والعيادات والمختبرات والصيدليات"
        icon={LocalHospitalIcon}
        breadcrumbs={[{ label: 'الرئيسية', path: '/' }, { label: 'مقدمي الخدمات' }]}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleNavigateAdd}>
            إضافة مقدم خدمة
          </Button>
        }
      />

      {/* ====== MAIN CARD WITH TABLE ====== */}
      <MainCard>
        <TableErrorBoundary>
          <TbaDataTable
            columns={columns}
            fetcher={fetcher}
            queryKey={QUERY_KEY}
            refreshKey={refreshKey}
            enableExport={true}
            enablePrint={true}
            enableFilters={true}
            exportFilename="healthcare_providers"
            printTitle="تقرير مقدمي الخدمات الصحية"
          />
        </TableErrorBoundary>
      </MainCard>
    </Box>
  );
}
