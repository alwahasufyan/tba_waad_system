import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { ArrowBack, Edit } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { useProviderDetails } from 'hooks/useProviders';
import { providersService } from 'services/api';

const PROVIDER_TYPE_LABELS = {
  HOSPITAL: 'مستشفى',
  CLINIC: 'عيادة',
  LAB: 'مختبر',
  PHARMACY: 'صيدلية',
  RADIOLOGY: 'مركز أشعة'
};

const PROVIDER_TYPE_COLORS = {
  HOSPITAL: 'error',
  CLINIC: 'primary',
  LAB: 'warning',
  PHARMACY: 'success',
  RADIOLOGY: 'info'
};

const ProviderView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { provider, loading } = useProviderDetails(id);
  const [contracts, setContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);

  useEffect(() => {
    const fetchContracts = async () => {
      if (id) {
        setLoadingContracts(true);
        try {
          // TODO: Add getContracts method to providersService
          // const data = await providersService.getContracts(id);
          // setContracts(data || []);
          setContracts([]);
        } catch (error) {
          console.error('Failed to fetch contracts:', error);
          setContracts([]);
        } finally {
          setLoadingContracts(false);
        }
      }
    };
    fetchContracts();
  }, [id]);

  if (loading) {
    return (
      <MainCard>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (!provider) {
    return (
      <MainCard>
        <Typography>المزود غير موجود</Typography>
      </MainCard>
    );
  }

  return (
    <MainCard
      title="تفاصيل المزود"
      secondary={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/providers/edit/${id}`)}>
            تعديل
          </Button>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/providers')}>
            عودة
          </Button>
        </Box>
      }
    >
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              المعلومات الأساسية
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  رقم المزود
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {provider.id}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  الاسم بالعربية
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {provider.nameArabic}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  الاسم بالإنجليزية
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {provider.nameEnglish}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  رقم الترخيص
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {provider.licenseNumber}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  الرقم الضريبي
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {provider.taxNumber || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  نوع المزود
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={PROVIDER_TYPE_LABELS[provider.providerType] || provider.providerType}
                    color={PROVIDER_TYPE_COLORS[provider.providerType] || 'default'}
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  الحالة
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip label={provider.active ? 'نشط' : 'غير نشط'} color={provider.active ? 'success' : 'default'} size="small" />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Location & Contact Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              معلومات الموقع والاتصال
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  المدينة
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {provider.city || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  العنوان
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {provider.address || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  رقم الهاتف
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {provider.phone || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  البريد الإلكتروني
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {provider.email || '-'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Contract Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              معلومات العقد
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  تاريخ بداية العقد
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {provider.contractStartDate || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  تاريخ نهاية العقد
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {provider.contractEndDate || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  نسبة الخصم الافتراضية
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {provider.defaultDiscountRate ? `${provider.defaultDiscountRate}%` : '-'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  تاريخ الإنشاء
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {provider.createdAt ? new Date(provider.createdAt).toLocaleDateString('ar-SA') : '-'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  آخر تحديث
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {provider.updatedAt ? new Date(provider.updatedAt).toLocaleDateString('ar-SA') : '-'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Provider Contracts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              عقود المزود
            </Typography>
            {loadingContracts ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : contracts.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                لا توجد عقود لهذا المزود
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>رقم العقد</TableCell>
                      <TableCell>تاريخ البداية</TableCell>
                      <TableCell>تاريخ النهاية</TableCell>
                      <TableCell>نسبة الخصم</TableCell>
                      <TableCell>التجديد التلقائي</TableCell>
                      <TableCell>الحالة</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>{contract.contractNumber}</TableCell>
                        <TableCell>{contract.startDate ? new Date(contract.startDate).toLocaleDateString('ar-SA') : '-'}</TableCell>
                        <TableCell>{contract.endDate ? new Date(contract.endDate).toLocaleDateString('ar-SA') : '-'}</TableCell>
                        <TableCell>{contract.discountRate ? `${contract.discountRate}%` : '-'}</TableCell>
                        <TableCell>
                          <Chip label={contract.autoRenew ? 'نعم' : 'لا'} color={contract.autoRenew ? 'success' : 'default'} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={contract.active ? 'نشط' : 'غير نشط'} color={contract.active ? 'success' : 'default'} size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default ProviderView;
