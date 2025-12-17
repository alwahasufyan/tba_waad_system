import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  Stack,
  Alert,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Skeleton
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import { updateMedicalPackage } from 'services/api/medical-packages.service';
import { useMedicalPackageDetails } from 'hooks/useMedicalPackages';
import { useAllMedicalServices } from 'hooks/useMedicalServices';

/**
 * Medical Package Edit Page
 * Form to edit an existing medical package
 */
const MedicalPackageEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: pkg, loading: loadingPackage, error: packageError } = useMedicalPackageDetails(id);
  const { data: services, loading: servicesLoading } = useAllMedicalServices();

  const [form, setForm] = useState({
    code: '',
    nameAr: '',
    nameEn: '',
    description: '',
    priceLyd: '',
    validityDays: '',
    serviceIds: [],
    active: true
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pre-fill form with existing package data
  useEffect(() => {
    if (pkg) {
      setForm({
        code: pkg.code || '',
        nameAr: pkg.nameAr || '',
        nameEn: pkg.nameEn || '',
        description: pkg.description || '',
        priceLyd: pkg.priceLyd || '',
        validityDays: pkg.validityDays || '',
        serviceIds: pkg.services?.map((s) => s.id) || pkg.serviceIds || [],
        active: pkg.active !== undefined ? pkg.active : true
      });
    }
  }, [pkg]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleServiceChange = (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, serviceIds: typeof value === 'string' ? value.split(',') : value }));
    if (errors.serviceIds) {
      setErrors((prev) => ({ ...prev, serviceIds: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.code.trim()) newErrors.code = 'الكود مطلوب';
    if (!form.nameAr.trim()) newErrors.nameAr = 'الاسم بالعربية مطلوب';
    if (!form.nameEn.trim()) newErrors.nameEn = 'الاسم بالإنجليزية مطلوب';
    if (form.serviceIds.length === 0) newErrors.serviceIds = 'يجب اختيار خدمة واحدة على الأقل';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    try {
      const payload = {
        code: form.code.trim(),
        nameAr: form.nameAr.trim(),
        nameEn: form.nameEn.trim(),
        description: form.description.trim() || null,
        priceLyd: form.priceLyd ? parseFloat(form.priceLyd) : null,
        validityDays: form.validityDays ? parseInt(form.validityDays, 10) : null,
        serviceIds: form.serviceIds.map((sid) => parseInt(sid, 10)),
        active: form.active
      };

      await updateMedicalPackage(id, payload);
      navigate('/medical-packages');
    } catch (err) {
      console.error('Failed to update package:', err);
      setApiError(err.response?.data?.message || err.message || 'فشل تحديث الباقة');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/medical-packages');
  };

  const breadcrumbs = [
    { title: 'الباقات الطبية', path: '/medical-packages' },
    { title: 'تعديل باقة' }
  ];

  // Loading skeleton
  if (loadingPackage) {
    return (
      <>
        <ModernPageHeader
          title="تعديل باقة طبية"
          subtitle="تحميل بيانات الباقة..."
          icon={<InventoryIcon />}
          breadcrumbs={breadcrumbs}
        />
        <MainCard>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} md={6} key={i}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
            ))}
          </Grid>
        </MainCard>
      </>
    );
  }

  // Error state
  if (packageError || !pkg) {
    return (
      <>
        <ModernPageHeader title="خطأ" subtitle="فشل تحميل بيانات الباقة" icon={<InventoryIcon />} breadcrumbs={breadcrumbs} />
        <MainCard>
          <Alert severity="error">
            {packageError?.message || 'لم يتم العثور على الباقة'}
            <Button onClick={() => navigate('/medical-packages')} sx={{ mt: 2 }}>
              العودة إلى القائمة
            </Button>
          </Alert>
        </MainCard>
      </>
    );
  }

  return (
    <>
      <ModernPageHeader
        title="تعديل باقة طبية"
        subtitle={`تعديل: ${pkg.nameAr || pkg.nameEn}`}
        icon={<InventoryIcon />}
        breadcrumbs={breadcrumbs}
      />

      <MainCard>
        {apiError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setApiError(null)}>
            {apiError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                المعلومات الأساسية
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="الكود"
                value={form.code}
                onChange={handleChange('code')}
                error={!!errors.code}
                helperText={errors.code}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="الاسم بالعربية"
                value={form.nameAr}
                onChange={handleChange('nameAr')}
                error={!!errors.nameAr}
                helperText={errors.nameAr}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="الاسم بالإنجليزية"
                value={form.nameEn}
                onChange={handleChange('nameEn')}
                error={!!errors.nameEn}
                helperText={errors.nameEn}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="الوصف"
                value={form.description}
                onChange={handleChange('description')}
              />
            </Grid>

            {/* Services Selection Section */}
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                الخدمات المشمولة
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.serviceIds}>
                <InputLabel>اختر الخدمات</InputLabel>
                <Select
                  multiple
                  value={form.serviceIds}
                  onChange={handleServiceChange}
                  input={<OutlinedInput label="اختر الخدمات" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((serviceId) => {
                        const service = services?.find((s) => s.id === parseInt(serviceId, 10));
                        return (
                          <Chip
                            key={serviceId}
                            label={service?.nameAr || service?.nameEn || serviceId}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                  disabled={servicesLoading}
                >
                  <MenuItem value="" disabled>
                    -- اختر الخدمات --
                  </MenuItem>
                  {services?.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.nameAr || service.nameEn} ({service.code})
                    </MenuItem>
                  ))}
                </Select>
                {errors.serviceIds && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.serviceIds}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Pricing & Validity Section */}
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                السعر والصلاحية
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="السعر (LYD)"
                value={form.priceLyd}
                onChange={handleChange('priceLyd')}
                inputProps={{ step: 0.01, min: 0 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">LYD</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="صلاحية الباقة (بالأيام)"
                value={form.validityDays}
                onChange={handleChange('validityDays')}
                inputProps={{ min: 1 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">يوم</InputAdornment>
                }}
                helperText="عدد الأيام التي تكون فيها الباقة صالحة للاستخدام"
              />
            </Grid>

            {/* Status Section */}
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                الحالة
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={form.active} onChange={handleChange('active')} />}
                label={form.active ? 'نشط' : 'غير نشط'}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel} disabled={loading}>
                  إلغاء
                </Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>
                  {loading ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </MainCard>
    </>
  );
};

export default MedicalPackageEdit;
