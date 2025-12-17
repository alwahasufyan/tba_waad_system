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
  Add as AddIcon
} from '@mui/icons-material';

import MainCard from 'components/MainCard';
import TableSkeleton from 'components/tba/LoadingSkeleton';
import RBACGuard from 'components/tba/RBACGuard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = '/api/insurance-policies';

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

  if (error) {
    return (
      <MainCard title="بوليصات التأمين">
        <Typography color="error">خطأ في تحميل البيانات: {error.message}</Typography>
      </MainCard>
    );
  }

  return (
    <RBACGuard permission="INSURANCE_POLICY_VIEW">
      <MainCard
        title="بوليصات التأمين"
        secondary={
          <RBACGuard permission="INSURANCE_POLICY_CREATE">
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/insurance-policies/add')}>
              إضافة بوليصة جديدة
            </Button>
          </RBACGuard>
        }
      >
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

        {/* Table */}
        {isLoading ? (
          <TableSkeleton rows={params.size} columns={7} />
        ) : (
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
                  {data?.content && data.content.length > 0 ? (
                    data.content.map((policy) => (
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                          لا توجد بوليصات تأمين
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
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
