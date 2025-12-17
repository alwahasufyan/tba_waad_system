import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  TablePagination,
  InputAdornment,
  Tooltip,
  Paper,
  TableSortLabel,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PeopleAlt as PeopleAltIcon,
  Refresh as RefreshIcon,
  Upload as UploadIcon
} from '@mui/icons-material';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import ModernEmptyState from 'components/tba/ModernEmptyState';
import TableSkeleton from 'components/tba/LoadingSkeleton';
import { useMembersList } from 'hooks/useMembers';
import { membersService } from 'services/api/members.service';
import MembersBulkUploadDialog from 'components/members/MembersBulkUploadDialog';

const MembersList = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const [searchInput, setSearchInput] = useState('');
  const [orderBy, setOrderBy] = useState('id');
  const [order, setOrder] = useState('desc');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const { data, loading, error, params, setParams, refresh } = useMembersList({
    page: 1,
    size: 10,
    sortBy: 'id',
    sortDir: 'desc'
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setParams((prev) => ({ ...prev, page: 1, search: searchInput.trim() }));
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(property);
    setParams((prev) => ({
      ...prev,
      sortBy: property,
      sortDir: newOrder
    }));
  };

  const handleChangePage = useCallback(
    (_, newPage) => {
      setParams((prev) => ({ ...prev, page: newPage + 1 }));
    },
    [setParams]
  );

  const handleChangeRowsPerPage = useCallback(
    (event) => {
      setParams((prev) => ({
        ...prev,
        page: 1,
        size: parseInt(event.target.value, 10)
      }));
    },
    [setParams]
  );

  const handleDelete = async (id) => {
    if (!window.confirm(intl.formatMessage({ id: 'members.delete-confirm' }) || 'Delete this member?')) return;
    try {
      await membersService.deleteMember(id);
      refresh();
    } catch (err) {
      console.error('Failed to delete member', err);
      alert(intl.formatMessage({ id: 'common.error' }) || 'Failed to delete');
    }
  };

  const handleRefresh = () => {
    setSearchInput('');
    setParams({ page: 1, size: 10, sortBy: 'id', sortDir: 'desc', search: '' });
    refresh();
  };

  const headCells = [
    { id: 'id', label: intl.formatMessage({ id: 'common.id' }) || 'ID', sortable: true },
    { id: 'memberCode', label: intl.formatMessage({ id: 'members.member-code' }) || 'Member Code', sortable: true },
    { id: 'nationalId', label: intl.formatMessage({ id: 'members.national-id' }) || 'National ID', sortable: true },
    {
      id: 'fullNameAr',
      label: intl.formatMessage({ id: 'members.full-name-ar' }) || 'Full Name (AR)',
      sortable: true
    },
    {
      id: 'employerName',
      label: intl.formatMessage({ id: 'members.employer-name' }) || 'Employer',
      sortable: false
    },
    {
      id: 'insuranceCompany',
      label: intl.formatMessage({ id: 'members.insurance-company' }) || 'Insurance Company',
      sortable: false
    },
    { id: 'active', label: intl.formatMessage({ id: 'common.status' }) || 'Status', sortable: true },
    { id: 'actions', label: intl.formatMessage({ id: 'common.actions' }) || 'Actions', sortable: false, align: 'center' }
  ];

  const tableContent = useMemo(() => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={headCells.length}>
            <TableSkeleton />
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={headCells.length}>
            <Alert severity="error" sx={{ my: 2 }}>
              {intl.formatMessage({ id: 'common.error' }) || 'Error'}: {error.message || 'Failed to load members'}
            </Alert>
          </TableCell>
        </TableRow>
      );
    }

    if (!data?.items || data.items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={headCells.length}>
            <ModernEmptyState
              icon={PeopleAltIcon}
              title={intl.formatMessage({ id: 'members.no-found' }) || 'No members found'}
              description={intl.formatMessage({ id: 'members.no-found-desc' }) || 'Start by adding your first member'}
              action={
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/members/create')}>
                  {intl.formatMessage({ id: 'members.add' }) || 'Add Member'}
                </Button>
              }
            />
          </TableCell>
        </TableRow>
      );
    }

    return data.items.map((member) => (
      <TableRow hover key={member.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell>
          <Typography variant="body2" fontWeight={500}>
            {member.id}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip label={member.memberCode || '-'} size="small" variant="outlined" color="primary" />
        </TableCell>
        <TableCell>
          <Typography variant="body2">{member.nationalId || '-'}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={500}>
            {member.fullNameAr || '-'}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{member.employerName || '-'}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{member.insuranceCompanyName || '-'}</Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={
              member.active
                ? intl.formatMessage({ id: 'common.active' }) || 'Active'
                : intl.formatMessage({ id: 'common.inactive' }) || 'Inactive'
            }
            size="small"
            color={member.active ? 'success' : 'error'}
          />
        </TableCell>
        <TableCell align="center">
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <Tooltip title={intl.formatMessage({ id: 'common.view' }) || 'View'}>
              <IconButton size="small" color="primary" onClick={() => navigate(`/members/view/${member.id}`)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={intl.formatMessage({ id: 'common.edit' }) || 'Edit'}>
              <IconButton size="small" color="info" onClick={() => navigate(`/members/edit/${member.id}`)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={intl.formatMessage({ id: 'common.delete' }) || 'Delete'}>
              <IconButton size="small" color="error" onClick={() => handleDelete(member.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>
    ));
  }, [data, loading, error, headCells.length, intl, navigate]);

  return (
    <>
      <ModernPageHeader
        title={intl.formatMessage({ id: 'members.list' }) || 'Members'}
        subtitle={intl.formatMessage({ id: 'members.list-desc' }) || 'Manage insurance members'}
        icon={PeopleAltIcon}
        breadcrumbs={[{ label: intl.formatMessage({ id: 'members.list' }) || 'Members', path: '/members' }]}
        actions={
          <Stack direction="row" spacing={2}>
            <Tooltip title={intl.formatMessage({ id: 'common.refresh' }) || 'Refresh'}>
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => setUploadDialogOpen(true)}>
              {intl.formatMessage({ id: 'members.bulk-upload' }) || 'Upload Excel'}
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/members/create')}>
              {intl.formatMessage({ id: 'members.add' }) || 'Add Member'}
            </Button>
          </Stack>
        }
      />

      <MainCard content={false}>
        {/* Toolbar */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              size="small"
              placeholder={intl.formatMessage({ id: 'members.search' }) || 'Search members...'}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              sx={{ maxWidth: { sm: 400 } }}
            />
            <Button variant="outlined" onClick={handleSearchSubmit} sx={{ minWidth: 100 }}>
              {intl.formatMessage({ id: 'common.search' }) || 'Search'}
            </Button>
          </Stack>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table sx={{ minWidth: 750 }} size="medium">
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell key={headCell.id} align={headCell.align || 'left'} sx={{ fontWeight: 600 }}>
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>{tableContent}</TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {!loading && !error && data?.items && data.items.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={data.total || 0}
            rowsPerPage={params.size}
            page={params.page - 1}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={intl.formatMessage({ id: 'common.rows-per-page' }) || 'Rows per page:'}
          />
        )}
      </MainCard>

      {/* Bulk Upload Dialog */}
      <MembersBulkUploadDialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} onSuccess={refresh} />
    </>
  );
};

export default MembersList;
