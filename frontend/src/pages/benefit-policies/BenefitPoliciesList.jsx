import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Policy as PolicyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import RBACGuard from 'components/tba/RBACGuard';
import DataTable from 'components/tba/DataTable';

import { getBenefitPolicies } from 'services/api/benefit-policies.service';

// ═══════════════════════════════════════════════════════════════════════════
// STATUS CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const STATUS_CONFIG = {
  DRAFT: { label: 'مسودة', color: 'default' },
  ACTIVE: { label: 'نشط', color: 'success' },
  SUSPENDED: { label: 'موقوف', color: 'warning' },
  EXPIRED: { label: 'منتهي', color: 'error' },
  CANCELLED: { label: 'ملغي', color: 'error' }
};

/**
 * Benefit Policies List Page
 * 
 * Features:
 * - Paginated list of all benefit policies
 * - Quick actions: View, Edit
 * - Status indicators
 * - RBAC permission checks
 * 
 * Route: /benefit-policies
 */
const BenefitPoliciesList = () => {
  const navigate = useNavigate();

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'DESC'
  });

  // Fetch policies
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['benefit-policies', pagination],
    queryFn: () => getBenefitPolicies(pagination),
    keepPreviousData: true,
    retry: 1
  });

  // Debug logging - only in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[BenefitPoliciesList] Query state:', {
        isLoading,
        isFetching,
        isError,
        hasData: !!data,
        recordCount: data?.content?.length ?? 0,
        totalElements: data?.totalElements ?? 'N/A'
      });
      if (isError) {
        console.error('[BenefitPoliciesList] Error:', error);
      }
    }
  }, [data, isLoading, isFetching, isError, error]);

  // Transform data for DataTable
  const tableData = useMemo(() => {
    return data?.content || [];
  }, [data]);

  // Table columns (TanStack Table format)
  const columns = useMemo(() => [
    {
      accessorKey: 'policyCode',
      header: 'رمز الوثيقة',
      cell: ({ getValue }) => (
        <Typography variant="body2" fontWeight={500}>
          {getValue()}
        </Typography>
      )
    },
    {
      accessorKey: 'name',
      header: 'اسم الوثيقة'
    },
    {
      accessorKey: 'employerName',
      header: 'صاحب العمل'
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ getValue }) => {
        const status = getValue();
        const config = STATUS_CONFIG[status] || { label: status, color: 'default' };
        return <Chip label={config.label} color={config.color} size="small" />;
      }
    },
    {
      accessorKey: 'startDate',
      header: 'تاريخ البدء',
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? new Date(value).toLocaleDateString('ar-SA') : '-';
      }
    },
    {
      accessorKey: 'endDate',
      header: 'تاريخ الانتهاء',
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? new Date(value).toLocaleDateString('ar-SA') : '-';
      }
    },
    {
      accessorKey: 'defaultCoveragePercent',
      header: 'نسبة التغطية',
      cell: ({ getValue }) => {
        const value = getValue();
        return value !== null && value !== undefined ? `${value}%` : '-';
      }
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="عرض">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/benefit-policies/${row.original.id}`);
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <RBACGuard requiredPermissions={['benefit_policies.update']}>
            <Tooltip title="تعديل">
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/benefit-policies/edit/${row.original.id}`);
                }}
                disabled={row.original.status === 'CANCELLED'}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </RBACGuard>
        </Stack>
      )
    }
  ], [navigate]);

  // Handle row click
  const handleRowClick = useCallback((row) => {
    navigate(`/benefit-policies/${row.id}`);
  }, [navigate]);

  // Handle add button
  const handleAdd = useCallback(() => {
    navigate('/benefit-policies/create');
  }, [navigate]);

  return (
    <RBACGuard requiredPermissions={['benefit_policies.view']}>
      <ModernPageHeader
        title="وثائق المنافع"
        subtitle="إدارة وثائق المنافع التأمينية"
        icon={PolicyIcon}
        breadcrumbs={[
          { label: 'الرئيسية', path: '/dashboard' },
          { label: 'وثائق المنافع', path: '/benefit-policies' }
        ]}
        actions={
          <Stack direction="row" spacing={1}>
            <Tooltip title="تحديث">
              <IconButton onClick={() => refetch()} disabled={isFetching}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <RBACGuard requiredPermissions={['benefit_policies.create']}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAdd}
              >
                إنشاء وثيقة جديدة
              </Button>
            </RBACGuard>
          </Stack>
        }
      />

      {isLoading ? (
        <MainCard>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        </MainCard>
      ) : isError ? (
        <MainCard>
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                إعادة المحاولة
              </Button>
            }
          >
            فشل في تحميل وثائق المنافع: {error?.message || 'خطأ غير معروف'}
          </Alert>
        </MainCard>
      ) : tableData.length === 0 ? (
        <MainCard>
          <Box 
            display="flex" 
            flexDirection="column" 
            justifyContent="center" 
            alignItems="center" 
            minHeight={300}
            sx={{ py: 4 }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              لا توجد وثائق منافع
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              لم يتم إنشاء أي وثائق منافع بعد. يمكنك إنشاء وثيقة جديدة للبدء.
            </Typography>
            <RBACGuard requiredPermissions={['benefit_policies.create']}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAdd}
              >
                إنشاء وثيقة جديدة
              </Button>
            </RBACGuard>
          </Box>
        </MainCard>
      ) : (
        <DataTable
          title="وثائق المنافع"
          data={tableData}
          columns={columns}
          loading={isFetching}
          onRowClick={handleRowClick}
          onAdd={handleAdd}
          addButtonLabel="إنشاء وثيقة جديدة"
          showActions={false}
          enablePagination={true}
          pageSize={20}
        />
      )}
    </RBACGuard>
  );
};

export default BenefitPoliciesList;
