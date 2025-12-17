import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  IconButton,
  Tooltip,
  Typography,
  InputAdornment
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Visibility, 
  Search,
  Receipt as ReceiptIcon 
} from '@mui/icons-material';

import MainCard from 'components/MainCard';
import TableSkeleton from 'components/tba/LoadingSkeleton';
import { useClaimsList, useDeleteClaim } from 'hooks/useClaims';

const STATUS_COLORS = {
  PENDING_REVIEW: 'warning',
  PREAPPROVED: 'info',
  APPROVED: 'success',
  PARTIALLY_APPROVED: 'primary',
  REJECTED: 'error',
  RETURNED_FOR_INFO: 'secondary',
  CANCELLED: 'default'
};

const ClaimsList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const { data, loading, params, setParams, refresh } = useClaimsList({
    page: 0,
    size: 10,
    search: ''
  });

  const { remove, deleting } = useDeleteClaim();

  const handlePageChange = (event, newPage) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (event) => {
    setParams((prev) => ({ ...prev, size: parseInt(event.target.value, 10), page: 0 }));
  };

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, search: searchInput, page: 0 }));
    setSearch(searchInput);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المطالبة؟')) {
      const result = await remove(id);
      if (result.success) {
        refresh();
      }
    }
  };

  const content = data?.content || [];
  const totalElements = data?.totalElements || 0;

  return (
    <MainCard title="إدارة المطالبات" content={false}>
      <Box sx={{ p: 3 }}>
        {/* Search & Actions */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Typography variant="body2" color="text.secondary">
            إدارة ومتابعة مطالبات التأمين
          </Typography>

          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="بحث بمقدم الخدمة، التشخيص، العضو..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: 300 }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/claims/create')}
            >
              إضافة مطالبة
            </Button>
          </Stack>
        </Stack>

        {/* Table */}
        {loading ? (
          <TableSkeleton rows={10} columns={9} />
        ) : (
          <TableContainer>
            <Table sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>العضو</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>شركة التأمين</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>مقدم الخدمة</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>تاريخ الزيارة</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>المبلغ المطلوب</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>المبلغ الموافق</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>الحالة</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>إجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        لا توجد مطالبات
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  content.map((claim, index) => (
                    <TableRow 
                      key={claim.id} 
                      hover
                      sx={{ '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' } }}
                    >
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                          <ReceiptIcon fontSize="small" color="action" />
                          <Typography variant="subtitle2">
                            {claim.id}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {claim.memberFullNameArabic}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                          {claim.memberCivilId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {claim.companyName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {claim.providerName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(claim.visitDate).toLocaleDateString('ar-SA')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          {claim.requestedAmount?.toLocaleString('ar-SA', {
                            minimumFractionDigits: 2
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500} color="success.main">
                          {claim.approvedAmount
                            ? claim.approvedAmount.toLocaleString('ar-SA', {
                                minimumFractionDigits: 2
                              })
                            : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={claim.statusLabel}
                          color={STATUS_COLORS[claim.status] || 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="عرض التفاصيل">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/claims/view/${claim.id}`)}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="تعديل">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => navigate(`/claims/edit/${claim.id}`)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(claim.id)}
                              disabled={deleting}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && (
          <TablePagination
            component="div"
            count={totalElements}
            page={params.page}
            onPageChange={handlePageChange}
            rowsPerPage={params.size}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="عدد الصفوف في الصفحة:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} من ${count}`
            }
          />
        )}
      </Box>
    </MainCard>
  );
};

export default ClaimsList;
