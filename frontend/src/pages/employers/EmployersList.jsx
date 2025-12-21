import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Static Arabic labels
const LABELS = {
  list: 'أصحاب العمل',
  listDesc: 'إدارة أصحاب العمل ومعلوماتهم',
  add: 'إضافة صاحب عمل',
  code: 'الرمز',
  nameAr: 'الاسم (عربي)',
  nameEn: 'الاسم (إنجليزي)',
  phone: 'الهاتف',
  status: 'الحالة',
  actions: 'الإجراءات',
  active: 'نشط',
  inactive: 'غير نشط',
  edit: 'تعديل',
  delete: 'حذف',
  cancel: 'إلغاء',
  deleting: 'جار الحذف...',
  refresh: 'تحديث',
  noFound: 'لم يتم العثور على أصحاب عمل',
  noFoundDesc: 'ابدأ بإضافة أول صاحب عمل',
  deleteConfirmTitle: 'حذف صاحب العمل',
  deleteConfirm: 'هل أنت متأكد من حذف صاحب العمل هذا؟',
  deletedSuccess: 'تم حذف صاحب العمل بنجاح',
  error: 'خطأ',
  loadError: 'فشل في تحميل أصحاب العمل',
  deleteError: 'فشل في حذف صاحب العمل'
};

const EmployersList = () => {
  const navigate = useNavigate();
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
      enqueueSnackbar(LABELS.deletedSuccess, { variant: 'success' });
      refetch();
      setDeleteDialogOpen(false);
      setEmployerToDelete(null);
    } catch (err) {
      console.error('Failed to delete employer:', err);
      enqueueSnackbar(LABELS.deleteError, { variant: 'error' });
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
          title={LABELS.list}
          subtitle={LABELS.listDesc}
          icon={BusinessIcon}
          breadcrumbs={[{ label: LABELS.list, path: '/employers' }]}
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
          title={LABELS.list}
          icon={BusinessIcon}
          breadcrumbs={[{ label: LABELS.list, path: '/employers' }]}
        />
        <MainCard>
          <Alert severity="error">
            {LABELS.error}: {error.message || LABELS.loadError}
          </Alert>
        </MainCard>
      </Box>
    );
  }

  return (
    <>
      <ModernPageHeader
        title={LABELS.list}
        subtitle={LABELS.listDesc}
        icon={BusinessIcon}
        breadcrumbs={[{ label: LABELS.list, path: '/employers' }]}
        actions={
          <Stack direction="row" spacing={2}>
            <Tooltip title={LABELS.refresh}>
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/employers/create')}>
              {LABELS.add}
            </Button>
          </Stack>
        }
      />

      <MainCard content={false}>
        {(!Array.isArray(employers) || employers.length === 0) ? (
          <Box sx={{ p: 3 }}>
            <ModernEmptyState
              icon={BusinessIcon}
              title={LABELS.noFound}
              description={LABELS.noFoundDesc}
              action={
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/employers/create')}>
                  {LABELS.add}
                </Button>
              }
            />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table sx={{ minWidth: 650 }} size="medium">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{LABELS.code}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{LABELS.nameAr}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{LABELS.nameEn}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{LABELS.phone}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{LABELS.status}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>{LABELS.actions}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(employers) && employers.map((employer) => (
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
                        label={employer.active ? LABELS.active : LABELS.inactive}
                        size="small"
                        color={employer.active ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title={LABELS.edit}>
                          <IconButton size="small" color="info" onClick={() => navigate(`/employers/edit/${employer.id}`)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={LABELS.delete}>
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
        <DialogTitle>{LABELS.deleteConfirmTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {LABELS.deleteConfirm}
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
            {LABELS.cancel}
          </Button>
          <Button onClick={handleDeleteConfirm} disabled={deleting} variant="contained" color="error">
            {deleting ? LABELS.deleting : LABELS.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmployersList;
