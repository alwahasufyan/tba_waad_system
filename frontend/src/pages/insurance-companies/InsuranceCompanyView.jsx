import { useParams, useNavigate } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  Alert
} from '@mui/material';

// Icons
import { 
  EditOutlined, 
  ArrowLeftOutlined,
  BankOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';
import { useInsuranceCompanyDetails } from 'hooks/useInsuranceCompanies';

// Insurance UX Components - Phase B2 Step 5
import { CardStatusBadge } from 'components/insurance';

// ============ STATUS CONFIGURATION ============
const STATUS_LABELS_AR = {
  ACTIVE: 'نشطة',
  INACTIVE: 'غير نشطة',
  SUSPENDED: 'موقوفة',
  EXPIRED: 'منتهية'
};

const InsuranceCompanyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { insuranceCompany, loading, error } = useInsuranceCompanyDetails(id);

  if (loading) {
    return (
      <MainCard>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (error || !insuranceCompany) {
    return (
      <MainCard>
        <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
          <BankOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
          <Typography variant="h5" color="error">
            {error ?? 'شركة التأمين غير موجودة'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            تأكد من صحة الرابط أو أن الشركة لم يتم حذفها
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowLeftOutlined />}
            onClick={() => navigate('/insurance-companies')}
          >
            العودة إلى قائمة شركات التأمين
          </Button>
        </Stack>
      </MainCard>
    );
  }

  // Enhanced InfoRow with icon support and defensive coding
  const InfoRow = ({ label, value, icon: Icon }) => (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={12} sm={4}>
        <Stack direction="row" spacing={1} alignItems="center">
          {Icon && <Icon style={{ fontSize: 14, color: '#8c8c8c' }} />}
          <Typography variant="subtitle2" color="text.secondary">
            {label ?? '—'}
          </Typography>
        </Stack>
      </Grid>
      <Grid item xs={12} sm={8}>
        <Typography variant="body1">{value ?? '—'}</Typography>
      </Grid>
    </Grid>
  );

  // Derive status defensively
  const companyStatus = insuranceCompany?.active ? 'ACTIVE' : 'INACTIVE';

  return (
    <MainCard>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <BankOutlined style={{ fontSize: 28, color: '#1890ff' }} />
          <Box>
            <Typography variant="h4">
              شركة التأمين: {insuranceCompany?.name ?? '—'}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Chip 
                label={insuranceCompany?.code ?? '—'} 
                size="small" 
                variant="outlined" 
                color="primary"
              />
              <CardStatusBadge
                status={companyStatus}
                customLabel={STATUS_LABELS_AR[companyStatus] ?? 'غير محدد'}
                size="small"
                variant="chip"
              />
            </Stack>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ArrowLeftOutlined />}
            onClick={() => navigate('/insurance-companies')}
          >
            رجوع
          </Button>
          <Button
            variant="contained"
            startIcon={<EditOutlined />}
            onClick={() => navigate(`/insurance-companies/edit/${id}`)}
          >
            تعديل
          </Button>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* Basic Information Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <BankOutlined style={{ fontSize: 18, color: '#1890ff' }} />
          <Typography variant="h5">المعلومات الأساسية</Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <InfoRow label="اسم الشركة" value={insuranceCompany?.name} />
        <InfoRow label="الرمز / الكود" value={insuranceCompany?.code} />
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">
              الحالة
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <CardStatusBadge
              status={companyStatus}
              customLabel={STATUS_LABELS_AR[companyStatus] ?? 'غير محدد'}
              size="medium"
              variant="chip"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Contact Information Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <PhoneOutlined style={{ fontSize: 18, color: '#52c41a' }} />
          <Typography variant="h5">بيانات التواصل</Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <InfoRow label="رقم الهاتف" value={insuranceCompany?.phone} icon={PhoneOutlined} />
        <InfoRow label="البريد الإلكتروني" value={insuranceCompany?.email} icon={MailOutlined} />
        <InfoRow label="الشخص المسؤول" value={insuranceCompany?.contactPerson} icon={UserOutlined} />
        <InfoRow label="العنوان" value={insuranceCompany?.address} icon={EnvironmentOutlined} />
      </Paper>

      {/* Audit Information Section */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <ClockCircleOutlined style={{ fontSize: 18, color: '#faad14' }} />
          <Typography variant="h5">معلومات التدقيق</Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <InfoRow
          label="تاريخ الإنشاء"
          icon={ClockCircleOutlined}
          value={
            insuranceCompany?.createdAt
              ? new Date(insuranceCompany.createdAt).toLocaleString('ar-LY', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : '—'
          }
        />
        <InfoRow
          label="تاريخ آخر تحديث"
          icon={ClockCircleOutlined}
          value={
            insuranceCompany?.updatedAt
              ? new Date(insuranceCompany.updatedAt).toLocaleString('ar-LY', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : '—'
          }
        />
      </Paper>
    </MainCard>
  );
};

export default InsuranceCompanyView;
