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
  Chip,
  Typography,
  Stack
} from '@mui/material';
import { Add as AddIcon, Visibility, Edit, Delete } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { usePreApprovalsList, useDeletePreApproval } from 'hooks/usePreApprovals';

const STATUS_COLORS = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error'
};

const STATUS_LABELS = {
  PENDING: 'قيد المراجعة',
  APPROVED: 'موافق عليه',
  REJECTED: 'مرفوض'
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
    navigate(`/pre-approvals/view/${id}`);
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
    navigate('/pre-approvals/create');
  };

  return (
    <MainCard title="إدارة طلبات الموافقات المسبقة">
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="بحث بالمزود، التشخيص، أو اسم العضو..."
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
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>اسم العضو</TableCell>
              <TableCell>شركة التأمين</TableCell>
              <TableCell>مقدم الخدمة</TableCell>
              <TableCell align="right">المبلغ المطلوب</TableCell>
              <TableCell align="right">المبلغ الموافق عليه</TableCell>
              <TableCell align="center">الحالة</TableCell>
              <TableCell align="center">الإجراءات</TableCell>
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
            {!loading && data.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography>لا توجد بيانات</Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              data.items.map((preApproval) => (
                <TableRow key={preApproval.id} hover>
                  <TableCell>{preApproval.id}</TableCell>
                  <TableCell>{preApproval.memberFullNameArabic}</TableCell>
                  <TableCell>{preApproval.insuranceCompanyName}</TableCell>
                  <TableCell>{preApproval.providerName}</TableCell>
                  <TableCell align="right">{preApproval.requestedAmount?.toLocaleString('ar-SA')}</TableCell>
                  <TableCell align="right">
                    {preApproval.approvedAmount ? preApproval.approvedAmount.toLocaleString('ar-SA') : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={STATUS_LABELS[preApproval.status] || preApproval.status}
                      color={STATUS_COLORS[preApproval.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary" onClick={() => handleView(preApproval.id)} title="عرض">
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="info" onClick={() => handleEdit(preApproval.id)} title="تعديل">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(preApproval.id)} disabled={deleting} title="حذف">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data.total}
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
