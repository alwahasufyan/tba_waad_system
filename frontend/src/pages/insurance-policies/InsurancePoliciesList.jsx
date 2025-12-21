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
import axios from 'axios';

const API_BASE = '/insurance-policies';

const fetchInsurancePolicies = async (params) => {
  const { data } = await axios.get(API_BASE, { params });
  return data;
};

const deleteInsurancePolicy = async (id) => {
  await axios.delete(`${API_BASE}/${id}`);
};

const InsurancePoliciesList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [params, setParams] = useState({
    page: 0,
    size: 10,
    sortBy: 'id',
    sortDir: 'DESC',
    search: ''
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['insurance-policies', params],
    queryFn: () => fetchInsurancePolicies(params),
    keepPreviousData: true
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInsurancePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries(['insurance-policies']);
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
    } catch (err) {
      console.error('Failed to delete insurance policy', err);
      alert('حدث خطأ أثناء الحذف');
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

  // Safe data extraction
  const safeContent = Array.isArray(data?.content) ? data.content : [];

  if (error) {
    return (
      <MainCard title="بوليصات التأمين">
        <Typography color="error">خطأ في تحميل البيانات: {error.message}</Typography>
      </MainCard>
    );
  }

  return (
    <RBACGuard permission="INSURANCE_POLICY_VIEW">
      <ModernPageHeader
        title="بوليصات التأمين"
        subtitle="إدارة ومتابعة بوليصات التأمين"
        icon={PolicyIcon}
        breadcrumbs={[{ label: 'بوليصات التأمين', path: '/insurance-policies' }]}
        actions={
          <RBACGuard permission="INSURANCE_POLICY_CREATE">
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
        {!isLoading && safeContent.length === 0 && (
          <ModernEmptyState
            icon={PolicyIcon}
            title="لا توجد بوليصات تأمين"
            description="لم يتم العثور على بوليصات"
          />
        )}

        {/* Data Table */}
        {!isLoading && safeContent.length > 0 && (
          <>
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
                  {safeContent.map((policy) => (
                      <TableRow key={policy.id} hover>
                        <TableCell>{policy.id}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {policy.policyNumber || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>{policy.insuranceCompanyName || 'N/A'}</TableCell>
                        <TableCell>{policy.startDate ? new Date(policy.startDate).toLocaleDateString('ar-SA') : 'N/A'}</TableCell>
                        <TableCell>{policy.endDate ? new Date(policy.endDate).toLocaleDateString('ar-SA') : 'N/A'}</TableCell>
                        <TableCell>{getStatusChip(policy.status)}</TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="عرض">
                              <IconButton size="small" color="primary" onClick={() => navigate(`/insurance-policies/${policy.id}`)}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <RBACGuard permission="INSURANCE_POLICY_UPDATE">
                              <Tooltip title="تعديل">
                                <IconButton size="small" color="info" onClick={() => navigate(`/insurance-policies/edit/${policy.id}`)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </RBACGuard>
                            <RBACGuard permission="INSURANCE_POLICY_DELETE">
                              <Tooltip title="حذف">
                                <IconButton size="small" color="error" onClick={() => handleDelete(policy.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </RBACGuard>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {data && (
              <TablePagination
                component="div"
                count={data.totalElements || 0}
                page={params.page}
                onPageChange={handleChangePage}
                rowsPerPage={params.size}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="عدد الصفوف في الصفحة:"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} من ${count}`}
              />
            )}
          </>
        )}
      </MainCard>
    </RBACGuard>
  );
};

export default InsurancePoliciesList;
