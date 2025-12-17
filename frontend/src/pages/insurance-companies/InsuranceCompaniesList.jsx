import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';

// Icons
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';

// Project imports
import MainCard from 'components/MainCard';
import { useInsuranceCompaniesList, useDeleteInsuranceCompany } from 'hooks/useInsuranceCompanies';

const InsuranceCompaniesList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, loading, params, setParams } = useInsuranceCompaniesList({
    page: 1,
    size: 10,
    search: ''
  });

  const { remove, deleting } = useDeleteInsuranceCompany();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setParams((prev) => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch, setParams]);

  const handleChangePage = (event, newPage) => {
    setParams((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event) => {
    setParams((prev) => ({ ...prev, size: parseInt(event.target.value, 10), page: 1 }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف شركة التأمين؟')) {
      try {
        await remove(id);
        setParams((prev) => ({ ...prev })); // Trigger refresh
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <MainCard>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">شركات التأمين</Typography>
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => navigate('/insurance-companies/create')}
        >
          إضافة شركة تأمين
        </Button>
      </Stack>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="بحث بالاسم، الرمز، الهاتف، أو البريد الإلكتروني..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>الاسم</TableCell>
              <TableCell>الرمز</TableCell>
              <TableCell>الهاتف</TableCell>
              <TableCell>البريد الإلكتروني</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell align="center">الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  لا توجد بيانات
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((company, index) => (
                <TableRow key={company.id} hover>
                  <TableCell>{(params.page - 1) * params.size + index + 1}</TableCell>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.code}</TableCell>
                  <TableCell>{company.phone || '-'}</TableCell>
                  <TableCell>{company.email || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={company.active ? 'نشط' : 'غير نشط'}
                      color={company.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="عرض">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => navigate(`/insurance-companies/view/${company.id}`)}
                        >
                          <EyeOutlined />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="تعديل">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => navigate(`/insurance-companies/edit/${company.id}`)}
                        >
                          <EditOutlined />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(company.id)}
                          disabled={deleting}
                        >
                          <DeleteOutlined />
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

      <TablePagination
        component="div"
        count={data.total}
        page={params.page - 1}
        onPageChange={handleChangePage}
        rowsPerPage={params.size}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="عدد الصفوف:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
      />
    </MainCard>
  );
};

export default InsuranceCompaniesList;
