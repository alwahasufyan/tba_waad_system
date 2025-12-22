/**
 * Medical Services List Page - GOLDEN REFERENCE MODULE (TbaDataTable)
 * Phase D2.2/D2.3 - Material React Table + Refresh Contract
 *
 * ⚠️ This is the REFERENCE implementation for all CRUD list pages using TbaDataTable.
 * Pattern: ModernPageHeader → MainCard → TbaDataTable
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
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import TbaDataTable from 'components/tba/TbaDataTable';

// Contexts
import { useTableRefresh } from 'contexts/TableRefreshContext';

// Services
import { getMedicalServices, deleteMedicalService } from 'services/api/medical-services.service';

// ============================================================================
// CONSTANTS
// ============================================================================

const QUERY_KEY = 'medical-services';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format price with LYD currency
 */
const formatPrice = (value) => {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toFixed(2)} د.ل`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MedicalServicesList = () => {
  const navigate = useNavigate();

  // ========================================
  // TABLE REFRESH CONTEXT (Phase D2.3)
  // ========================================

  const { refreshKey, triggerRefresh } = useTableRefresh();

  // ========================================
  // NAVIGATION HANDLERS
  // ========================================

  const handleNavigateAdd = useCallback(() => {
    navigate('/medical-services/add');
  }, [navigate]);

  const handleNavigateView = useCallback(
    (id) => {
      navigate(`/medical-services/${id}`);
    },
    [navigate]
  );

  const handleNavigateEdit = useCallback(
    (id) => {
      navigate(`/medical-services/edit/${id}`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (id, name) => {
      const confirmMessage = `هل أنت متأكد من حذف الخدمة "${name}"؟`;
      if (!window.confirm(confirmMessage)) return;

      try {
        await deleteMedicalService(id);
        // Trigger refresh via context - no page reload needed
        triggerRefresh();
      } catch (err) {
        console.error('[MedicalServices] Delete failed:', err);
        alert('فشل حذف الخدمة. يرجى المحاولة لاحقاً');
      }
    },
    [triggerRefresh]
  );

  // ========================================
  // FETCHER FUNCTION
  // ========================================

  const fetcher = useCallback(async (params) => {
    return getMedicalServices(params);
  }, []);

  // ========================================
  // COLUMN DEFINITIONS
  // ========================================

  const columns = useMemo(
    () => [
      // Code Column
      {
        accessorKey: 'code',
        header: 'الرمز',
        size: 100,
        Cell: ({ row }) => (
          <Typography variant="body2" fontWeight="medium">
            {row.original?.code || '-'}
          </Typography>
        )
      },

      // Arabic Name Column
      {
        accessorKey: 'nameAr',
        header: 'الاسم (عربي)',
        size: 180,
        Cell: ({ row }) => <Typography variant="body2">{row.original?.nameAr || '-'}</Typography>
      },

      // English Name Column
      {
        accessorKey: 'nameEn',
        header: 'الاسم (إنجليزي)',
        size: 180,
        Cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {row.original?.nameEn || '-'}
          </Typography>
        )
      },

      // Category Column
      {
        accessorKey: 'category',
        header: 'التصنيف',
        size: 150,
        enableSorting: false,
        Cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {row.original?.category?.nameAr || row.original?.category?.nameEn || '-'}
          </Typography>
        )
      },

      // Price Column
      {
        accessorKey: 'priceLyd',
        header: 'السعر',
        size: 120,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ row }) => (
          <Typography variant="body2" fontWeight="medium">
            {formatPrice(row.original?.priceLyd)}
          </Typography>
        )
      },

      // Requires Approval Column
      {
        accessorKey: 'requiresApproval',
        header: 'موافقة مسبقة',
        size: 100,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        enableSorting: false,
        Cell: ({ row }) =>
          row.original?.requiresApproval ? (
            <Tooltip title="تتطلب موافقة مسبقة">
              <CheckCircleIcon fontSize="small" color="success" />
            </Tooltip>
          ) : (
            <Tooltip title="لا تتطلب موافقة">
              <CancelIcon fontSize="small" color="disabled" />
            </Tooltip>
          )
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
            label={row.original?.active ? 'نشط' : 'غير نشط'}
            color={row.original?.active ? 'success' : 'default'}
            size="small"
            variant="light"
          />
        )
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
                onClick={() => handleDelete(row.original?.id, row.original?.nameAr || row.original?.code)}
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
        title="الخدمات الطبية"
        subtitle="إدارة الخدمات الطبية في النظام"
        icon={MedicalServicesIcon}
        breadcrumbs={[{ label: 'الرئيسية', path: '/' }, { label: 'الخدمات الطبية' }]}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleNavigateAdd}>
            إضافة خدمة جديدة
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
          exportFilename="medical_services"
          printTitle="تقرير الخدمات الطبية"
        />
      </MainCard>
    </Box>
  );
};

export default MedicalServicesList;
