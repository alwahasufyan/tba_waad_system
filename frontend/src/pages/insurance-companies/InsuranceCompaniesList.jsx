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
  Typography,
  Alert
} from '@mui/material';

// Icons
import { 
  PlusOutlined, 
  EditOutlined, 
  EyeOutlined, 
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  BankOutlined,
  SearchOutlined
} from '@ant-design/icons';

// Project imports
import MainCard from 'components/MainCard';
import { useInsuranceCompaniesList, useDeleteInsuranceCompany } from 'hooks/useInsuranceCompanies';

// Insurance UX Components - Phase B2 Step 5
import { CardStatusBadge } from 'components/insurance';

// ============ INSURANCE COMPANY STATUS CONFIGURATION ============
// Status mapping for CardStatusBadge
const INSURANCE_STATUS_MAP = {
  true: 'ACTIVE',
  false: 'INACTIVE'
};

// Arabic status labels
const STATUS_LABELS_AR = {
  ACTIVE: 'نشطة',
  INACTIVE: 'غير نشطة',
  SUSPENDED: 'موقوفة',
  EXPIRED: 'منتهية'
};

// ============ DEFENSIVE DATA EXTRACTION ============
// Handle all possible API response shapes
const extractItems = (data) => {
  if (!data) return [];
  // Shape 1: data.data.items (nested pagination)
  if (data?.data?.items && Array.isArray(data.data.items)) return data.data.items;
  // Shape 2: data.items (direct pagination)
  if (data?.items && Array.isArray(data.items)) return data.items;
  // Shape 3: data.data (nested array)
  if (data?.data && Array.isArray(data.data)) return data.data;
  // Shape 4: data itself is array
  if (Array.isArray(data)) return data;
  return [];
};

// Extract total count defensively
const extractTotal = (data) => {
  if (!data) return 0;
  if (typeof data?.data?.total === 'number') return data.data.total;
  if (typeof data?.total === 'number') return data.total;
  if (typeof data?.data?.totalElements === 'number') return data.data.totalElements;
  if (typeof data?.totalElements === 'number') return data.totalElements;
  // Fallback to items length
  return extractItems(data).length;
};

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
        <Stack direction="row" spacing={1.5} alignItems="center">
          <BankOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Typography variant="h4">إدارة شركات التأمين</Typography>
        </Stack>
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
          placeholder="بحث باسم الشركة، الرمز، رقم الهاتف، أو البريد الإلكتروني..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchOutlined style={{ marginLeft: 8, color: '#8c8c8c' }} />
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>اسم الشركة</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>الرمز/الكود</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>بيانات التواصل</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>الحالة</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">جاري تحميل شركات التأمين...</Typography>
                </TableCell>
              </TableRow>
            ) : extractItems(data).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Stack spacing={2} alignItems="center">
                    <BankOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                    <Typography variant="h6" color="text.secondary">
                      لا توجد شركات تأمين مسجلة بعد
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      اضغط على "إضافة شركة تأمين" لإضافة أول شركة
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<PlusOutlined />}
                      onClick={() => navigate('/insurance-companies/create')}
                    >
                      إضافة شركة تأمين
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              extractItems(data).map((company, index) => {
                // Defensive: ensure company object exists
                if (!company) return null;
                const companyId = company?.id ?? `temp-${index}`;
                const companyStatus = company?.active ? 'ACTIVE' : 'INACTIVE';
                
                return (
                  <TableRow key={companyId} hover>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {((params?.page ?? 1) - 1) * (params?.size ?? 10) + index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body1" fontWeight={500}>
                          {company?.name ?? '—'}
                        </Typography>
                        {/* Show contact person if available */}
                        {company?.contactPerson && (
                          <Typography variant="caption" color="text.secondary">
                            المسؤول: {company.contactPerson}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={company?.code ?? '—'} 
                        size="small" 
                        variant="outlined" 
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        {/* Phone with icon */}
                        {company?.phone ? (
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <PhoneOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                            <Typography variant="body2">{company.phone}</Typography>
                          </Stack>
                        ) : null}
                        {/* Email with icon */}
                        {company?.email ? (
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <MailOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                              {company.email}
                            </Typography>
                          </Stack>
                        ) : null}
                        {/* Fallback if no contact info */}
                        {!company?.phone && !company?.email && (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      {/* Insurance UX - CardStatusBadge */}
                      <CardStatusBadge
                        status={companyStatus}
                        customLabel={STATUS_LABELS_AR[companyStatus] ?? 'غير محدد'}
                        size="small"
                        variant="chip"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="عرض التفاصيل">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => navigate(`/insurance-companies/view/${companyId}`)}
                          >
                            <EyeOutlined />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="تعديل">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => navigate(`/insurance-companies/edit/${companyId}`)}
                          >
                            <EditOutlined />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="حذف">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDelete(companyId)}
                            disabled={deleting}
                          >
                            <DeleteOutlined />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={extractTotal(data)}
        page={(params?.page ?? 1) - 1}
        onPageChange={handleChangePage}
        rowsPerPage={params?.size ?? 10}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="عدد الصفوف في الصفحة:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count !== -1 ? count : `أكثر من ${to}`}`}
      />
    </MainCard>
  );
};

export default InsuranceCompaniesList;
