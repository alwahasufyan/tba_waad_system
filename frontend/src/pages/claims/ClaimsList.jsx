/**
 * Claims List Page - Phase D2.4 (TbaDataTable Pattern)
 * Insurance Claims Management
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
import { Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';

// MUI Icons - Always as Component, NEVER as JSX
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import TbaDataTable from 'components/tba/TbaDataTable';
import TableErrorBoundary from 'components/TableErrorBoundary';
import PermissionGuard from 'components/PermissionGuard';

// Insurance UX Components - Phase B2
import { CardStatusBadge } from 'components/insurance';

// Contexts
import { useTableRefresh } from 'contexts/TableRefreshContext';

// Services
import { claimsService } from 'services/api/claims.service';
import { normalizePaginatedResponse } from 'utils/api-response-normalizer';

// ============================================================================
// CONSTANTS
// ============================================================================

const QUERY_KEY = 'claims';

// Claim Status Mapping for CardStatusBadge
const CLAIM_STATUS_MAP = {
  PENDING_REVIEW: 'PENDING',
  PREAPPROVED: 'ACTIVE',
  APPROVED: 'ACTIVE',
  PARTIALLY_APPROVED: 'ACTIVE',
  REJECTED: 'BLOCKED',
  RETURNED_FOR_INFO: 'SUSPENDED',
  CANCELLED: 'INACTIVE',
  SETTLED: 'ACTIVE'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format currency with LYD
 */
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toLocaleString('ar-LY')} د.ل`;
};

/**
 * Format date for display
 */
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ar-SA');
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ClaimsList = () => {
  const navigate = useNavigate();

  // ========================================
  // TABLE REFRESH CONTEXT (Phase D2.3)
  // ========================================

  const { refreshKey, triggerRefresh } = useTableRefresh();

  // ========================================
  // NAVIGATION HANDLERS
  // ========================================

  const handleNavigateAdd = useCallback(() => {
    navigate('/claims/add');
  }, [navigate]);

  const handleNavigateView = useCallback(
    (id) => {
      navigate(`/claims/${id}`);
    },
    [navigate]
  );

  const handleNavigateEdit = useCallback(
    (id) => {
      navigate(`/claims/edit/${id}`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (id) => {
      const confirmMessage = `هل أنت متأكد من حذف هذه المطالبة؟`;
      if (!window.confirm(confirmMessage)) return;

      try {
        await claimsService.remove(id);
        // Trigger refresh via context - no page reload needed
        triggerRefresh();
      } catch (err) {
        console.error('[Claims] Delete failed:', err);
        alert('فشل حذف المطالبة. يرجى المحاولة لاحقاً');
      }
    },
    [triggerRefresh]
  );

  // ========================================
  // FETCHER FUNCTION
  // ========================================

  const fetcher = useCallback(async (params) => {
    const data = await claimsService.getAll(params);
    // Use normalizer to handle all response formats safely
    return normalizePaginatedResponse(data);
  }, []);

  // ========================================
  // COLUMN DEFINITIONS
  // ========================================

  const columns = useMemo(
    () => [
      // ID Column
      {
        accessorKey: 'id',
        header: '#',
        size: 70,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => (
          <Typography variant="subtitle2">
            {row.original?.id ?? '-'}
          </Typography>
        )
      },

      // Member Column
      {
        accessorKey: 'memberFullNameArabic',
        header: 'المؤمَّن عليه',
        size: 180,
        Cell: ({ row }) => {
          const claim = row.original;
          return (
            <Box>
              <Typography variant="body2">
                {claim?.memberFullNameArabic ?? claim?.memberFullNameEnglish ?? '-'}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                {claim?.memberCivilId ?? '-'}
              </Typography>
            </Box>
          );
        }
      },

      // Insurance Company Column
      {
        accessorKey: 'companyName',
        header: 'شركة التأمين',
        size: 150,
        Cell: ({ row }) => (
          <Typography variant="body2">
            {row.original?.companyName ?? '-'}
          </Typography>
        )
      },

      // Provider Column
      {
        accessorKey: 'providerName',
        header: 'مقدم الخدمة',
        size: 150,
        Cell: ({ row }) => (
          <Typography variant="body2">
            {row.original?.providerName ?? '-'}
          </Typography>
        )
      },

      // Visit Date Column
      {
        accessorKey: 'visitDate',
        header: 'تاريخ الزيارة',
        size: 120,
        Cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {formatDate(row.original?.visitDate)}
          </Typography>
        )
      },

      // Requested Amount Column
      {
        accessorKey: 'requestedAmount',
        header: 'المبلغ المطلوب',
        size: 130,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ row }) => (
          <Typography variant="body2" fontWeight={500}>
            {formatCurrency(row.original?.requestedAmount)}
          </Typography>
        )
      },

      // Approved Amount Column
      {
        accessorKey: 'approvedAmount',
        header: 'المبلغ الموافق',
        size: 130,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ row }) => (
          <Typography variant="body2" fontWeight={500} color="success.main">
            {formatCurrency(row.original?.approvedAmount)}
          </Typography>
        )
      },

      // Status Column
      {
        accessorKey: 'status',
        header: 'الحالة',
        size: 120,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => {
          const status = row.original?.status;
          const mappedStatus = CLAIM_STATUS_MAP[status] || status || 'PENDING';
          return (
            <CardStatusBadge
              status={mappedStatus}
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
                onClick={() => handleDelete(row.original?.id)}
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
        title="المطالبات"
        subtitle="إدارة ومتابعة مطالبات التأمين"
        icon={ReceiptIcon}
        breadcrumbs={[{ label: 'الرئيسية', path: '/' }, { label: 'المطالبات' }]}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleNavigateAdd}>
            إضافة مطالبة
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
            exportFilename="claims"
            printTitle="تقرير المطالبات"
          />
        </TableErrorBoundary>
      </MainCard>
    </Box>
  );
};

export default ClaimsList;
