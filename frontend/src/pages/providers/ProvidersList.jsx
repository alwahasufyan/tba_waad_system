import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TablePagination,
  Tooltip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import { 
  DeleteOutlined, 
  EditOutlined, 
  PlusOutlined, 
  SearchOutlined, 
  EyeOutlined,
  MedicineBoxOutlined,
  BankOutlined,
  ExperimentOutlined,
  ShopOutlined
} from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';
import RBACGuard from 'components/tba/RBACGuard';
import TableSkeleton from 'components/tba/LoadingSkeleton';
import ErrorFallback, { EmptyState } from 'components/tba/ErrorFallback';
import { providersService } from 'services/api';
import { useSnackbar } from 'notistack';

// Insurance UX Components - Phase B2 Step 6
import { NetworkBadge, CardStatusBadge } from 'components/insurance';

// third-party
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';

// ============ PROVIDER CONFIGURATION ============
// Provider Type Labels (Arabic)
const PROVIDER_TYPE_LABELS_AR = {
  HOSPITAL: 'مستشفى',
  CLINIC: 'عيادة',
  LAB: 'مختبر',
  LABORATORY: 'مختبر',
  PHARMACY: 'صيدلية',
  RADIOLOGY: 'مركز أشعة'
};

// Provider Type Icons
const PROVIDER_TYPE_ICONS = {
  HOSPITAL: BankOutlined,
  CLINIC: MedicineBoxOutlined,
  LAB: ExperimentOutlined,
  LABORATORY: ExperimentOutlined,
  PHARMACY: ShopOutlined,
  RADIOLOGY: ExperimentOutlined
};

// Status Labels (Arabic)
const STATUS_LABELS_AR = {
  ACTIVE: 'نشط',
  INACTIVE: 'غير نشط',
  SUSPENDED: 'موقوف',
  EXPIRED: 'منتهي'
};

// Network Status mapping
const getNetworkTier = (provider) => {
  // Check various possible field names for network status
  if (provider?.networkStatus) return provider.networkStatus;
  if (provider?.inNetwork === true) return 'IN_NETWORK';
  if (provider?.inNetwork === false) return 'OUT_OF_NETWORK';
  if (provider?.contracted === true) return 'IN_NETWORK';
  if (provider?.contracted === false) return 'OUT_OF_NETWORK';
  return null; // Unknown
};

// Get provider status
const getProviderStatus = (provider) => {
  if (provider?.status) return provider.status;
  if (provider?.active === true) return 'ACTIVE';
  if (provider?.active === false) return 'INACTIVE';
  return 'ACTIVE'; // Default
};

// ==============================|| PROVIDERS LIST PAGE ||============================== //

const columnHelper = createColumnHelper();

// Provider Type Options (Arabic)
const PROVIDER_TYPES = [
  { value: '', label: 'جميع الأنواع' },
  { value: 'HOSPITAL', label: 'مستشفى' },
  { value: 'CLINIC', label: 'عيادة' },
  { value: 'PHARMACY', label: 'صيدلية' },
  { value: 'LAB', label: 'مختبر' },
  { value: 'LABORATORY', label: 'مختبر' },
  { value: 'RADIOLOGY', label: 'مركز أشعة' }
];

export default function ProvidersList() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // State
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  // Column definitions with Arabic labels and Insurance UX components
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'اسم مقدم الخدمة',
        cell: (info) => {
          const provider = info.row.original;
          const name = provider?.name ?? provider?.nameArabic ?? provider?.nameEnglish ?? '—';
          const TypeIcon = PROVIDER_TYPE_ICONS[provider?.providerType] || MedicineBoxOutlined;
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <TypeIcon style={{ fontSize: 16, color: '#8c8c8c' }} />
              <Typography variant="body2" fontWeight={500}>
                {name}
              </Typography>
            </Stack>
          );
        }
      }),
      columnHelper.accessor('providerType', {
        header: 'نوع مقدم الخدمة',
        cell: (info) => {
          const type = info.getValue();
          const colorMap = {
            HOSPITAL: 'error',
            CLINIC: 'primary',
            PHARMACY: 'success',
            LAB: 'warning',
            LABORATORY: 'warning',
            RADIOLOGY: 'info'
          };
          return (
            <Chip 
              label={PROVIDER_TYPE_LABELS_AR[type] ?? type ?? '—'} 
              color={colorMap[type] || 'default'} 
              size="small" 
              variant="outlined"
            />
          );
        }
      }),
      columnHelper.accessor('licenseNumber', {
        header: 'رقم الترخيص',
        cell: (info) => (
          <Typography variant="body2" color="text.secondary">
            {info.getValue() ?? '—'}
          </Typography>
        )
      }),
      columnHelper.accessor((row) => row, {
        id: 'networkStatus',
        header: 'حالة الشبكة',
        cell: (info) => {
          const provider = info.getValue();
          const networkTier = getNetworkTier(provider);
          if (!networkTier) {
            return <Typography variant="body2" color="text.secondary">—</Typography>;
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
      }),
      columnHelper.accessor('phone', {
        header: 'رقم الهاتف',
        cell: (info) => (
          <Typography variant="body2">
            {info.getValue() ?? '—'}
          </Typography>
        )
      }),
      columnHelper.accessor((row) => row, {
        id: 'status',
        header: 'الحالة',
        cell: (info) => {
          const provider = info.getValue();
          const status = getProviderStatus(provider);
          return (
            <CardStatusBadge
              status={status}
              customLabel={STATUS_LABELS_AR[status] ?? 'غير محدد'}
              size="small"
              variant="chip"
            />
          );
        }
      }),
      columnHelper.accessor('id', {
        header: 'الإجراءات',
        cell: (info) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="عرض التفاصيل">
              <IconButton size="small" color="primary" onClick={() => handleView(info.getValue())}>
                <EyeOutlined />
              </IconButton>
            </Tooltip>
            <RBACGuard requiredPermission="PROVIDER_UPDATE">
              <Tooltip title="تعديل">
                <IconButton size="small" color="primary" onClick={() => handleEdit(info.getValue())}>
                  <EditOutlined />
                </IconButton>
              </Tooltip>
            </RBACGuard>
            <RBACGuard requiredPermission="PROVIDER_DELETE">
              <Tooltip title="حذف">
                <IconButton size="small" color="error" onClick={() => openDeleteDialog(info.row.original)}>
                  <DeleteOutlined />
                </IconButton>
              </Tooltip>
            </RBACGuard>
          </Stack>
        )
      })
    ],
    []
  );

  // Load providers
  const loadProviders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await providersService.getAll({
        page,
        size: rowsPerPage,
        search: searchTerm
      });

      setProviders(result.items || []);
      setTotalElements(result.total || 0);
    } catch (err) {
      const errorMessage = err.message || 'فشل تحميل المزودين';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, enqueueSnackbar]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  // Handlers
  const handleRetry = () => {
    loadProviders();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleTypeChange = (event) => {
    setTypeFilter(event.target.value);
    setPage(0);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleCreate = () => {
    navigate('/providers/create');
  };

  const handleView = (id) => {
    navigate(`/providers/view/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/providers/edit/${id}`);
  };

  const openDeleteDialog = (provider) => {
    setSelectedProvider(provider);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProvider) return;

    try {
      await providersService.remove(selectedProvider.id);
      enqueueSnackbar('تم حذف المزود بنجاح', { variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedProvider(null);
      loadProviders();
    } catch (err) {
      enqueueSnackbar(err.message || 'فشل حذف المزود', { variant: 'error' });
    }
  };

  // React Table initialization
  const table = useReactTable({
    data: providers,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <RBACGuard requiredPermission="PROVIDER_READ">
      <MainCard
        title={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <MedicineBoxOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <Typography variant="h4">إدارة مقدمي الخدمات الصحية</Typography>
          </Stack>
        }
        content={false}
        secondary={
          <RBACGuard requiredPermission="PROVIDER_CREATE">
            <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleCreate}>
              إضافة مقدم خدمة
            </Button>
          </RBACGuard>
        }
      >
        {/* Filters */}
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              placeholder="بحث باسم مقدم الخدمة، رقم الترخيص، أو رقم الهاتف..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchOutlined style={{ marginLeft: 8, color: '#8c8c8c' }} />
              }}
            />
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>نوع مقدم الخدمة</InputLabel>
              <Select value={typeFilter} onChange={handleTypeChange} label="نوع مقدم الخدمة">
                {PROVIDER_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>الحالة</InputLabel>
              <Select value={statusFilter} onChange={handleStatusChange} label="الحالة">
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="true">نشط</MenuItem>
                <MenuItem value="false">غير نشط</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Loading State */}
        {loading && <TableSkeleton rows={rowsPerPage} columns={7} />}

        {/* Error State */}
        {!loading && error && <ErrorFallback error={error} onRetry={handleRetry} />}

        {/* Empty State */}
        {!loading && !error && (!Array.isArray(providers) || providers.length === 0) && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Stack spacing={2} alignItems="center">
              <MedicineBoxOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
              <Typography variant="h6" color="text.secondary">
                لا يوجد مقدمو خدمة صحية مسجلون حاليًا
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || typeFilter || statusFilter
                  ? 'جرب تعديل معايير البحث أو التصفية'
                  : 'اضغط على "إضافة مقدم خدمة" للبدء'}
              </Typography>
              <RBACGuard requiredPermission="PROVIDER_CREATE">
                <Button
                  variant="outlined"
                  startIcon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  إضافة مقدم خدمة
                </Button>
              </RBACGuard>
            </Stack>
          </Box>
        )}

        {/* Data Table */}
        {!loading && !error && providers.length > 0 && (
          <>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          style={{
                            padding: '16px',
                            textAlign: 'left',
                            borderBottom: '1px solid #e0e0e0',
                            fontWeight: 600,
                            backgroundColor: '#fafafa'
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          style={{
                            padding: '16px'
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={totalElements}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>تأكيد الحذف</DialogTitle>
          <DialogContent>
            <DialogContentText>
              هل أنت متأكد من حذف مقدم الخدمة "{selectedProvider?.name ?? selectedProvider?.nameArabic ?? '—'}"?
              هذا الإجراء لا يمكن التراجع عنه.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              حذف
            </Button>
          </DialogActions>
        </Dialog>
      </MainCard>
    </RBACGuard>
  );
}
