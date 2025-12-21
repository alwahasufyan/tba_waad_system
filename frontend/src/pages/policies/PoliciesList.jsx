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
  Stack,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Visibility, 
  Edit, 
  Delete,
  Policy as PolicyIcon,
  Groups as GroupsIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import ModernEmptyState from 'components/tba/ModernEmptyState';
import TableSkeleton from 'components/tba/LoadingSkeleton';
import { usePoliciesList, useDeletePolicy } from 'hooks/usePolicies';
import dayjs from 'dayjs';

// Insurance UX Components - Phase B2 Step 4
import { PolicyLifecycleBar, CardStatusBadge } from 'components/insurance';

// Policy Status Mapping for CardStatusBadge
const POLICY_STATUS_MAP = {
  true: 'ACTIVE',
  false: 'INACTIVE'
};

// Policy Type Labels (Arabic)
const POLICY_TYPE_LABELS = {
  GROUP: 'جماعية',
  INDIVIDUAL: 'فردية',
  CORPORATE: 'شركات'
};

// Check if policy needs renewal (within 30 days)
const isRenewalSoon = (endDate) => {
  if (!endDate) return false;
  const daysRemaining = dayjs(endDate).diff(dayjs(), 'day');
  return daysRemaining > 0 && daysRemaining <= 30;
};

// Check if policy is expired
const isPolicyExpired = (endDate) => {
  if (!endDate) return false;
  return dayjs().isAfter(dayjs(endDate));
};

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
    navigate(`/policies/${id}`);
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
    navigate('/policies/add');
  };

  // Safe data extraction
  const safeItems = Array.isArray(data?.items) ? data.items : [];

  return (
    <>
      <ModernPageHeader
        title="إدارة وثائق التأمين"
        subtitle="إدارة ومتابعة وثائق التأمين (البوالص)"
        icon={PolicyIcon}
        breadcrumbs={[{ label: 'وثائق التأمين', path: '/policies' }]}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            إضافة وثيقة جديدة
          </Button>
        }
      />

    <MainCard>
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="بحث بالاسم أو الكود أو الوصف..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: { xs: '100%', sm: 400 } }}
        />
      </Box>

      {/* Loading State */}
      {loading && <TableSkeleton rows={10} columns={7} />}

      {/* Empty State */}
      {!loading && safeItems.length === 0 && (
        <ModernEmptyState
          icon={PolicyIcon}
          title="لا توجد وثائق تأمين"
          description="لم يتم العثور على وثائق"
        />
      )}

      {/* Data Table */}
      {!loading && safeItems.length > 0 && (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>اسم الوثيقة</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>الكود</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>شركة التأمين</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>النوع</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>فترة التغطية</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>الحالة</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeItems.map((policy) => (
                <TableRow key={policy?.id ?? Math.random()} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PolicyIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {policy?.name ?? '-'}
                        </Typography>
                        {/* Member count if available */}
                        {typeof policy?.memberCount === 'number' && policy.memberCount > 0 && (
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <GroupsIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {policy.memberCount} عضو
                            </Typography>
                          </Stack>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip label={policy?.code ?? '-'} size="small" variant="outlined" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{policy?.insuranceCompanyName ?? '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    {/* Policy Type */}
                    <Chip 
                      label={POLICY_TYPE_LABELS[policy?.policyType] ?? 'غير محدد'} 
                      size="small" 
                      variant="outlined"
                      color="default"
                    />
                  </TableCell>
                  <TableCell>
                    {/* Insurance UX - PolicyLifecycleBar (compact) */}
                    {policy?.startDate ? (
                      <Box sx={{ minWidth: 180 }}>
                        <PolicyLifecycleBar
                          startDate={policy.startDate}
                          endDate={policy?.endDate}
                          showRenewalReminder={true}
                          renewalDays={30}
                          policyType={policy?.policyType ?? 'GROUP'}
                          memberCount={policy?.memberCount}
                          size="small"
                          language="ar"
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="column" spacing={0.5} alignItems="center">
                      {/* Insurance UX - CardStatusBadge */}
                      <CardStatusBadge
                        status={
                          isPolicyExpired(policy?.endDate) ? 'EXPIRED' :
                          policy?.active ? 'ACTIVE' : 'INACTIVE'
                        }
                        customLabel={
                          isPolicyExpired(policy?.endDate) ? 'منتهية' :
                          policy?.active ? 'نشطة' : 'غير نشطة'
                        }
                        size="small"
                        variant="chip"
                      />
                      {/* Renewal Warning Badge */}
                      {isRenewalSoon(policy?.endDate) && (
                        <Tooltip title="موعد التجديد قريب">
                          <Chip
                            icon={<WarningIcon sx={{ fontSize: 14 }} />}
                            label="تجديد قريب"
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ mt: 0.5, fontSize: '0.7rem' }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="عرض">
                        <IconButton size="small" color="primary" onClick={() => handleView(policy?.id)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="تعديل">
                        <IconButton size="small" color="info" onClick={() => handleEdit(policy?.id)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف">
                        <IconButton size="small" color="error" onClick={() => handleDelete(policy?.id)} disabled={deleting}>
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
      )}
    </MainCard>
    </>
  );
};

export default PoliciesList;
