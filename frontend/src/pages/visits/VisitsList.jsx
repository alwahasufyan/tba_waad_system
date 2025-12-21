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
  Alert,
  Box
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalHospital as LocalHospitalIcon,
  Refresh as RefreshIcon,
  MedicalServices as MedicalServicesIcon,
  Person as PersonIcon
} from '@mui/icons-material';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import ModernEmptyState from 'components/tba/ModernEmptyState';
import TableSkeleton from 'components/tba/LoadingSkeleton';
import { useVisitsList } from 'hooks/useVisits';
import visitsService from 'services/api/visits.service';

// Insurance UX Components - Phase B3
import { NetworkBadge, CardStatusBadge } from 'components/insurance';

// ============ VISIT CONFIGURATION ============
// Visit Type Labels (Arabic)
const VISIT_TYPE_LABELS_AR = {
  EMERGENCY: 'طوارئ',
  SCHEDULED: 'مجدولة',
  FOLLOW_UP: 'متابعة',
  ROUTINE: 'روتينية'
};

// Visit Type Colors
const VISIT_TYPE_COLORS = {
  EMERGENCY: 'error',
  SCHEDULED: 'primary',
  FOLLOW_UP: 'info',
  ROUTINE: 'default'
};

// Status Labels (Arabic)
const STATUS_LABELS_AR = {
  ACTIVE: 'نشطة',
  INACTIVE: 'غير نشطة',
  COMPLETED: 'مكتملة',
  CANCELLED: 'ملغاة'
};

// Network Status mapping
const getNetworkTier = (provider) => {
  if (!provider) return null;
  if (provider?.networkStatus) return provider.networkStatus;
  if (provider?.inNetwork === true) return 'IN_NETWORK';
  if (provider?.inNetwork === false) return 'OUT_OF_NETWORK';
  if (provider?.contracted === true) return 'IN_NETWORK';
  if (provider?.contracted === false) return 'OUT_OF_NETWORK';
  return null;
};

// Get visit status
const getVisitStatus = (visit) => {
  if (visit?.status) return visit.status;
  if (visit?.active === true) return 'ACTIVE';
  if (visit?.active === false) return 'INACTIVE';
  return 'ACTIVE';
};

// ============ DEFENSIVE DATA EXTRACTION ============
// Handle all possible API response shapes
const extractItems = (data) => {
  if (!data) return [];
  if (data?.data?.items && Array.isArray(data.data.items)) return data.data.items;
  if (data?.data?.content && Array.isArray(data.data.content)) return data.data.content;
  if (data?.items && Array.isArray(data.items)) return data.items;
  if (data?.content && Array.isArray(data.content)) return data.content;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};

// Extract total count defensively
const extractTotal = (data) => {
  if (!data) return 0;
  if (typeof data?.data?.total === 'number') return data.data.total;
  if (typeof data?.data?.totalElements === 'number') return data.data.totalElements;
  if (typeof data?.total === 'number') return data.total;
  if (typeof data?.totalElements === 'number') return data.totalElements;
  return extractItems(data).length;
};

// Extract page info defensively
const extractPage = (data) => {
  if (!data) return 1;
  if (typeof data?.data?.page === 'number') return data.data.page;
  if (typeof data?.page === 'number') return data.page;
  if (typeof data?.data?.number === 'number') return data.data.number + 1;
  if (typeof data?.number === 'number') return data.number + 1;
  return 1;
};

const extractSize = (data, defaultSize = 20) => {
  if (!data) return defaultSize;
  if (typeof data?.data?.size === 'number') return data.data.size;
  if (typeof data?.size === 'number') return data.size;
  return defaultSize;
};

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

        {!loading && extractItems(data).length === 0 && (
          <ModernEmptyState
            icon={<LocalHospitalIcon sx={{ fontSize: 80 }} />}
            title="لا توجد زيارات طبية مسجلة حاليًا"
            message={params.search ? 'لم يتم العثور على نتائج للبحث' : 'ابدأ بإضافة زيارة طبية جديدة'}
            action={
              !params.search && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/visits/add')}>
                  إضافة زيارة جديدة
                </Button>
              )
            }
          />
        )}

        {!loading && extractItems(data).length > 0 && (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel
                        active={orderBy === 'visitDate'}
                        direction={orderBy === 'visitDate' ? order : 'asc'}
                        onClick={() => handleSort('visitDate')}
                      >
                        تاريخ الزيارة
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>اسم العضو</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>مقدم الخدمة</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>الخدمات المقدمة</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>الحالة</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {extractItems(data).map((visit) => {
                    if (!visit) return null;
                    const visitId = visit?.id ?? Math.random();
                    const visitStatus = getVisitStatus(visit);
                    const networkTier = getNetworkTier(visit?.provider);
                    const services = Array.isArray(visit?.services) ? visit.services : [];
                    
                    return (
                      <TableRow key={visitId} hover>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2" fontWeight="medium">
                              {visit?.visitDate ? new Date(visit.visitDate).toLocaleDateString('ar-LY') : '—'}
                            </Typography>
                            {/* Visit Type if available */}
                            {visit?.visitType && (
                              <Chip
                                label={VISIT_TYPE_LABELS_AR[visit.visitType] ?? visit.visitType}
                                color={VISIT_TYPE_COLORS[visit.visitType] ?? 'default'}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {visit?.member?.fullName ?? visit?.member?.nameAr ?? visit?.member?.nameEn ?? '—'}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2">
                              {visit?.provider?.nameAr ?? visit?.provider?.nameEn ?? visit?.provider?.name ?? '—'}
                            </Typography>
                            {/* Network Badge */}
                            {networkTier && (
                              <NetworkBadge
                                networkTier={networkTier}
                                showLabel={true}
                                size="small"
                                language="ar"
                              />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {/* Services Preview - up to 3 chips */}
                          {services.length > 0 ? (
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                              {services.slice(0, 3).map((service, idx) => (
                                <Tooltip key={service?.id ?? idx} title={service?.nameAr ?? service?.nameEn ?? ''}>
                                  <Chip
                                    icon={<MedicalServicesIcon sx={{ fontSize: 14 }} />}
                                    label={service?.code ?? service?.nameAr?.substring(0, 10) ?? `خدمة ${idx + 1}`}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                    sx={{ mb: 0.5 }}
                                  />
                                </Tooltip>
                              ))}
                              {services.length > 3 && (
                                <Chip
                                  label={`+${services.length - 3}`}
                                  size="small"
                                  color="default"
                                  sx={{ mb: 0.5 }}
                                />
                              )}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              لا توجد خدمات
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <CardStatusBadge
                            status={visitStatus}
                            customLabel={STATUS_LABELS_AR[visitStatus] ?? 'غير محدد'}
                            size="small"
                            variant="chip"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="عرض التفاصيل">
                              <IconButton size="small" color="info" onClick={() => handleView(visitId)}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="تعديل">
                              <IconButton size="small" color="primary" onClick={() => handleEdit(visitId)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="حذف">
                              <IconButton size="small" color="error" onClick={() => handleDelete(visitId)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={extractTotal(data)}
              page={extractPage(data) - 1}
              onPageChange={handlePageChange}
              rowsPerPage={extractSize(data)}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[10, 20, 50, 100]}
              labelRowsPerPage="الصفوف في الصفحة:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count !== -1 ? count : `أكثر من ${to}`}`}
            />
          </>
        )}
      </MainCard>
    </>
  );
};

export default VisitsList;
