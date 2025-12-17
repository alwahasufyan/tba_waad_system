import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
  LocalHospital as LocalHospitalIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import ModernEmptyState from 'components/tba/ModernEmptyState';
import TableSkeleton from 'components/tba/LoadingSkeleton';
import { useVisitsList } from 'hooks/useVisits';
import visitsService from 'services/api/visits.service';

/**
 * Visits List Page
 * Displays paginated list of visits with search, sort, and CRUD operations
 */
const VisitsList = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [orderBy, setOrderBy] = useState('visitDate');
  const [order, setOrder] = useState('desc');
  const [apiError, setApiError] = useState(null);

  const { data, loading, error, params, setParams, refresh } = useVisitsList({
    sortBy: orderBy,
    sortDir: order
  });

  const handleSearch = useCallback(() => {
    setParams((prev) => ({ ...prev, search: searchInput, page: 1 }));
  }, [searchInput, setParams]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSort = (column) => {
    const isAsc = orderBy === column && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(column);
    setParams((prev) => ({ ...prev, sortBy: column, sortDir: newOrder, page: 1 }));
  };

  const handlePageChange = (event, newPage) => {
    setParams((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleRowsPerPageChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setParams((prev) => ({ ...prev, size: newSize, page: 1 }));
  };

  const handleView = (id) => {
    navigate(`/visits/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/visits/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الزيارة؟')) {
      try {
        await visitsService.remove(id);
        setApiError(null);
        refresh();
      } catch (err) {
        console.error('Failed to delete visit:', err);
        setApiError(err.message || 'فشل حذف الزيارة');
      }
    }
  };

  const breadcrumbs = [{ title: 'الزيارات' }];

  return (
    <>
      <ModernPageHeader
        title="الزيارات"
        subtitle="إدارة زيارات الأعضاء لمقدمي الخدمة"
        icon={<LocalHospitalIcon />}
        breadcrumbs={breadcrumbs}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/visits/add')}>
            إضافة زيارة جديدة
          </Button>
        }
      />

      <MainCard>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <TextField
            placeholder="بحث..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: { xs: '100%', sm: 300 } }}
          />
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<SearchIcon />} onClick={handleSearch}>
              بحث
            </Button>
            <IconButton onClick={refresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Stack>

        {(error || apiError) && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setApiError(null)}>
            {apiError || error?.message || 'حدث خطأ أثناء تحميل البيانات'}
          </Alert>
        )}

        {loading && <TableSkeleton columns={6} rows={5} />}

        {!loading && data.items.length === 0 && (
          <ModernEmptyState
            icon={<LocalHospitalIcon sx={{ fontSize: 80 }} />}
            title="لا توجد زيارات"
            message={params.search ? 'لم يتم العثور على نتائج للبحث' : 'ابدأ بإضافة زيارة جديدة'}
            action={
              !params.search && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/visits/add')}>
                  إضافة زيارة جديدة
                </Button>
              )
            }
          />
        )}

        {!loading && data.items.length > 0 && (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'visitDate'}
                        direction={orderBy === 'visitDate' ? order : 'asc'}
                        onClick={() => handleSort('visitDate')}
                      >
                        تاريخ الزيارة
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>اسم العضو</TableCell>
                    <TableCell>مقدم الخدمة</TableCell>
                    <TableCell align="center">عدد الخدمات</TableCell>
                    <TableCell align="center">الحالة</TableCell>
                    <TableCell align="center">الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((visit) => (
                    <TableRow key={visit.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {visit.visitDate ? new Date(visit.visitDate).toLocaleDateString('ar-LY') : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>{visit.member?.fullName || visit.member?.nameAr || '-'}</TableCell>
                      <TableCell>{visit.provider?.nameAr || visit.provider?.nameEn || '-'}</TableCell>
                      <TableCell align="center">
                        <Chip label={visit.services?.length || 0} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={visit.active ? 'نشط' : 'غير نشط'} color={visit.active ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="عرض">
                            <IconButton size="small" color="info" onClick={() => handleView(visit.id)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="تعديل">
                            <IconButton size="small" color="primary" onClick={() => handleEdit(visit.id)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton size="small" color="error" onClick={() => handleDelete(visit.id)}>
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

            <TablePagination
              component="div"
              count={data.total}
              page={(data.page || 1) - 1}
              onPageChange={handlePageChange}
              rowsPerPage={data.size || 20}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[10, 20, 50, 100]}
              labelRowsPerPage="الصفوف في الصفحة:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
            />
          </>
        )}
      </MainCard>
    </>
  );
};

export default VisitsList;
