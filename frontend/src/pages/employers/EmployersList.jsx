/**
 * Employers List Page - Phase D2.4 (TbaDataTable Pattern)
 * Cloned from Medical Services Golden Reference
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
import BusinessIcon from '@mui/icons-material/Business';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import TbaDataTable from 'components/tba/TbaDataTable';
import TableErrorBoundary from 'components/TableErrorBoundary';
import PermissionGuard from 'components/PermissionGuard';

// Contexts
import { useTableRefresh } from 'contexts/TableRefreshContext';

// Services
import { getEmployers, deleteEmployer } from 'services/api/employers.service';

// ============================================================================
// CONSTANTS
// ============================================================================

const QUERY_KEY = 'employers';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const EmployersList = () => {
  const navigate = useNavigate();

  // ========================================
  // TABLE REFRESH CONTEXT (Phase D2.3)
  // ========================================

  const { refreshKey, triggerRefresh } = useTableRefresh();

  // ========================================
  // NAVIGATION HANDLERS
  // ========================================

  const handleNavigateAdd = useCallback(() => {
    navigate('/employers/create');
  }, [navigate]);

  const handleNavigateView = useCallback(
    (id) => {
      navigate(`/employers/${id}`);
    },
    [navigate]
  );

  const handleNavigateEdit = useCallback(
    (id) => {
      navigate(`/employers/edit/${id}`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (id, name) => {
      const confirmMessage = `هل أنت متأكد من حذف صاحب العمل "${name}"؟`;
      if (!window.confirm(confirmMessage)) return;

      try {
        await deleteEmployer(id);
        // Trigger refresh via context - no page reload needed
        triggerRefresh();
      } catch (err) {
        console.error('[Employers] Delete failed:', err);
        alert('فشل حذف صاحب العمل. يرجى المحاولة لاحقاً');
      }
    },
    [triggerRefresh]
  );

  // ========================================
  // FETCHER FUNCTION
  // ========================================

  const fetcher = useCallback(async (params) => {
    // getEmployers returns array, wrap in pagination format for TbaDataTable
    const data = await getEmployers();
    // If backend returns array, wrap it for TbaDataTable
    if (Array.isArray(data)) {
      return {
        items: data,
        total: data.length,
        page: 1,
        size: data.length
      };
    }
    return data;
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
          <Chip
            label={row.original?.code || row.original?.employerCode || '-'}
            size="small"
            variant="outlined"
            color="primary"
          />
        )
      },

      // Arabic Name Column
      {
        accessorKey: 'nameAr',
        header: 'الاسم (عربي)',
        size: 180,
        Cell: ({ row }) => (
          <Typography variant="body2" fontWeight={500}>
            {row.original?.nameAr || '-'}
          </Typography>
        )
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

      // Phone Column
      {
        accessorKey: 'phone',
        header: 'الهاتف',
        size: 130,
        Cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary" dir="ltr">
            {row.original?.phone || row.original?.contactPhone || '-'}
          </Typography>
        )
      },

      // Email Column
      {
        accessorKey: 'email',
        header: 'البريد الإلكتروني',
        size: 180,
        Cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary" dir="ltr">
            {row.original?.email || row.original?.contactEmail || '-'}
          </Typography>
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
              <PermissionGuard requires="employers.delete">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(row.original?.id, row.original?.nameAr || row.original?.code)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </PermissionGuard>
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
        title="أصحاب العمل"
        subtitle="إدارة أصحاب العمل ومعلوماتهم"
        icon={BusinessIcon}
        breadcrumbs={[{ label: 'الرئيسية', path: '/' }, { label: 'أصحاب العمل' }]}
        actions={
          <PermissionGuard requires="employers.create">
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleNavigateAdd}>
              إضافة صاحب عمل
            </Button>
          </PermissionGuard>
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
            exportFilename="employers"
            printTitle="تقرير أصحاب العمل"
          />
        </TableErrorBoundary>
      </MainCard>
    </Box>
  );
};

export default EmployersList;
