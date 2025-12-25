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
  TextField,
  Typography,
  TablePagination,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Policy as PolicyIcon
} from '@mui/icons-material';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import ModernEmptyState from 'components/tba/ModernEmptyState';
import TableSkeleton from 'components/tba/LoadingSkeleton';
import RBACGuard from 'components/tba/RBACGuard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insurancePoliciesService } from 'services/api';
import { openSnackbar } from 'api/snackbar';

const InsurancePoliciesList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [params, setParams] = useState({
    page: 0, // 0-based for MUI TablePagination
    size: 10,
    sortBy: 'id',
    sortDir: 'DESC',
    search: ''
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['insurance-policies', params],
    queryFn: () => insurancePoliciesService.getAll(params),
    keepPreviousData: true
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => insurancePoliciesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['insurance-policies']);
      openSnackbar({
        message: 'تم حذف بوليصة التأمين بنجاح',
        variant: 'alert',
        alert: { color: 'success', variant: 'filled' }
      });
    },
    onError: (err) => {
      console.error('Failed to delete insurance policy', err);
      openSnackbar({
        message: 'فشل في حذف بوليصة التأمين',
        variant: 'alert',
        alert: { color: 'error', variant: 'filled' }
      });
    }
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setParams((prev) => ({ ...prev, page: 0, search: searchInput.trim() }));
  };

  const handleSort = (column) => {
    const isAsc = params.sortBy === column && params.sortDir === 'ASC';
    const newDir = isAsc ? 'DESC' : 'ASC';
    setParams((prev) => ({ ...prev, sortBy: column, sortDir: newDir }));
  };

  const handleChangePage = (_, newPage) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setParams((prev) => ({
      ...prev,
      page: 0,
      size: parseInt(event.target.value, 10)
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف بوليصة التأمين؟')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // Error handled in mutation onError callback
    }
  };

  const getStatusChip = (status) => {
    const statusColors = {
      ACTIVE: 'success',
      INACTIVE: 'default',
      EXPIRED: 'error',
      PENDING: 'warning'
    };
    return <Chip label={status || 'N/A'} color={statusColors[status] || 'default'} size="small" variant="outlined" />;
  };

  // Safe data extraction - service returns normalized {items, total, page, size}
  const safeContent = Array.isArray(data?.items) ? data.items : [];
  const totalCount = typeof data?.total === 'number' ? data.total : 0;
  const hasData = safeContent.length > 0;
  const showEmptyState = !isLoading && !hasData && !error;
  const showTable = !isLoading && !error;

  // Reset page if current page is out of bounds (e.g., after deletion)
  const maxPage = Math.max(0, Math.ceil(totalCount / params.size) - 1);
  const safePage = Math.min(params.page, maxPage);
  if (safePage !== params.page && totalCount > 0) {
    setParams((prev) => ({ ...prev, page: safePage }));
  }

  if (error) {
    return (
      <MainCard title="بوليصات التأمين">
        <Typography color="error">خطأ في تحميل البيانات: {error.message}</Typography>
      </MainCard>
    );
  }

  return (
    <RBACGuard
      requiredPermissions={['VIEW_POLICIES']}
      fallback={
        <MainCard title="بوليصات التأمين">
          <ModernEmptyState icon={PolicyIcon} title="غير مصرح لك بالوصول" description="ليس لديك الصلاحيات اللازمة لعرض بوليصات التأمين" />
        </MainCard>
      }
    >
      <ModernPageHeader
        title="بوليصات التأمين"
        subtitle="إدارة ومتابعة بوليصات التأمين"
        icon={PolicyIcon}
        breadcrumbs={[{ label: 'بوليصات التأمين', path: '/insurance-policies' }]}
        actions={
          <RBACGuard requiredPermissions={['MANAGE_POLICIES']}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/insurance-policies/add')}>
              إضافة بوليصة جديدة
            </Button>
          </RBACGuard>
        }
      />

      <MainCard>
        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <form onSubmit={handleSearchSubmit}>
            <TextField
              fullWidth
              placeholder="بحث برقم البوليصة، اسم شركة التأمين، أو رقم الوثيقة..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchInput && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchInput('');
                        setParams((prev) => ({ ...prev, page: 0, search: '' }));
                      }}
                    >
                      ×
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </form>
        </Box>

        {/* Loading State */}
        {isLoading && <TableSkeleton rows={params.size} columns={7} />}

        {/* Empty State */}
        {showEmptyState && <ModernEmptyState icon={PolicyIcon} title="لا توجد بوليصات تأمين" description="لم يتم العثور على بوليصات" />}

        {/* Data Table - Always render table structure when not loading */}
        {showTable && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell onClick={() => handleSort('id')} sx={{ cursor: 'pointer' }}>
                    <strong>الرقم</strong>
                  </TableCell>
                  <TableCell onClick={() => handleSort('policyNumber')} sx={{ cursor: 'pointer' }}>
                    <strong>رقم البوليصة</strong>
                  </TableCell>
                  <TableCell>
                    <strong>شركة التأمين</strong>
                  </TableCell>
                  <TableCell onClick={() => handleSort('startDate')} sx={{ cursor: 'pointer' }}>
                    <strong>تاريخ البدء</strong>
                  </TableCell>
                  <TableCell onClick={() => handleSort('endDate')} sx={{ cursor: 'pointer' }}>
                    <strong>تاريخ الانتهاء</strong>
                  </TableCell>
                  <TableCell onClick={() => handleSort('status')} sx={{ cursor: 'pointer' }}>
                    <strong>الحالة</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>الإجراءات</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hasData ? (
                  safeContent.map((policy) => (
                    <TableRow key={policy?.id ?? Math.random()} hover>
                      <TableCell>{policy?.id ?? '-'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {policy?.policyNumber || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>{policy?.insuranceCompanyName || 'N/A'}</TableCell>
                      <TableCell>{policy?.startDate ? new Date(policy.startDate).toLocaleDateString('ar-SA') : 'N/A'}</TableCell>
                      <TableCell>{policy?.endDate ? new Date(policy.endDate).toLocaleDateString('ar-SA') : 'N/A'}</TableCell>
                      <TableCell>{getStatusChip(policy?.status)}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="عرض">
                            <IconButton size="small" color="primary" onClick={() => navigate(`/insurance-policies/${policy?.id}`)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <RBACGuard requiredPermissions={['MANAGE_POLICIES']}>
                            <Tooltip title="تعديل">
                              <IconButton size="small" color="info" onClick={() => navigate(`/insurance-policies/edit/${policy?.id}`)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </RBACGuard>
                          <RBACGuard requiredPermissions={['MANAGE_POLICIES']}>
                            <Tooltip title="حذف">
                              <IconButton size="small" color="error" onClick={() => handleDelete(policy?.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </RBACGuard>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">لا توجد بيانات للعرض</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination - Always show when we have data or after initial load */}
        {showTable && (
          <TablePagination
            component="div"
            count={totalCount}
            page={safePage}
            onPageChange={handleChangePage}
            rowsPerPage={params.size}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="عدد الصفوف في الصفحة:"
            labelDisplayedRows={({ from, to, count }) =>
              count === 0 ? 'لا توجد نتائج' : `${from}–${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
            }
          />
        )}
      </MainCard>
    </RBACGuard>
  );
};

export default InsurancePoliciesList;
