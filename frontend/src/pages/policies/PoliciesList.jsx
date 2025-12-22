/**
 * Policies List Page - Phase D2.4 (TbaDataTable Pattern)
 * Insurance Policies Management
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
import dayjs from 'dayjs';

// MUI Components
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';

// MUI Icons - Always as Component, NEVER as JSX
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PolicyIcon from '@mui/icons-material/Policy';
import WarningIcon from '@mui/icons-material/Warning';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import TbaDataTable from 'components/tba/TbaDataTable';

// Insurance UX Components - Phase B2
import { PolicyLifecycleBar, CardStatusBadge } from 'components/insurance';

// Contexts
import { useTableRefresh } from 'contexts/TableRefreshContext';

// Services
import { getPolicies, deletePolicy } from 'services/api/policies.service';

// ============================================================================
// CONSTANTS
// ============================================================================

const QUERY_KEY = 'policies';

// Policy Type Labels (Arabic)
const POLICY_TYPE_LABELS = {
  GROUP: 'جماعية',
  INDIVIDUAL: 'فردية',
  CORPORATE: 'شركات'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if policy needs renewal (within 30 days)
 */
const isRenewalSoon = (endDate) => {
  if (!endDate) return false;
  const daysRemaining = dayjs(endDate).diff(dayjs(), 'day');
  return daysRemaining > 0 && daysRemaining <= 30;
};

/**
 * Check if policy is expired
 */
const isPolicyExpired = (endDate) => {
  if (!endDate) return false;
  return dayjs().isAfter(dayjs(endDate));
};

/**
 * Format date for display
 */
const formatDate = (date) => {
  if (!date) return '-';
  return dayjs(date).format('YYYY/MM/DD');
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PoliciesList = () => {
  const navigate = useNavigate();

  // ========================================
  // TABLE REFRESH CONTEXT (Phase D2.3)
  // ========================================

  const { refreshKey, triggerRefresh } = useTableRefresh();

  // ========================================
  // NAVIGATION HANDLERS
  // ========================================

  const handleNavigateAdd = useCallback(() => {
    navigate('/policies/add');
  }, [navigate]);

  const handleNavigateView = useCallback(
    (id) => {
      navigate(`/policies/${id}`);
    },
    [navigate]
  );

  const handleNavigateEdit = useCallback(
    (id) => {
      navigate(`/policies/edit/${id}`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (id, name) => {
      const confirmMessage = `هل أنت متأكد من حذف الوثيقة "${name}"؟`;
      if (!window.confirm(confirmMessage)) return;

      try {
        await deletePolicy(id);
        // Trigger refresh via context - no page reload needed
        triggerRefresh();
      } catch (err) {
        console.error('[Policies] Delete failed:', err);
        alert('فشل حذف الوثيقة. يرجى المحاولة لاحقاً');
      }
    },
    [triggerRefresh]
  );

  // ========================================
  // FETCHER FUNCTION
  // ========================================

  const fetcher = useCallback(async (params) => {
    return getPolicies(params);
  }, []);

  // ========================================
  // COLUMN DEFINITIONS
  // ========================================

  const columns = useMemo(
    () => [
      // Policy Name Column
      {
        accessorKey: 'name',
        header: 'اسم الوثيقة',
        size: 180,
        Cell: ({ row }) => {
          const policy = row.original;
          const expired = isPolicyExpired(policy?.endDate);
          const renewalSoon = isRenewalSoon(policy?.endDate);
          
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {policy?.name ?? '-'}
                </Typography>
                {policy?.memberCount > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {policy.memberCount} عضو
                  </Typography>
                )}
              </Box>
              {(expired || renewalSoon) && (
                <Tooltip title={expired ? 'منتهية الصلاحية' : 'تحتاج تجديد قريباً'}>
                  <WarningIcon fontSize="small" color={expired ? 'error' : 'warning'} />
                </Tooltip>
              )}
            </Stack>
          );
        }
      },

      // Code Column
      {
        accessorKey: 'code',
        header: 'الرمز',
        size: 100,
        Cell: ({ row }) => (
          <Chip
            label={row.original?.code ?? '-'}
            size="small"
            variant="outlined"
            color="primary"
          />
        )
      },

      // Insurance Company Column
      {
        accessorKey: 'insuranceCompanyName',
        header: 'شركة التأمين',
        size: 150,
        Cell: ({ row }) => (
          <Typography variant="body2">
            {row.original?.insuranceCompanyName ?? '-'}
          </Typography>
        )
      },

      // Policy Type Column
      {
        accessorKey: 'policyType',
        header: 'النوع',
        size: 100,
        Cell: ({ row }) => {
          const type = row.original?.policyType;
          return (
            <Chip
              label={POLICY_TYPE_LABELS[type] ?? type ?? '-'}
              size="small"
              variant="light"
              color={type === 'GROUP' ? 'primary' : type === 'CORPORATE' ? 'info' : 'default'}
            />
          );
        }
      },

      // Coverage Period Column
      {
        accessorKey: 'startDate',
        header: 'فترة التغطية',
        size: 200,
        enableSorting: false,
        Cell: ({ row }) => {
          const policy = row.original;
          if (!policy?.startDate && !policy?.endDate) {
            return <Typography variant="body2" color="text.secondary">-</Typography>;
          }
          return (
            <PolicyLifecycleBar
              startDate={policy?.startDate}
              endDate={policy?.endDate}
              size="small"
              showDates={true}
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
          const policy = row.original;
          const expired = isPolicyExpired(policy?.endDate);
          let status = policy?.active ? 'ACTIVE' : 'INACTIVE';
          if (expired) status = 'EXPIRED';
          
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
                onClick={() => handleDelete(row.original?.id, row.original?.name || row.original?.code)}
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
        title="وثائق التأمين"
        subtitle="إدارة ومتابعة وثائق التأمين (البوالص)"
        icon={PolicyIcon}
        breadcrumbs={[{ label: 'الرئيسية', path: '/' }, { label: 'وثائق التأمين' }]}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleNavigateAdd}>
            إضافة وثيقة جديدة
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
          exportFilename="insurance_policies"
          printTitle="تقرير وثائق التأمين"
        />
      </MainCard>
    </Box>
  );
};

export default PoliciesList;
