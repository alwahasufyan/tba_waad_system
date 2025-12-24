/**
 * Provider Contracts List Page
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Displays a table of all provider contracts with:
 * - Provider Name
 * - Contract Code
 * - Status (Active/Expired/Draft/Suspended)
 * - Start/End Dates
 * - Pricing Items Count
 * - Actions (View, Edit)
 * 
 * Uses REAL Backend API via provider-contracts.service.js
 * 
 * Route: /provider-contracts
 * @version 2.0.0
 * @lastUpdated 2024-12-24
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Description as ContractIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Business as ProviderIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import RBACGuard from 'components/tba/RBACGuard';
import DataTable from 'components/tba/DataTable';

// API Service
import {
  getProviderContracts,
  searchProviderContracts,
  getProviderContractStats,
  CONTRACT_STATUS,
  CONTRACT_STATUS_CONFIG,
  PRICING_MODEL_CONFIG
} from 'services/api/provider-contracts.service';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'جميع الحالات' },
  { value: CONTRACT_STATUS.ACTIVE, label: 'نشط' },
  { value: CONTRACT_STATUS.DRAFT, label: 'مسودة' },
  { value: CONTRACT_STATUS.EXPIRED, label: 'منتهي' },
  { value: CONTRACT_STATUS.SUSPENDED, label: 'موقوف' },
  { value: CONTRACT_STATUS.TERMINATED, label: 'ملغي' }
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Statistics Card
 */
const StatCard = ({ title, value, color = 'primary', icon: Icon, loading }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      textAlign: 'center',
      backgroundColor: `${color}.lighter`,
      borderRadius: 2,
      border: '1px solid',
      borderColor: `${color}.light`
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
      {Icon && <Icon sx={{ color: `${color}.main`, fontSize: 24 }} />}
      {loading ? (
        <CircularProgress size={24} color={color} />
      ) : (
        <Typography variant="h4" color={`${color}.main`} fontWeight="bold">
          {value ?? 0}
        </Typography>
      )}
    </Stack>
    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
      {title}
    </Typography>
  </Paper>
);

/**
 * Format date for display
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const ProviderContractsList = () => {
  const navigate = useNavigate();

  // ─────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DATA FETCHING (Real API)
  // ─────────────────────────────────────────────────────────────────────────

  // Fetch contracts
  const {
    data: contractsData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['provider-contracts', pagination, statusFilter, searchQuery],
    queryFn: () => {
      const params = {
        page: pagination.page,
        size: pagination.size
      };
      
      // Use search endpoint if query or status filter is set
      if (searchQuery || statusFilter !== 'ALL') {
        return searchProviderContracts({
          ...params,
          q: searchQuery || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined
        });
      }
      
      return getProviderContracts(params);
    },
    keepPreviousData: true,
    retry: 1,
    staleTime: 30000 // 30 seconds
  });

  // Fetch statistics
  const {
    data: stats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['provider-contracts-stats'],
    queryFn: getProviderContractStats,
    staleTime: 60000 // 1 minute
  });

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[ProviderContractsList] Query state:', {
        isLoading,
        isFetching,
        isError,
        hasData: !!contractsData,
        recordCount: contractsData?.content?.length ?? 0,
        totalElements: contractsData?.totalElements ?? 'N/A'
      });
      if (isError) {
        console.error('[ProviderContractsList] Error:', error);
      }
    }
  }, [contractsData, isLoading, isFetching, isError, error]);

  const tableData = useMemo(() => contractsData?.content || [], [contractsData]);

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  const handleView = useCallback((id) => {
    navigate(`/provider-contracts/${id}`);
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleStatusFilterChange = useCallback((event) => {
    setStatusFilter(event.target.value);
    setPagination(prev => ({ ...prev, page: 0 }));
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
    setPagination(prev => ({ ...prev, page: 0 }));
  }, []);

  const handleAdd = useCallback(() => {
    navigate('/provider-contracts/create');
  }, [navigate]);

  // ─────────────────────────────────────────────────────────────────────────
  // TABLE COLUMNS
  // ─────────────────────────────────────────────────────────────────────────

  const columns = useMemo(() => [
    {
      accessorKey: 'contractCode',
      header: 'رمز العقد',
      cell: ({ getValue }) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {getValue()}
        </Typography>
      )
    },
    {
      accessorKey: 'provider',
      header: 'مقدم الخدمة',
      cell: ({ row }) => (
        <Stack spacing={0}>
          <Typography variant="body2" fontWeight={500}>
            {row.original?.providerName || row.original?.provider?.nameAr || '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.original?.provider?.city || ''}
          </Typography>
        </Stack>
      )
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ getValue }) => {
        const status = getValue();
        const config = CONTRACT_STATUS_CONFIG[status] || { label: status, color: 'default' };
        return <Chip label={config.label} color={config.color} size="small" />;
      }
    },
    {
      accessorKey: 'pricingModel',
      header: 'نموذج التسعير',
      cell: ({ getValue }) => {
        const model = getValue();
        const config = PRICING_MODEL_CONFIG[model] || { label: model };
        return (
          <Typography variant="body2" color="text.secondary">
            {config.label}
          </Typography>
        );
      }
    },
    {
      accessorKey: 'discountPercent',
      header: 'نسبة الخصم',
      cell: ({ getValue }) => {
        const value = getValue();
        return value !== null && value !== undefined ? (
          <Chip 
            label={`${value}%`} 
            size="small" 
            variant="outlined"
            color="info"
          />
        ) : '-';
      }
    },
    {
      accessorKey: 'startDate',
      header: 'تاريخ البدء',
      cell: ({ getValue }) => (
        <Typography variant="body2">
          {formatDate(getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'endDate',
      header: 'تاريخ الانتهاء',
      cell: ({ getValue }) => (
        <Typography variant="body2">
          {formatDate(getValue())}
        </Typography>
      )
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="عرض التفاصيل">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleView(row.original.id);
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <RBACGuard requiredPermissions={['provider_contracts.update']}>
            <Tooltip title="تعديل">
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/provider-contracts/edit/${row.original.id}`);
                }}
                disabled={row.original.status === 'TERMINATED'}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </RBACGuard>
        </Stack>
      )
    }
  ], [handleView, navigate]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <RBACGuard requiredPermissions={['provider_contracts.view']}>
      {/* Page Header */}
      <ModernPageHeader
        title="عقود مقدمي الخدمة"
        subtitle="إدارة عقود التسعير مع مقدمي الخدمات الصحية"
        icon={ContractIcon}
        breadcrumbs={[
          { label: 'الرئيسية', path: '/dashboard' },
          { label: 'عقود مقدمي الخدمة', path: '/provider-contracts' }
        ]}
        actions={
          <Stack direction="row" spacing={1}>
            <Tooltip title="تحديث البيانات">
              <IconButton onClick={handleRefresh} disabled={isFetching}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <RBACGuard requiredPermissions={['provider_contracts.create']}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAdd}
              >
                إنشاء عقد جديد
              </Button>
            </RBACGuard>
          </Stack>
        }
      />

      {/* Statistics Cards */}
      <Box sx={{ mb: 3 }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box sx={{ flex: 1 }}>
            <StatCard 
              title="إجمالي العقود" 
              value={stats?.totalContracts} 
              color="primary"
              icon={ContractIcon}
              loading={statsLoading}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <StatCard 
              title="عقود نشطة" 
              value={stats?.activeContracts} 
              color="success"
              icon={ProviderIcon}
              loading={statsLoading}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <StatCard 
              title="مسودات" 
              value={stats?.draftContracts} 
              color="warning"
              icon={EditIcon}
              loading={statsLoading}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <StatCard 
              title="منتهية" 
              value={stats?.expiredContracts} 
              color="error"
              icon={CalendarIcon}
              loading={statsLoading}
            />
          </Box>
        </Stack>
      </Box>

      {/* Filters */}
      <MainCard sx={{ mb: 2 }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          alignItems="center"
        >
          <TextField
            placeholder="بحث بالرمز أو اسم مقدم الخدمة..."
            value={searchQuery}
            onChange={handleSearchChange}
            size="small"
            sx={{ minWidth: 280 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>حالة العقد</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="حالة العقد"
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon color="action" fontSize="small" />
                </InputAdornment>
              }
            >
              {STATUS_FILTER_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ flex: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {contractsData?.totalElements ?? tableData.length} عقد
          </Typography>
        </Stack>
      </MainCard>

      {/* Content */}
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
            فشل في تحميل عقود مقدمي الخدمة: {error?.message || 'خطأ غير معروف'}
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
            <ContractIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              لا توجد عقود
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchQuery || statusFilter !== 'ALL' 
                ? 'لم يتم العثور على عقود تطابق معايير البحث'
                : 'لم يتم إنشاء أي عقود بعد. يمكنك إنشاء عقد جديد للبدء.'
              }
            </Typography>
            <RBACGuard requiredPermissions={['provider_contracts.create']}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAdd}
              >
                إنشاء عقد جديد
              </Button>
            </RBACGuard>
          </Box>
        </MainCard>
      ) : (
        <DataTable
          title="قائمة العقود"
          data={tableData}
          columns={columns}
          loading={isFetching}
          onRowClick={(row) => handleView(row.id)}
          showActions={false}
          enablePagination={true}
          pageSize={pagination.size}
        />
      )}
    </RBACGuard>
  );
};

export default ProviderContractsList;
