import { useParams, useNavigate } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography
} from '@mui/material';

// Icons
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';
import { useInsuranceCompanyDetails } from 'hooks/useInsuranceCompanies';

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
        <Typography variant="h5" color="error">
          {error || 'شركة التأمين غير موجودة'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowLeftOutlined />}
          onClick={() => navigate('/insurance-companies')}
          sx={{ mt: 2 }}
        >
          العودة إلى القائمة
        </Button>
      </MainCard>
    );
  }

  const InfoRow = ({ label, value }) => (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={12} sm={4}>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={8}>
        <Typography variant="body1">{value || '-'}</Typography>
      </Grid>
    </Grid>
  );

  return (
    <MainCard>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">تفاصيل شركة التأمين</Typography>
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          المعلومات الأساسية
        </Typography>
        <InfoRow label="الاسم" value={insuranceCompany.name} />
        <InfoRow label="الرمز" value={insuranceCompany.code} />
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">
              الحالة
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Chip
              label={insuranceCompany.active ? 'نشط' : 'غير نشط'}
              color={insuranceCompany.active ? 'success' : 'default'}
              size="small"
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Contact Information Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          معلومات الاتصال
        </Typography>
        <InfoRow label="الهاتف" value={insuranceCompany.phone} />
        <InfoRow label="البريد الإلكتروني" value={insuranceCompany.email} />
        <InfoRow label="الشخص المسؤول" value={insuranceCompany.contactPerson} />
        <InfoRow label="العنوان" value={insuranceCompany.address} />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Audit Information Section */}
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>
          معلومات التدقيق
        </Typography>
        <InfoRow
          label="تاريخ الإنشاء"
          value={
            insuranceCompany.createdAt
              ? new Date(insuranceCompany.createdAt).toLocaleString('ar-LY', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : '-'
          }
        />
        <InfoRow
          label="تاريخ آخر تحديث"
          value={
            insuranceCompany.updatedAt
              ? new Date(insuranceCompany.updatedAt).toLocaleString('ar-LY', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : '-'
          }
        />
      </Box>
    </MainCard>
  );
};

export default InsuranceCompanyView;
