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
  CardGiftcard as CardGiftcardIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import ModernEmptyState from 'components/tba/ModernEmptyState';
import TableSkeleton from 'components/tba/LoadingSkeleton';
import { useBenefitPackagesList } from 'hooks/useBenefitPackages';
import { deleteBenefitPackage } from 'services/api/benefit-packages.service';

/**
 * Benefit Packages List Page
 * Displays paginated list of benefit packages with search, sort, and CRUD operations
 */
const BenefitPackagesList = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [apiError, setApiError] = useState(null);

  const { data, loading, error, params, setParams, refresh } = useBenefitPackagesList({
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
    navigate(`/benefit-packages/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/benefit-packages/edit/${id}`);
  };

  const handleDelete = async (id, packageName) => {
    if (window.confirm(`هل أنت متأكد من حذف الباقة "${packageName}"؟`)) {
      try {
        await deleteBenefitPackage(id);
        setApiError(null);
        refresh();
      } catch (err) {
        console.error('Failed to delete benefit package:', err);
        setApiError(err.message || 'فشل حذف الباقة');
      }
    }
  };

  const breadcrumbs = [{ title: 'باقات المنافع' }];

  return (
    <>
      <ModernPageHeader
        title="باقات المنافع"
        subtitle="إدارة باقات المنافع التأمينية"
        icon={CardGiftcardIcon}
        breadcrumbs={breadcrumbs}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/benefit-packages/create')}>
            إضافة باقة جديدة
          </Button>
        }
      />

      <MainCard>
        {/* Search and Actions */}
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

        {/* Error Alert */}
        {(error || apiError) && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setApiError(null)}>
            {apiError || error?.message || 'حدث خطأ أثناء تحميل البيانات'}
          </Alert>
        )}

        {/* Loading State */}
        {loading && <TableSkeleton columns={7} rows={5} />}

        {/* Empty State */}
        {!loading && (!data?.items || data.items.length === 0) && (
          <ModernEmptyState
            icon={CardGiftcardIcon}
            title="لا توجد باقات منافع"
            description={params.search ? 'لم يتم العثور على نتائج للبحث' : 'ابدأ بإضافة باقة منافع جديدة'}
            action={
              !params.search && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/benefit-packages/create')}>
                  إضافة باقة جديدة
                </Button>
              )
            }
          />
        )}

        {/* Data Table */}
        {!loading && data?.items && data.items.length > 0 && (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'code'}
                        direction={orderBy === 'code' ? order : 'asc'}
                        onClick={() => handleSort('code')}
                      >
                        الكود
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'nameAr'}
                        direction={orderBy === 'nameAr' ? order : 'asc'}
                        onClick={() => handleSort('nameAr')}
                      >
                        الاسم بالعربية
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'nameEn'}
                        direction={orderBy === 'nameEn' ? order : 'asc'}
                        onClick={() => handleSort('nameEn')}
                      >
                        الاسم بالإنجليزية
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center">عدد الباقات الطبية</TableCell>
                    <TableCell align="right">حد التغطية</TableCell>
                    <TableCell align="center">الصلاحية</TableCell>
                    <TableCell align="center">الحالة</TableCell>
                    <TableCell align="center">الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(data?.items) && data.items.map((pkg) => (
                    <TableRow key={pkg.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {pkg.code}
                        </Typography>
                      </TableCell>
                      <TableCell>{pkg.nameAr || '-'}</TableCell>
                      <TableCell>{pkg.nameEn || '-'}</TableCell>
                      <TableCell align="center">
                        <Chip label={pkg.medicalPackages?.length || 0} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">{pkg.coverageLimit ? `${pkg.coverageLimit.toFixed(2)}` : '-'}</TableCell>
                      <TableCell align="center">{pkg.validityDays ? `${pkg.validityDays} يوم` : '-'}</TableCell>
                      <TableCell align="center">
                        <Chip label={pkg.active ? 'نشط' : 'غير نشط'} color={pkg.active ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="عرض">
                            <IconButton size="small" color="info" onClick={() => handleView(pkg.id)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="تعديل">
                            <IconButton size="small" color="primary" onClick={() => handleEdit(pkg.id)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(pkg.id, pkg.nameAr || pkg.nameEn)}
                            >
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

export default BenefitPackagesList;
