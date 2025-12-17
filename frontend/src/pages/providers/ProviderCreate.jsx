import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Box, Button, Grid, TextField, MenuItem, Typography } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { useCreateProvider } from 'hooks/useProviders';

const PROVIDER_TYPES = [
  { value: 'HOSPITAL', label: 'مستشفى' },
  { value: 'CLINIC', label: 'عيادة' },
  { value: 'LAB', label: 'مختبر' },
  { value: 'PHARMACY', label: 'صيدلية' },
  { value: 'RADIOLOGY', label: 'مركز أشعة' }
];

const ProviderCreate = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { create, creating } = useCreateProvider();

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
    defaultDiscountRate: ''
  });

  const [errors, setErrors] = useState({});

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

    const result = await create(formData);

    if (result.success) {
      enqueueSnackbar('تم إنشاء المزود بنجاح', { variant: 'success' });
      navigate('/providers');
    } else {
      enqueueSnackbar(result.error || 'فشل إنشاء المزود', { variant: 'error' });
    }
  };

  return (
    <MainCard
      title="إضافة مزود جديد"
      secondary={
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/providers')} disabled={creating}>
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
              <Button variant="outlined" onClick={() => navigate('/providers')} disabled={creating}>
                إلغاء
              </Button>
              <Button type="submit" variant="contained" startIcon={<Save />} disabled={creating}>
                {creating ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  );
};

export default ProviderCreate;
