import { useState, useEffect, useMemo } from 'react';
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
  Tooltip,
  Typography,
  TablePagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon
} from '@mui/icons-material';

// project imports
import MainCard from 'components/MainCard';
import RBACGuard from 'components/tba/RBACGuard';
import TableSkeleton from 'components/tba/LoadingSkeleton';
import ErrorFallback, { EmptyState } from 'components/tba/ErrorFallback';
// TODO: Create policies.service.js in services/api folder
const policiesService = {
  getAll: async () => [],
  getById: async () => null,
  create: async () => null,
  update: async () => null,
  remove: async () => null
};
import { EMPLOYERS, INSURANCE_COMPANY } from 'constants/companies';
import { useSnackbar } from 'notistack';

// third-party
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';

// ==============================|| POLICIES LIST PAGE ||============================== //

const columnHelper = createColumnHelper();

// Status options
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

export default function PoliciesList() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [employerFilter, setEmployerFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState(null);

  // Define table columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('policyNumber', {
        header: 'Policy Number',
        cell: (info) => (
          <Typography variant="body2" fontWeight={500} color="primary">
            {info.getValue()}
          </Typography>
        )
      }),
      columnHelper.accessor('employerName', {
        header: 'Employer',
        cell: (info) => <Typography variant="body2">{info.getValue() || '-'}</Typography>
      }),
      columnHelper.accessor('insuranceCompanyName', {
        header: 'Insurance Company',
        cell: (info) => <Typography variant="body2">{info.getValue() || INSURANCE_COMPANY.name}</Typography>
      }),
      columnHelper.accessor('startDate', {
        header: 'Start Date',
        cell: (info) => {
          const value = info.getValue();
          return value ? new Date(value).toLocaleDateString('en-GB') : '-';
        }
      }),
      columnHelper.accessor('endDate', {
        header: 'End Date',
        cell: (info) => {
          const value = info.getValue();
          return value ? new Date(value).toLocaleDateString('en-GB') : '-';
        }
      }),
      columnHelper.accessor('active', {
        header: 'Status',
        cell: (info) => (
          <Chip label={info.getValue() ? 'Active' : 'Inactive'} color={info.getValue() ? 'success' : 'default'} size="small" />
        )
      }),
      columnHelper.accessor('maxMembers', {
        header: 'Max Members',
        cell: (info) => <Typography variant="body2">{info.getValue() || '-'}</Typography>
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <Tooltip title="View">
              <IconButton size="small" color="primary" onClick={() => handleViewPolicy(info.row.original.id)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <RBACGuard permission="POLICY_UPDATE">
              <Tooltip title="Edit">
                <IconButton size="small" color="primary" onClick={() => handleEditPolicy(info.row.original.id)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </RBACGuard>
            <RBACGuard permission="POLICY_DELETE">
              <Tooltip title="Delete">
                <IconButton size="small" color="error" onClick={() => handleDeleteClick(info.row.original)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </RBACGuard>
          </Stack>
        )
      })
    ],
    []
  );

  // Load policies from API
  const loadPolicies = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await policiesService.list();

      if (result.success) {
        setPolicies(result.data || []);
      } else {
        setError(result.error);
        setPolicies([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load policies');
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  // Filter policies based on search and filters
  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        policy.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.employerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.insuranceCompanyName?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'active' && policy.active) || (statusFilter === 'inactive' && !policy.active);

      // Employer filter
      const matchesEmployer = employerFilter === 'all' || policy.employerId?.toString() === employerFilter;

      return matchesSearch && matchesStatus && matchesEmployer;
    });
  }, [policies, searchTerm, statusFilter, employerFilter]);

  // Event handlers
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleEmployerFilterChange = (event) => {
    setEmployerFilter(event.target.value);
  };

  const handleViewPolicy = (id) => {
    navigate(`/policies/${id}`);
  };

  const handleEditPolicy = (id) => {
    navigate(`/policies/edit/${id}`);
  };

  const handleDeleteClick = (policy) => {
    setPolicyToDelete(policy);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const result = await policiesService.delete(policyToDelete.id);

      if (result.success) {
        enqueueSnackbar(result.message || 'Policy deleted successfully', { variant: 'success' });
        setDeleteDialogOpen(false);
        setPolicyToDelete(null);
        loadPolicies();
      } else {
        enqueueSnackbar(result.error || 'Failed to delete policy', { variant: 'error' });
      }
    } catch (err) {
      enqueueSnackbar('Failed to delete policy', { variant: 'error' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPolicyToDelete(null);
  };

  const handleCreatePolicy = () => {
    navigate('/policies/create');
  };

  const handleRetry = () => {
    loadPolicies();
  };

  // Initialize React Table
  const table = useReactTable({
    data: filteredPolicies,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <RBACGuard permission="POLICY_READ">
      <MainCard
        title="Policies"
        secondary={
          <RBACGuard permission="POLICY_UPDATE">
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreatePolicy}>
              Add Policy
            </Button>
          </RBACGuard>
        }
      >
        <Stack spacing={3}>
          {/* Filters Row */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {/* Search Bar */}
            <TextField
              placeholder="Search by policy number, employer..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ flex: 1 }}
            />

            {/* Status Filter */}
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={handleStatusFilterChange} label="Status">
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Employer Filter */}
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Employer</InputLabel>
              <Select value={employerFilter} onChange={handleEmployerFilterChange} label="Employer">
                <MenuItem value="all">All Employers</MenuItem>
                {EMPLOYERS.map((employer) => (
                  <MenuItem key={employer.id} value={employer.id.toString()}>
                    {employer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Error State */}
          {error && !loading && <ErrorFallback error={error} onRetry={handleRetry} />}

          {/* Loading State */}
          {loading && <TableSkeleton rows={10} columns={8} />}

          {/* Empty State */}
          {!loading && !error && filteredPolicies.length === 0 && (
            <EmptyState
              title="No policies found"
              description={
                searchTerm || statusFilter !== 'all' || employerFilter !== 'all'
                  ? 'Try adjusting your filters or search criteria'
                  : 'Get started by adding your first policy'
              }
              action={handleCreatePolicy}
              actionLabel="Add Policy"
            />
          )}

          {/* Data Table */}
          {!loading && !error && filteredPolicies.length > 0 && (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          style={{
                            textAlign: 'left',
                            padding: '12px 16px',
                            borderBottom: '1px solid #e0e0e0',
                            fontWeight: 600,
                            color: '#666'
                          }}
                        >
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} style={{ padding: '12px 16px' }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </Stack>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete policy "<strong>{policyToDelete?.policyNumber}</strong>"? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </MainCard>
    </RBACGuard>
  );
}
