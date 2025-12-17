import { useState, useCallback } from 'react';
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
  Tooltip,
  Paper,
  TableSortLabel,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MedicalServices as MedicalServicesIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import ModernEmptyState from 'components/tba/ModernEmptyState';
import TableSkeleton from 'components/tba/LoadingSkeleton';
import { useMedicalServicesList } from 'hooks/useMedicalServices';
import { deleteMedicalService } from 'services/api/medical-services.service';

/**
 * Medical Services List Page
 * Displays paginated list of medical services with search, sort, and CRUD operations
 */
const MedicalServicesList = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const { data, loading, error, params, setParams, refresh } = useMedicalServicesList({
    page: 1,
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'desc'
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setParams((prev) => ({ ...prev, page: 1, search: searchInput.trim() }));
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(property);
    setParams((prev) => ({
      ...prev,
      sortBy: property,
      sortDir: newOrder
    }));
  };

  const handleChangePage = useCallback(
    (_, newPage) => {
      setParams((prev) => ({ ...prev, page: newPage + 1 }));
    },
    [setParams]
  );

  const handleChangeRowsPerPage = useCallback(
    (event) => {
      setParams((prev) => ({
        ...prev,
        page: 1,
        size: parseInt(event.target.value, 10)
      }));
    },
    [setParams]
  );

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الخدمة الطبية؟')) return;
    try {
      await deleteMedicalService(id);
      refresh();
    } catch (err) {
      console.error('Failed to delete medical service:', err);
    }
  };

  const items = data?.items || [];
  const total = data?.total || 0;
  const currentPage = (data?.page || 1) - 1;
  const pageSize = data?.size || 20;

  return (
    <Box>
      <ModernPageHeader
        title="الخدمات الطبية"
        subtitle="إدارة الخدمات الطبية في النظام"
        icon={MedicalServicesIcon}
        breadcrumbs={[
          { label: 'الرئيسية', path: '/' },
          { label: 'الخدمات الطبية', path: '/medical-services' },
          { label: 'الخدمات الطبية' }
        ]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refresh} disabled={loading}>
              تحديث
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/medical-services/add')}>
              إضافة خدمة جديدة
            </Button>
          </Stack>
        }
      />

      <MainCard>
        {/* Search Bar */}
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="البحث في الخدمات الطبية..."
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
                      setParams((prev) => ({ ...prev, search: '', page: 1 }));
                    }}
                  >
                    ×
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || 'حدث خطأ أثناء تحميل البيانات'}
          </Alert>
        )}

        {/* Loading State */}
        {loading && <TableSkeleton columns={8} rows={10} />}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <ModernEmptyState
            icon={MedicalServicesIcon}
            title="لا توجد خدمات طبية"
            description={params.search ? 'لم يتم العثور على نتائج للبحث' : 'لم يتم إضافة أي خدمات طبية بعد'}
            action={
              !params.search && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/medical-services/add')}>
                  إضافة خدمة جديدة
                </Button>
              )
            }
          />
        )}

        {/* Table */}
        {!loading && items.length > 0 && (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'code'}
                        direction={orderBy === 'code' ? order : 'asc'}
                        onClick={() => handleRequestSort('code')}
                      >
                        الرمز
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'nameAr'}
                        direction={orderBy === 'nameAr' ? order : 'asc'}
                        onClick={() => handleRequestSort('nameAr')}
                      >
                        الاسم (عربي)
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'nameEn'}
                        direction={orderBy === 'nameEn' ? order : 'asc'}
                        onClick={() => handleRequestSort('nameEn')}
                      >
                        الاسم (إنجليزي)
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>التصنيف</TableCell>
                    <TableCell align="right">السعر (LYD)</TableCell>
                    <TableCell align="center">يتطلب موافقة</TableCell>
                    <TableCell align="center">الحالة</TableCell>
                    <TableCell align="center">الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((service) => (
                    <TableRow key={service.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {service.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{service.nameAr}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {service.nameEn}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {service.category?.nameAr || service.category?.nameEn || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {service.priceLyd ? `${service.priceLyd.toFixed(2)}` : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {service.requiresApproval ? (
                          <CheckCircleIcon fontSize="small" color="success" />
                        ) : (
                          <CancelIcon fontSize="small" color="disabled" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={service.active ? 'نشط' : 'غير نشط'} color={service.active ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="عرض">
                            <IconButton size="small" color="primary" onClick={() => navigate(`/medical-services/${service.id}`)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="تعديل">
                            <IconButton size="small" color="info" onClick={() => navigate(`/medical-services/edit/${service.id}`)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton size="small" color="error" onClick={() => handleDelete(service.id)}>
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

            {/* Pagination */}
            <TablePagination
              component="div"
              count={total}
              page={currentPage}
              onPageChange={handleChangePage}
              rowsPerPage={pageSize}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 20, 50, 100]}
              labelRowsPerPage="عدد الصفوف:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
            />
          </>
        )}
      </MainCard>
    </Box>
  );
};

export default MedicalServicesList;
