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
  Category as CategoryIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import ModernEmptyState from 'components/tba/ModernEmptyState';
import TableSkeleton from 'components/tba/LoadingSkeleton';
import { useMedicalCategoriesList } from 'hooks/useMedicalCategories';
import { deleteMedicalCategory } from 'services/api/medical-categories.service';

/**
 * Medical Categories List Page
 * Displays paginated list of medical categories with search, sort, and CRUD operations
 */
const MedicalCategoriesList = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const { data, loading, error, params, setParams, refresh } = useMedicalCategoriesList({
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
    if (!window.confirm('هل أنت متأكد من حذف هذا التصنيف الطبي؟')) return;
    try {
      await deleteMedicalCategory(id);
      refresh();
    } catch (err) {
      console.error('Failed to delete medical category:', err);
    }
  };

  const items = data?.items || [];
  const total = data?.total || 0;
  const currentPage = (data?.page || 1) - 1;
  const pageSize = data?.size || 20;

  return (
    <Box>
      <ModernPageHeader
        title="التصنيفات الطبية"
        subtitle="إدارة التصنيفات الطبية في النظام"
        icon={CategoryIcon}
        breadcrumbs={[
          { label: 'الرئيسية', path: '/' },
          { label: 'الخدمات الطبية', path: '/medical-categories' },
          { label: 'التصنيفات الطبية' }
        ]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refresh}
              disabled={loading}
            >
              تحديث
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/medical-categories/add')}
            >
              إضافة تصنيف جديد
            </Button>
          </Stack>
        }
      />

      <MainCard>
        {/* Search Bar */}
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="البحث في التصنيفات..."
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
                  <IconButton size="small" onClick={() => { setSearchInput(''); setParams((prev) => ({ ...prev, search: '', page: 1 })); }}>
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
        {loading && <TableSkeleton columns={5} rows={10} />}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <ModernEmptyState
            icon={CategoryIcon}
            title="لا توجد تصنيفات طبية"
            description={params.search ? 'لم يتم العثور على نتائج للبحث' : 'لم يتم إضافة أي تصنيفات طبية بعد'}
            action={
              !params.search && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/medical-categories/add')}
                >
                  إضافة تصنيف جديد
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
                    <TableCell align="center">الحالة</TableCell>
                    <TableCell align="center">الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((category) => (
                    <TableRow key={category.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {category.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{category.nameAr}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {category.nameEn}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={category.active ? 'نشط' : 'غير نشط'}
                          color={category.active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="عرض">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/medical-categories/${category.id}`)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="تعديل">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => navigate(`/medical-categories/edit/${category.id}`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(category.id)}
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

export default MedicalCategoriesList;
