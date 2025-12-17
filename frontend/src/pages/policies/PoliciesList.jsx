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
import { usePoliciesList, useDeletePolicy } from 'hooks/usePolicies';

const PoliciesList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, params, setParams, refresh } = usePoliciesList({
    page: 1,
    size: 10
  });
  const { remove, deleting } = useDeletePolicy();

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
    navigate(`/policies/view/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/policies/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه السياسة؟')) {
      try {
        await remove(id);
        refresh();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleCreate = () => {
    navigate('/policies/create');
  };

  return (
    <MainCard title="إدارة السياسات التأمينية">
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="بحث بالاسم أو الكود أو الوصف..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            إضافة سياسة جديدة
          </Button>
        </Stack>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>الاسم</TableCell>
              <TableCell>الكود</TableCell>
              <TableCell>شركة التأمين</TableCell>
              <TableCell>تاريخ البدء</TableCell>
              <TableCell>تاريخ الانتهاء</TableCell>
              <TableCell align="center">الحالة</TableCell>
              <TableCell align="center">الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography>جاري التحميل...</Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading && data.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography>لا توجد بيانات</Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              data.items.map((policy) => (
                <TableRow key={policy.id} hover>
                  <TableCell>{policy.name}</TableCell>
                  <TableCell>{policy.code}</TableCell>
                  <TableCell>{policy.insuranceCompanyName}</TableCell>
                  <TableCell>{new Date(policy.startDate).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>{policy.endDate ? new Date(policy.endDate).toLocaleDateString('ar-SA') : '-'}</TableCell>
                  <TableCell align="center">
                    <Chip label={policy.active ? 'نشط' : 'غير نشط'} color={policy.active ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary" onClick={() => handleView(policy.id)} title="عرض">
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="info" onClick={() => handleEdit(policy.id)} title="تعديل">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(policy.id)} disabled={deleting} title="حذف">
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

export default PoliciesList;
