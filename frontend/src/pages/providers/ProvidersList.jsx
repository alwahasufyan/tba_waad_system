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
  MenuItem
} from '@mui/material';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';
import RBACGuard from 'components/tba/RBACGuard';
import TableSkeleton from 'components/tba/LoadingSkeleton';
import ErrorFallback, { EmptyState } from 'components/tba/ErrorFallback';
import { providersService } from 'services/api';
import { useSnackbar } from 'notistack';

// third-party
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';

// ==============================|| PROVIDERS LIST PAGE ||============================== //

const columnHelper = createColumnHelper();

// Provider Type Options
const PROVIDER_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'HOSPITAL', label: 'Hospital' },
  { value: 'CLINIC', label: 'Clinic' },
  { value: 'PHARMACY', label: 'Pharmacy' },
  { value: 'LABORATORY', label: 'Laboratory' }
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

  // Column definitions
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Provider Name',
        cell: (info) => (
          <Typography variant="body2" fontWeight={500}>
            {info.getValue()}
          </Typography>
        )
      }),
      columnHelper.accessor('providerType', {
        header: 'Type',
        cell: (info) => {
          const type = info.getValue();
          const colorMap = {
            HOSPITAL: 'error',
            CLINIC: 'primary',
            PHARMACY: 'success',
            LABORATORY: 'warning'
          };
          return <Chip label={type || 'N/A'} color={colorMap[type] || 'default'} size="small" />;
        }
      }),
      columnHelper.accessor('licenseNumber', {
        header: 'License Number',
        cell: (info) => (
          <Typography variant="body2" color="text.secondary">
            {info.getValue() || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: (info) => info.getValue() || '-'
      }),
      columnHelper.accessor('address', {
        header: 'Address',
        cell: (info) => (
          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
            {info.getValue() || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('active', {
        header: 'Status',
        cell: (info) => (
          <Chip label={info.getValue() ? 'Active' : 'Inactive'} color={info.getValue() ? 'success' : 'default'} size="small" />
        )
      }),
      columnHelper.accessor('id', {
        header: 'Actions',
        cell: (info) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="View">
              <IconButton size="small" color="primary" onClick={() => handleView(info.getValue())}>
                <EyeOutlined />
              </IconButton>
            </Tooltip>
            <RBACGuard requiredPermission="PROVIDER_UPDATE">
              <Tooltip title="Edit">
                <IconButton size="small" color="primary" onClick={() => handleEdit(info.getValue())}>
                  <EditOutlined />
                </IconButton>
              </Tooltip>
            </RBACGuard>
            <RBACGuard requiredPermission="PROVIDER_DELETE">
              <Tooltip title="Delete">
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
        title="Healthcare Providers"
        content={false}
        secondary={
          <RBACGuard requiredPermission="PROVIDER_CREATE">
            <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleCreate}>
              Add Provider
            </Button>
          </RBACGuard>
        }
      >
        {/* Filters */}
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              placeholder="Search providers by name, license, or phone..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchOutlined style={{ marginRight: 8 }} />
              }}
            />
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Provider Type</InputLabel>
              <Select value={typeFilter} onChange={handleTypeChange} label="Provider Type">
                {PROVIDER_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={handleStatusChange} label="Status">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Loading State */}
        {loading && <TableSkeleton rows={rowsPerPage} columns={7} />}

        {/* Error State */}
        {!loading && error && <ErrorFallback error={error} onRetry={handleRetry} />}

        {/* Empty State */}
        {!loading && !error && providers.length === 0 && (
          <EmptyState
            title="No providers found"
            description={
              searchTerm || typeFilter || statusFilter
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first healthcare provider'
            }
            action={handleCreate}
            actionLabel="Add Provider"
          />
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
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete provider "{selectedProvider?.name}"? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </MainCard>
    </RBACGuard>
  );
}
