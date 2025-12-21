import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  IconButton,
  Typography,
  Stack,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Visibility, 
  Edit, 
  Delete,
  AssignmentTurnedIn as PreApprovalIcon
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { usePreApprovalsList, useDeletePreApproval } from 'hooks/usePreApprovals';

// Insurance UX Components - Phase B2 Step 3
import { CardStatusBadge, PriorityBadge } from 'components/insurance';

// Pre-Approval Status Mapping for CardStatusBadge
const PREAPPROVAL_STATUS_MAP = {
  PENDING: 'PENDING',
  REQUESTED: 'PENDING',
  UNDER_REVIEW: 'PENDING',
  PENDING_DOCUMENTS: 'SUSPENDED',
  APPROVED: 'ACTIVE',
  REJECTED: 'BLOCKED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'INACTIVE'
};

// Arabic labels for statuses
const STATUS_LABELS = {
  PENDING: 'قيد المراجعة',
  REQUESTED: 'تم الإرسال',
  UNDER_REVIEW: 'قيد المراجعة الطبية',
  PENDING_DOCUMENTS: 'مطلوب مستندات',
  APPROVED: 'تمت الموافقة',
  REJECTED: 'مرفوض',
  EXPIRED: 'منتهية الصلاحية',
  CANCELLED: 'ملغى'
};

const PreApprovalsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, params, setParams, refresh } = usePreApprovalsList({
    page: 1,
    size: 10
  });
  const { remove, deleting } = useDeletePreApproval();

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setParams({ ...params, page: 1, search: value });
  };

  const handlePageChange = (event, newPage) => {
    setParams({ ...params, page: newPage + 1 });
  };

  const handleRowsPerPageChange = (event) => {
    setParams({
      ...params,
      page: 1,
      size: parseInt(event.target.value, 10)
    });
  };

  const handleView = (id) => {
    navigate(`/pre-approvals/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/pre-approvals/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      try {
        await remove(id);
        refresh();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleCreate = () => {
    navigate('/pre-approvals/add');
  };

  return (
    <MainCard title="إدارة طلبات الموافقات المسبقة">
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="بحث بالمزود، التشخيص، أو اسم المؤمَّن عليه..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            طلب موافقة جديد
          </Button>
        </Stack>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>المؤمَّن عليه</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>شركة التأمين</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>مقدم الخدمة</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>الأولوية</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>المبلغ المطلوب</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>المبلغ الموافق عليه</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>الحالة</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography>جاري التحميل...</Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading && (!data?.items || data.items.length === 0) && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography>لا توجد بيانات</Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading && Array.isArray(data?.items) &&
              data.items.map((preApproval) => (
                <TableRow key={preApproval?.id ?? Math.random()} hover>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <PreApprovalIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2">{preApproval?.id ?? '-'}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {preApproval?.memberFullNameArabic ?? preApproval?.memberFullNameEnglish ?? '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{preApproval?.insuranceCompanyName ?? '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{preApproval?.providerName ?? '-'}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    {/* Insurance UX - PriorityBadge */}
                    <PriorityBadge
                      priority={preApproval?.priority ?? 'ROUTINE'}
                      size="small"
                      variant="chip"
                      language="ar"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={500}>
                      {typeof preApproval?.requestedAmount === 'number'
                        ? preApproval.requestedAmount.toLocaleString('ar-SA')
                        : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      fontWeight={500}
                      color={preApproval?.approvedAmount > 0 ? 'success.main' : 'text.secondary'}
                    >
                      {typeof preApproval?.approvedAmount === 'number' && preApproval.approvedAmount > 0
                        ? preApproval.approvedAmount.toLocaleString('ar-SA')
                        : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {/* Insurance UX - CardStatusBadge */}
                    <CardStatusBadge
                      status={PREAPPROVAL_STATUS_MAP[preApproval?.status] ?? 'PENDING'}
                      customLabel={STATUS_LABELS[preApproval?.status] ?? preApproval?.status}
                      size="small"
                      variant="chip"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="عرض">
                        <IconButton size="small" color="primary" onClick={() => handleView(preApproval?.id)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="تعديل">
                        <IconButton size="small" color="info" onClick={() => handleEdit(preApproval?.id)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف">
                        <IconButton size="small" color="error" onClick={() => handleDelete(preApproval?.id)} disabled={deleting}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data?.total || 0}
          page={(params.page || 1) - 1}
          onPageChange={handlePageChange}
          rowsPerPage={params.size || 10}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="عدد الصفوف:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
        />
      </TableContainer>
    </MainCard>
  );
};

export default PreApprovalsList;
