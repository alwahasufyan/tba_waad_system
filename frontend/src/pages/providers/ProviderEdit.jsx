import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Box, Button, Grid, TextField, MenuItem, Typography, CircularProgress } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { useProviderDetails, useUpdateProvider } from 'hooks/useProviders';

const PROVIDER_TYPES = [
  { value: 'HOSPITAL', label: 'مستشفى' },
  { value: 'CLINIC', label: 'عيادة' },
  { value: 'LAB', label: 'مختبر' },
  { value: 'PHARMACY', label: 'صيدلية' },
  { value: 'RADIOLOGY', label: 'مركز أشعة' }
];

const ProviderEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { provider, loading } = useProviderDetails(id);
  const { update, updating } = useUpdateProvider();

  const [formData, setFormData] = useState({
    nameArabic: '',
    nameEnglish: '',
    licenseNumber: '',
    taxNumber: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    providerType: '',
    contractStartDate: '',
    contractEndDate: '',
    defaultDiscountRate: '',
    active: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (provider) {
      setFormData({
        nameArabic: provider.nameArabic || '',
        nameEnglish: provider.nameEnglish || '',
        licenseNumber: provider.licenseNumber || '',
        taxNumber: provider.taxNumber || '',
        city: provider.city || '',
        address: provider.address || '',
        phone: provider.phone || '',
        email: provider.email || '',
        providerType: provider.providerType || '',
        contractStartDate: provider.contractStartDate || '',
        contractEndDate: provider.contractEndDate || '',
        defaultDiscountRate: provider.defaultDiscountRate || '',
        active: provider.active !== undefined ? provider.active : true
      });
    }
  }, [provider]);

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nameArabic) newErrors.nameArabic = 'الاسم بالعربية مطلوب';
    if (!formData.nameEnglish) newErrors.nameEnglish = 'الاسم بالإنجليزية مطلوب';
    if (!formData.licenseNumber) newErrors.licenseNumber = 'رقم الترخيص مطلوب';
    if (!formData.providerType) newErrors.providerType = 'نوع المزود مطلوب';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      enqueueSnackbar('يرجى تعبئة جميع الحقول المطلوبة', { variant: 'error' });
      return;
    }

    const result = await update(id, formData);

    if (result.success) {
      enqueueSnackbar('تم تحديث المزود بنجاح', { variant: 'success' });
      navigate('/providers');
    } else {
      enqueueSnackbar(result.error || 'فشل تحديث المزود', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <MainCard>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard
      title="تعديل بيانات المزود"
      secondary={
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/providers')} disabled={updating}>
          عودة
        </Button>
      }
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              المعلومات الأساسية
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="الاسم بالعربية"
              value={formData.nameArabic}
              onChange={handleChange('nameArabic')}
              error={!!errors.nameArabic}
              helperText={errors.nameArabic}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="الاسم بالإنجليزية"
              value={formData.nameEnglish}
              onChange={handleChange('nameEnglish')}
              error={!!errors.nameEnglish}
              helperText={errors.nameEnglish}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="رقم الترخيص"
              value={formData.licenseNumber}
              onChange={handleChange('licenseNumber')}
              error={!!errors.licenseNumber}
              helperText={errors.licenseNumber}
              disabled
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="الرقم الضريبي" value={formData.taxNumber} onChange={handleChange('taxNumber')} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              select
              label="نوع المزود"
              value={formData.providerType}
              onChange={handleChange('providerType')}
              error={!!errors.providerType}
              helperText={errors.providerType}
            >
              {PROVIDER_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="الحالة"
              value={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
            >
              <MenuItem value={true}>نشط</MenuItem>
              <MenuItem value={false}>غير نشط</MenuItem>
            </TextField>
          </Grid>

          {/* Location Information */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
              معلومات الموقع
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="المدينة" value={formData.city} onChange={handleChange('city')} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="العنوان" value={formData.address} onChange={handleChange('address')} multiline rows={1} />
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
              معلومات الاتصال
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="رقم الهاتف" value={formData.phone} onChange={handleChange('phone')} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth type="email" label="البريد الإلكتروني" value={formData.email} onChange={handleChange('email')} />
          </Grid>

          {/* Contract Information */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
              معلومات العقد
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="تاريخ بداية العقد"
              value={formData.contractStartDate}
              onChange={handleChange('contractStartDate')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="تاريخ نهاية العقد"
              value={formData.contractEndDate}
              onChange={handleChange('contractEndDate')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="نسبة الخصم الافتراضية (%)"
              value={formData.defaultDiscountRate}
              onChange={handleChange('defaultDiscountRate')}
              inputProps={{ min: 0, max: 100, step: 0.01 }}
            />
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate('/providers')} disabled={updating}>
                إلغاء
              </Button>
              <Button type="submit" variant="contained" startIcon={<Save />} disabled={updating}>
                {updating ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  );
};

export default ProviderEdit;
