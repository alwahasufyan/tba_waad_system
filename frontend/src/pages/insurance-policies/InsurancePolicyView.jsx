import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Chip, CircularProgress, Divider, Grid, Stack, Typography } from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import RBACGuard from 'components/tba/RBACGuard';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = '/api/insurance-policies';

const fetchInsurancePolicy = async (id) => {
  const { data } = await axios.get(`${API_BASE}/${id}`);
  return data;
};

const DetailRow = ({ label, value, icon: Icon }) => (
  <Grid container spacing={2} sx={{ mb: 2 }}>
    <Grid item xs={12} sm={4}>
      <Stack direction="row" spacing={1} alignItems="center">
        {Icon && <Icon fontSize="small" color="action" />}
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Stack>
    </Grid>
    <Grid item xs={12} sm={8}>
      <Typography variant="body1">{value || 'غير متوفر'}</Typography>
    </Grid>
  </Grid>
);

const InsurancePolicyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: policy,
    isLoading,
    error
  } = useQuery({
    queryKey: ['insurance-policy', id],
    queryFn: () => fetchInsurancePolicy(id),
    enabled: !!id
  });

  const getStatusChip = (status) => {
    const statusConfig = {
      ACTIVE: { label: 'نشط', color: 'success' },
      INACTIVE: { label: 'غير نشط', color: 'default' },
      EXPIRED: { label: 'منتهي', color: 'error' },
      PENDING: { label: 'قيد الانتظار', color: 'warning' }
    };
    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <MainCard>
        <Typography color="error">خطأ في تحميل البيانات: {error.message}</Typography>
      </MainCard>
    );
  }

  return (
    <RBACGuard permission="INSURANCE_POLICY_VIEW">
      <ModernPageHeader
        title={`بوليصة التأمين #${policy?.policyNumber}`}
        subtitle={`رقم البوليصة: ${policy?.id}`}
        icon={DescriptionIcon}
        breadcrumbs={[
          { label: 'بوليصات التأمين', path: '/insurance-policies' },
          { label: `عرض #${id}`, path: `/insurance-policies/${id}` }
        ]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/insurance-policies')} variant="outlined">
              رجوع
            </Button>
            <RBACGuard permission="INSURANCE_POLICY_UPDATE">
              <Button startIcon={<EditIcon />} onClick={() => navigate(`/insurance-policies/edit/${id}`)} variant="contained">
                تعديل
              </Button>
            </RBACGuard>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <MainCard title="معلومات أساسية">
            <DetailRow label="رقم البوليصة" value={policy?.policyNumber} icon={DescriptionIcon} />
            <DetailRow label="شركة التأمين" value={policy?.insuranceCompanyName} icon={BusinessIcon} />
            <DetailRow label="الحالة" value={getStatusChip(policy?.status)} />
            <Divider sx={{ my: 2 }} />
            <DetailRow
              label="تاريخ البدء"
              value={policy?.startDate ? new Date(policy.startDate).toLocaleDateString('ar-SA') : null}
              icon={CalendarIcon}
            />
            <DetailRow
              label="تاريخ الانتهاء"
              value={policy?.endDate ? new Date(policy.endDate).toLocaleDateString('ar-SA') : null}
              icon={CalendarIcon}
            />
          </MainCard>
        </Grid>

        {/* Financial Information */}
        <Grid item xs={12} md={6}>
          <MainCard title="معلومات مالية">
            <DetailRow
              label="مبلغ التغطية"
              value={policy?.coverageAmount ? `${Number(policy.coverageAmount).toLocaleString('ar-SA')} د.ل` : null}
              icon={MoneyIcon}
            />
            <DetailRow
              label="مبلغ القسط"
              value={policy?.premiumAmount ? `${Number(policy.premiumAmount).toLocaleString('ar-SA')} د.ل` : null}
              icon={MoneyIcon}
            />
          </MainCard>
        </Grid>

        {/* Notes */}
        {policy?.notes && (
          <Grid item xs={12}>
            <MainCard title="ملاحظات">
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {policy.notes}
              </Typography>
            </MainCard>
          </Grid>
        )}

        {/* Metadata */}
        <Grid item xs={12}>
          <MainCard title="معلومات النظام">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  تاريخ الإنشاء
                </Typography>
                <Typography variant="body2">
                  {policy?.createdAt ? new Date(policy.createdAt).toLocaleString('ar-SA') : 'غير متوفر'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  آخر تحديث
                </Typography>
                <Typography variant="body2">
                  {policy?.updatedAt ? new Date(policy.updatedAt).toLocaleString('ar-SA') : 'غير متوفر'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  أنشئ بواسطة
                </Typography>
                <Typography variant="body2">{policy?.createdBy || 'غير متوفر'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  آخر تعديل بواسطة
                </Typography>
                <Typography variant="body2">{policy?.updatedBy || 'غير متوفر'}</Typography>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>
      </Grid>
    </RBACGuard>
  );
};

export default InsurancePolicyView;
