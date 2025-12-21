/**
 * Medical Services List Page - GOLDEN REFERENCE MODULE
 * Phase D2 - Reference Module Pattern
 * 
 * ⚠️ This is the REFERENCE implementation for all CRUD list pages.
 * Pattern: ModernPageHeader → MainCard → (Filters → Table/Loading/Empty/Error)
 * 
 * Rules Applied:
 * 1. icon={Component} - NEVER JSX
 * 2. Arabic only - No English labels
 * 3. Array.isArray() for all lists
 * 4. Defensive optional chaining
 * 5. Proper error states (403 صلاحيات, 500 خطأ تقني)
 */

import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI Components
import {
  Box,
  Button,
  Chip,
  Grid,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

// MUI Icons - Always as Component, NEVER as JSX
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import LockIcon from '@mui/icons-material/Lock';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import ModernEmptyState from 'components/tba/ModernEmptyState';
import TableSkeleton from 'components/tba/LoadingSkeleton';

// Hooks & Services
import { useMedicalServicesList } from 'hooks/useMedicalServices';
import { useAllMedicalCategories } from 'hooks/useMedicalCategories';
import { deleteMedicalService } from 'services/api/medical-services.service';

// ============================================================================
// CONSTANTS
// ============================================================================

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

const STATUS_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'true', label: 'نشط' },
  { value: 'false', label: 'غير نشط' }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse error response and return appropriate Arabic message
 */
const getErrorMessage = (error) => {
  const status = error?.response?.status || error?.status;
  
  if (status === 403) {
    return {
      type: 'permission',
      title: 'غير مصرح',
      message: 'ليس لديك صلاحية للوصول إلى هذه الصفحة',
      icon: LockIcon
    };
  }
  
  if (status === 500 || status >= 500) {
    return {
      type: 'server',
      title: 'خطأ تقني',
      message: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً',
      icon: ErrorOutlineIcon
    };
  }
  
  return {
    type: 'generic',
    title: 'خطأ',
    message: error?.message || 'حدث خطأ أثناء تحميل البيانات',
    icon: ErrorOutlineIcon
  };
};

/**
 * Format price with LYD currency
 */
const formatPrice = (value) => {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toFixed(2)} د.ل`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MedicalServicesList = () => {
  const navigate = useNavigate();
  
  // ========================================
  // STATE
  // ========================================
  
  const [searchInput, setSearchInput] = useState('');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [filters, setFilters] = useState({
    categoryId: '',
    active: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // ========================================
  // DATA FETCHING
  // ========================================
  
  const { data, loading, error, params, setParams, refresh } = useMedicalServicesList({
    page: 1,
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'desc'
  });
  
  // Load categories for filter dropdown
  const { data: categories, loading: categoriesLoading } = useAllMedicalCategories();
  
  // ========================================
  // DERIVED DATA - Defensive
  // ========================================
  
  const items = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data.items) ? data.items : [];
  }, [data]);
  
  const total = data?.total ?? 0;
  const currentPage = (data?.page ?? 1) - 1;
  const pageSize = data?.size ?? 20;
  
  const categoryList = useMemo(() => {
    if (!categories) return [];
    return Array.isArray(categories) ? categories : [];
  }, [categories]);
  
  // ========================================
  // HANDLERS
  // ========================================
  
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    setParams((prev) => ({ ...prev, page: 1, search: searchInput.trim() }));
  }, [searchInput, setParams]);
  
  const handleSearchClear = useCallback(() => {
    setSearchInput('');
    setParams((prev) => ({ ...prev, search: '', page: 1 }));
  }, [setParams]);
  
  const handleFilterChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, [field]: value }));
    setParams((prev) => ({ ...prev, page: 1, [field]: value || undefined }));
  }, [setParams]);
  
  const handleClearFilters = useCallback(() => {
    setFilters({ categoryId: '', active: '' });
    setSearchInput('');
    setParams((prev) => ({
      ...prev,
      page: 1,
      search: '',
      categoryId: undefined,
      active: undefined
    }));
  }, [setParams]);
  
  const handleRequestSort = useCallback((property) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(property);
    setParams((prev) => ({
      ...prev,
      sortBy: property,
      sortDir: newOrder
    }));
  }, [orderBy, order, setParams]);
  
  const handleChangePage = useCallback((_, newPage) => {
    setParams((prev) => ({ ...prev, page: newPage + 1 }));
  }, [setParams]);
  
  const handleChangeRowsPerPage = useCallback((event) => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      size: parseInt(event.target.value, 10)
    }));
  }, [setParams]);
  
  const handleDelete = useCallback(async (id, name) => {
    const confirmMessage = `هل أنت متأكد من حذف الخدمة "${name}"؟`;
    if (!window.confirm(confirmMessage)) return;
    
    try {
      await deleteMedicalService(id);
      refresh();
    } catch (err) {
      console.error('[MedicalServices] Delete failed:', err);
      alert('فشل حذف الخدمة. يرجى المحاولة لاحقاً');
    }
  }, [refresh]);
  
  const handleNavigateAdd = useCallback(() => {
    navigate('/medical-services/add');
  }, [navigate]);
  
  const handleNavigateView = useCallback((id) => {
    navigate(`/medical-services/${id}`);
  }, [navigate]);
  
  const handleNavigateEdit = useCallback((id) => {
    navigate(`/medical-services/edit/${id}`);
  }, [navigate]);
  
  // ========================================
  // CHECK FOR ACTIVE FILTERS
  // ========================================
  
  const hasActiveFilters = useMemo(() => {
    return searchInput.trim() !== '' || filters.categoryId !== '' || filters.active !== '';
  }, [searchInput, filters]);
  
  // ========================================
  // RENDER ERROR STATE
  // ========================================
  
  if (error && !loading) {
    const errorInfo = getErrorMessage(error);
    const ErrorIcon = errorInfo.icon;
    
    return (
      <Box>
        <ModernPageHeader
          title="الخدمات الطبية"
          subtitle="إدارة الخدمات الطبية في النظام"
          icon={MedicalServicesIcon}
          breadcrumbs={[
            { label: 'الرئيسية', path: '/' },
            { label: 'الخدمات الطبية' }
          ]}
        />
        
        <MainCard>
          <ModernEmptyState
            icon={ErrorIcon}
            title={errorInfo.title}
            description={errorInfo.message}
            action={
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={refresh}
              >
                إعادة المحاولة
              </Button>
            }
          />
        </MainCard>
      </Box>
    );
  }
  
  // ========================================
  // MAIN RENDER
  // ========================================
  
  return (
    <Box>
      {/* ====== PAGE HEADER ====== */}
      <ModernPageHeader
        title="الخدمات الطبية"
        subtitle="إدارة الخدمات الطبية في النظام"
        icon={MedicalServicesIcon}
        breadcrumbs={[
          { label: 'الرئيسية', path: '/' },
          { label: 'الخدمات الطبية' }
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
              onClick={handleNavigateAdd}
            >
              إضافة خدمة جديدة
            </Button>
          </Stack>
        }
      />
      
      {/* ====== MAIN CARD ====== */}
      <MainCard>
        {/* ====== SEARCH & FILTERS ====== */}
        <Box sx={{ mb: 3 }}>
          {/* Search Bar */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box component="form" onSubmit={handleSearchSubmit}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="البحث في الخدمات الطبية..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: searchInput && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={handleSearchClear}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant={showFilters ? 'contained' : 'outlined'}
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  color={hasActiveFilters ? 'primary' : 'inherit'}
                >
                  الفلاتر
                  {hasActiveFilters && (
                    <Chip
                      size="small"
                      label="نشط"
                      color="primary"
                      sx={{ ml: 1, height: 20 }}
                    />
                  )}
                </Button>
                
                {hasActiveFilters && (
                  <Button
                    variant="text"
                    startIcon={<ClearIcon />}
                    onClick={handleClearFilters}
                    color="error"
                  >
                    مسح الفلاتر
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
          
          {/* Filter Panel */}
          {showFilters && (
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Grid container spacing={2}>
                {/* Category Filter */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>التصنيف</InputLabel>
                    <Select
                      value={filters.categoryId}
                      onChange={handleFilterChange('categoryId')}
                      label="التصنيف"
                      disabled={categoriesLoading}
                    >
                      <MenuItem value="">الكل</MenuItem>
                      {categoryList.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.nameAr || cat.nameEn || '-'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Status Filter */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>الحالة</InputLabel>
                    <Select
                      value={filters.active}
                      onChange={handleFilterChange('active')}
                      label="الحالة"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>
        
        {/* ====== LOADING STATE ====== */}
        {loading && <TableSkeleton columns={8} rows={10} />}
        
        {/* ====== EMPTY STATE ====== */}
        {!loading && items.length === 0 && (
          <ModernEmptyState
            icon={MedicalServicesIcon}
            title="لا توجد خدمات طبية"
            description={
              hasActiveFilters
                ? 'لم يتم العثور على نتائج مطابقة للبحث أو الفلاتر المحددة'
                : 'لم يتم إضافة أي خدمات طبية بعد'
            }
            action={
              hasActiveFilters ? (
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                >
                  مسح الفلاتر
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleNavigateAdd}
                >
                  إضافة خدمة جديدة
                </Button>
              )
            }
          />
        )}
        
        {/* ====== DATA TABLE ====== */}
        {!loading && items.length > 0 && (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    {/* Code Column */}
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'code'}
                        direction={orderBy === 'code' ? order : 'asc'}
                        onClick={() => handleRequestSort('code')}
                      >
                        الرمز
                      </TableSortLabel>
                    </TableCell>
                    
                    {/* Arabic Name Column */}
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'nameAr'}
                        direction={orderBy === 'nameAr' ? order : 'asc'}
                        onClick={() => handleRequestSort('nameAr')}
                      >
                        الاسم (عربي)
                      </TableSortLabel>
                    </TableCell>
                    
                    {/* English Name Column */}
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'nameEn'}
                        direction={orderBy === 'nameEn' ? order : 'asc'}
                        onClick={() => handleRequestSort('nameEn')}
                      >
                        الاسم (إنجليزي)
                      </TableSortLabel>
                    </TableCell>
                    
                    {/* Category Column */}
                    <TableCell>التصنيف</TableCell>
                    
                    {/* Price Column */}
                    <TableCell align="right">السعر</TableCell>
                    
                    {/* Requires Approval Column */}
                    <TableCell align="center">موافقة مسبقة</TableCell>
                    
                    {/* Status Column */}
                    <TableCell align="center">الحالة</TableCell>
                    
                    {/* Actions Column */}
                    <TableCell align="center">الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                
                <TableBody>
                  {items.map((service) => (
                    <TableRow key={service?.id} hover>
                      {/* Code */}
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {service?.code || '-'}
                        </Typography>
                      </TableCell>
                      
                      {/* Arabic Name */}
                      <TableCell>
                        <Typography variant="body2">
                          {service?.nameAr || '-'}
                        </Typography>
                      </TableCell>
                      
                      {/* English Name */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {service?.nameEn || '-'}
                        </Typography>
                      </TableCell>
                      
                      {/* Category */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {service?.category?.nameAr || service?.category?.nameEn || '-'}
                        </Typography>
                      </TableCell>
                      
                      {/* Price */}
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatPrice(service?.priceLyd)}
                        </Typography>
                      </TableCell>
                      
                      {/* Requires Approval */}
                      <TableCell align="center">
                        {service?.requiresApproval ? (
                          <Tooltip title="تتطلب موافقة مسبقة">
                            <CheckCircleIcon fontSize="small" color="success" />
                          </Tooltip>
                        ) : (
                          <Tooltip title="لا تتطلب موافقة">
                            <CancelIcon fontSize="small" color="disabled" />
                          </Tooltip>
                        )}
                      </TableCell>
                      
                      {/* Status */}
                      <TableCell align="center">
                        <Chip
                          label={service?.active ? 'نشط' : 'غير نشط'}
                          color={service?.active ? 'success' : 'default'}
                          size="small"
                          variant="light"
                        />
                      </TableCell>
                      
                      {/* Actions */}
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="عرض">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleNavigateView(service?.id)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="تعديل">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleNavigateEdit(service?.id)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="حذف">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(service?.id, service?.nameAr || service?.code)}
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
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              labelRowsPerPage="عدد الصفوف:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
              }
            />
          </>
        )}
      </MainCard>
    </Box>
  );
};

export default MedicalServicesList;
