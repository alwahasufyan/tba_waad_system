/**
 * Members List Page - Phase D2.4 (TbaDataTable Pattern)
 * Insurance Members (Principals and Dependents)
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
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import UploadFileIcon from '@mui/icons-material/UploadFile';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import TbaDataTable from 'components/tba/TbaDataTable';

// Insurance UX Components - Phase B2
import { MemberTypeIndicator, CardStatusBadge } from 'components/insurance';

// Contexts
import { useTableRefresh } from 'contexts/TableRefreshContext';

// Services
import { getMembers, deleteMember } from 'services/api/members.service';

// ============================================================================
// CONSTANTS
// ============================================================================

const QUERY_KEY = 'members';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MembersList = () => {
  const navigate = useNavigate();

  // ========================================
  // TABLE REFRESH CONTEXT (Phase D2.3)
  // ========================================

  const { refreshKey, triggerRefresh } = useTableRefresh();

  // ========================================
  // NAVIGATION HANDLERS
  // ========================================

  const handleNavigateAdd = useCallback(() => {
    navigate('/members/add');
  }, [navigate]);

  const handleNavigateImport = useCallback(() => {
    navigate('/members/import');
  }, [navigate]);

  const handleNavigateView = useCallback(
    (id) => {
      navigate(`/members/${id}`);
    },
    [navigate]
  );

  const handleNavigateEdit = useCallback(
    (id) => {
      navigate(`/members/edit/${id}`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (id, name) => {
      const confirmMessage = `هل أنت متأكد من حذف العضو "${name}"؟`;
      if (!window.confirm(confirmMessage)) return;

      try {
        await deleteMember(id);
        // Trigger refresh via context - no page reload needed
        triggerRefresh();
      } catch (err) {
        console.error('[Members] Delete failed:', err);
        alert('فشل حذف العضو. يرجى المحاولة لاحقاً');
      }
    },
    [triggerRefresh]
  );

  // ========================================
  // FETCHER FUNCTION
  // ========================================

  const fetcher = useCallback(async (params) => {
    return getMembers(params);
  }, []);

  // ========================================
  // COLUMN DEFINITIONS
  // ========================================

  const columns = useMemo(
    () => [
      // ID Column
      {
        accessorKey: 'id',
        header: 'رقم',
        size: 70,
        Cell: ({ row }) => (
          <Typography variant="body2" fontWeight="medium">
            {row.original?.id || '-'}
          </Typography>
        )
      },

      // Full Name Column
      {
        accessorKey: 'fullNameArabic',
        header: 'الاسم الكامل',
        size: 180,
        Cell: ({ row }) => (
          <Typography variant="body2" fontWeight={500}>
            {row.original?.fullNameArabic || row.original?.fullNameEnglish || '-'}
          </Typography>
        )
      },

      // Member Type Column
      {
        accessorKey: 'memberType',
        header: 'نوع العضو',
        size: 120,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        enableSorting: false,
        Cell: ({ row }) => (
          <MemberTypeIndicator
            memberType={row.original?.memberType || 'PRINCIPAL'}
            size="small"
            language="ar"
          />
        )
      },

      // Civil ID Column
      {
        accessorKey: 'civilId',
        header: 'رقم الهوية',
        size: 130,
        Cell: ({ row }) => (
          <Typography variant="body2" fontFamily="monospace" color="text.secondary">
            {row.original?.civilId || '-'}
          </Typography>
        )
      },

      // Employer Column
      {
        accessorKey: 'employerName',
        header: 'صاحب العمل',
        size: 150,
        enableSorting: false,
        Cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {row.original?.employerName || row.original?.employerNameAr || '-'}
          </Typography>
        )
      },

      // Policy Number Column
      {
        accessorKey: 'policyNumber',
        header: 'رقم البوليصة',
        size: 130,
        Cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {row.original?.policyNumber || '-'}
          </Typography>
        )
      },

      // Phone Column
      {
        accessorKey: 'phone',
        header: 'الهاتف',
        size: 130,
        enableSorting: false,
        Cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary" dir="ltr">
            {row.original?.phone || row.original?.mobilePhone || '-'}
          </Typography>
        )
      },

      // Card Status Column
      {
        accessorKey: 'cardStatus',
        header: 'حالة البطاقة',
        size: 120,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => (
          <CardStatusBadge
            status={row.original?.cardStatus || 'ACTIVE'}
            size="small"
            language="ar"
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
                onClick={() => handleDelete(row.original?.id, row.original?.fullNameArabic || row.original?.civilId)}
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
        title="الأعضاء"
        subtitle="إدارة أعضاء التأمين"
        icon={PeopleAltIcon}
        breadcrumbs={[{ label: 'الرئيسية', path: '/' }, { label: 'الأعضاء' }]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={handleNavigateImport}>
              استيراد من Excel
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleNavigateAdd}>
              إضافة عضو جديد
            </Button>
          </Stack>
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
          exportFilename="members"
          printTitle="تقرير الأعضاء"
        />
      </MainCard>
    </Box>
  );
};

export default MembersList;
