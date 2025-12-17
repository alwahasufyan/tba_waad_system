import { useState } from 'react';
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
  Typography,
  Alert,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import ModernEmptyState from 'components/tba/ModernEmptyState';
import TableSkeleton from 'components/tba/LoadingSkeleton';
import { useEmployersList } from 'hooks/useEmployers';
import { deleteEmployer } from 'services/api/employers.service';

const EmployersList = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const { data: employers, loading, error, refetch } = useEmployersList();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employerToDelete, setEmployerToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (employer) => {
    setEmployerToDelete(employer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employerToDelete) return;

    try {
      setDeleting(true);
      await deleteEmployer(employerToDelete.id);
      enqueueSnackbar(
        intl.formatMessage({ id: 'employers.deleted-success' }) || 'Employer deleted successfully',
        { variant: 'success' }
      );
      refetch();
      setDeleteDialogOpen(false);
      setEmployerToDelete(null);
    } catch (err) {
      console.error('Failed to delete employer:', err);
      enqueueSnackbar(
        intl.formatMessage({ id: 'common.error' }) || 'Failed to delete employer',
        { variant: 'error' }
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEmployerToDelete(null);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (loading) {
    return (
      <Box>
        <ModernPageHeader
          title={intl.formatMessage({ id: 'employers.list' }) || 'Employers'}
          subtitle={intl.formatMessage({ id: 'employers.list-desc' }) || 'Manage employers'}
          icon={BusinessIcon}
          breadcrumbs={[{ label: intl.formatMessage({ id: 'employers.list' }) || 'Employers', path: '/employers' }]}
        />
        <MainCard content={false}>
          <TableSkeleton />
        </MainCard>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <ModernPageHeader
          title={intl.formatMessage({ id: 'employers.list' }) || 'Employers'}
          icon={BusinessIcon}
          breadcrumbs={[{ label: intl.formatMessage({ id: 'employers.list' }) || 'Employers', path: '/employers' }]}
        />
        <MainCard>
          <Alert severity="error">
            {intl.formatMessage({ id: 'common.error' }) || 'Error'}: {error.message || 'Failed to load employers'}
          </Alert>
        </MainCard>
      </Box>
    );
  }

  return (
    <>
      <ModernPageHeader
        title={intl.formatMessage({ id: 'employers.list' }) || 'Employers'}
        subtitle={intl.formatMessage({ id: 'employers.list-desc' }) || 'Manage employers and their information'}
        icon={BusinessIcon}
        breadcrumbs={[{ label: intl.formatMessage({ id: 'employers.list' }) || 'Employers', path: '/employers' }]}
        actions={
          <Stack direction="row" spacing={2}>
            <Tooltip title={intl.formatMessage({ id: 'common.refresh' }) || 'Refresh'}>
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/employers/create')}>
              {intl.formatMessage({ id: 'employers.add' }) || 'Add Employer'}
            </Button>
          </Stack>
        }
      />

      <MainCard content={false}>
        {employers.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <ModernEmptyState
              icon={BusinessIcon}
              title={intl.formatMessage({ id: 'employers.no-found' }) || 'No employers found'}
              description={
                intl.formatMessage({ id: 'employers.no-found-desc' }) || 'Start by adding your first employer'
              }
              action={
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/employers/create')}>
                  {intl.formatMessage({ id: 'employers.add' }) || 'Add Employer'}
                </Button>
              }
            />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table sx={{ minWidth: 650 }} size="medium">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {intl.formatMessage({ id: 'employers.code' }) || 'Code'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {intl.formatMessage({ id: 'employers.name-ar' }) || 'Name (Arabic)'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {intl.formatMessage({ id: 'employers.name-en' }) || 'Name (English)'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {intl.formatMessage({ id: 'common.phone' }) || 'Phone'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {intl.formatMessage({ id: 'common.status' }) || 'Status'}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    {intl.formatMessage({ id: 'common.actions' }) || 'Actions'}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employers.map((employer) => (
                  <TableRow hover key={employer.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Chip label={employer.code || '-'} size="small" variant="outlined" color="primary" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {employer.nameAr || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{employer.nameEn || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{employer.phone || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          employer.active
                            ? intl.formatMessage({ id: 'common.active' }) || 'Active'
                            : intl.formatMessage({ id: 'common.inactive' }) || 'Inactive'
                        }
                        size="small"
                        color={employer.active ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title={intl.formatMessage({ id: 'common.edit' }) || 'Edit'}>
                          <IconButton size="small" color="info" onClick={() => navigate(`/employers/edit/${employer.id}`)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={intl.formatMessage({ id: 'common.delete' }) || 'Delete'}>
                          <IconButton size="small" color="error" onClick={() => handleDeleteClick(employer)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MainCard>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="xs" fullWidth>
        <DialogTitle>{intl.formatMessage({ id: 'employers.delete-confirm-title' }) || 'Delete Employer'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {intl.formatMessage({ id: 'employers.delete-confirm' }) || 'Are you sure you want to delete this employer?'}
            {employerToDelete && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  {employerToDelete.nameAr || employerToDelete.code}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleDeleteCancel} disabled={deleting} color="inherit">
            {intl.formatMessage({ id: 'common.cancel' }) || 'Cancel'}
          </Button>
          <Button onClick={handleDeleteConfirm} disabled={deleting} variant="contained" color="error">
            {deleting
              ? intl.formatMessage({ id: 'common.deleting' }) || 'Deleting...'
              : intl.formatMessage({ id: 'common.delete' }) || 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmployersList;
