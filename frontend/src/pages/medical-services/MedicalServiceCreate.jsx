import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon, MedicalServices as MedicalServicesIcon } from '@mui/icons-material';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import { createMedicalService } from 'services/api/medical-services.service';
import { useAllMedicalCategories } from 'hooks/useMedicalCategories';

/**
 * Medical Service Create Page
 * Creates new medical service
 */
const MedicalServiceCreate = () => {
  const navigate = useNavigate();

  // Load categories for dropdown
  const { data: categories, loading: categoriesLoading } = useAllMedicalCategories();

  // Form State
  const [form, setForm] = useState({
    code: '',
    nameAr: '',
    nameEn: '',
    categoryId: '',
    description: '',
    priceLyd: '',
    costLyd: '',
    coverageLimit: '',
    duration: '',
    requiresApproval: false,
    active: true
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.code.trim()) {
      newErrors.code = 'الرمز مطلوب';
    }

    if (!form.nameAr.trim()) {
      newErrors.nameAr = 'الاسم بالعربية مطلوب';
    }

    if (!form.nameEn.trim()) {
      newErrors.nameEn = 'الاسم بالإنجليزية مطلوب';
    }

    if (!form.categoryId) {
      newErrors.categoryId = 'التصنيف مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);

    try {
      // Prepare payload
      const payload = {
        code: form.code.trim(),
        nameAr: form.nameAr.trim(),
        nameEn: form.nameEn.trim(),
        categoryId: parseInt(form.categoryId),
        description: form.description.trim() || null,
        priceLyd: form.priceLyd ? parseFloat(form.priceLyd) : null,
        costLyd: form.costLyd ? parseFloat(form.costLyd) : null,
        coverageLimit: form.coverageLimit ? parseFloat(form.coverageLimit) : null,
        duration: form.duration ? parseInt(form.duration) : null,
        requiresApproval: form.requiresApproval,
        active: form.active
      };

      await createMedicalService(payload);
      navigate('/medical-services');
    } catch (err) {
      console.error('Failed to create medical service:', err);
      setApiError(err.response?.data?.message || err.message || 'حدث خطأ أثناء إنشاء الخدمة');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <ModernPageHeader
        title="إضافة خدمة طبية جديدة"
        subtitle="إنشاء خدمة طبية جديدة في النظام"
        icon={MedicalServicesIcon}
        breadcrumbs={[
          { label: 'الرئيسية', path: '/' },
          { label: 'الخدمات الطبية', path: '/medical-services' },
          { label: 'إضافة جديد' }
        ]}
        actions={
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/medical-services')}>
            رجوع
          </Button>
        }
      />

      <MainCard>
        <Box component="form" onSubmit={handleSubmit}>
          {apiError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {apiError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                المعلومات الأساسية
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Code */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="الرمز"
                placeholder="SRV001"
                value={form.code}
                onChange={handleChange('code')}
                error={!!errors.code}
                helperText={errors.code || 'رمز فريد للخدمة'}
                disabled={submitting}
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.categoryId} disabled={submitting || categoriesLoading}>
                <InputLabel>التصنيف الطبي</InputLabel>
                <Select value={form.categoryId} onChange={handleChange('categoryId')} label="التصنيف الطبي">
                  <MenuItem value="">-- اختر التصنيف --</MenuItem>
                  {categories?.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.nameAr || cat.nameEn}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoryId && <Typography variant="caption" color="error">{errors.categoryId}</Typography>}
              </FormControl>
            </Grid>

            {/* Name Arabic */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="الاسم (عربي)"
                placeholder="أدخل الاسم بالعربية"
                value={form.nameAr}
                onChange={handleChange('nameAr')}
                error={!!errors.nameAr}
                helperText={errors.nameAr}
                disabled={submitting}
              />
            </Grid>

            {/* Name English */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="الاسم (إنجليزي)"
                placeholder="Enter name in English"
                value={form.nameEn}
                onChange={handleChange('nameEn')}
                error={!!errors.nameEn}
                helperText={errors.nameEn}
                disabled={submitting}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="الوصف"
                placeholder="أدخل وصف الخدمة (اختياري)"
                value={form.description}
                onChange={handleChange('description')}
                disabled={submitting}
              />
            </Grid>

            {/* Pricing & Coverage Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                التسعير والتغطية
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Price */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="السعر (LYD)"
                placeholder="0.00"
                value={form.priceLyd}
                onChange={handleChange('priceLyd')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">LYD</InputAdornment>
                }}
                inputProps={{ step: '0.01', min: '0' }}
                disabled={submitting}
              />
            </Grid>

            {/* Cost */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="التكلفة (LYD)"
                placeholder="0.00"
                value={form.costLyd}
                onChange={handleChange('costLyd')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">LYD</InputAdornment>
                }}
                inputProps={{ step: '0.01', min: '0' }}
                disabled={submitting}
              />
            </Grid>

            {/* Coverage Limit */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="حد التغطية (LYD)"
                placeholder="0.00"
                value={form.coverageLimit}
                onChange={handleChange('coverageLimit')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">LYD</InputAdornment>
                }}
                inputProps={{ step: '0.01', min: '0' }}
                disabled={submitting}
              />
            </Grid>

            {/* Service Details Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                تفاصيل الخدمة
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Duration */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="المدة (دقائق)"
                placeholder="0"
                value={form.duration}
                onChange={handleChange('duration')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">دقيقة</InputAdornment>
                }}
                inputProps={{ min: '0' }}
                helperText="المدة المتوقعة لتقديم الخدمة"
                disabled={submitting}
              />
            </Grid>

            {/* Status Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                الإعدادات
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Requires Approval Switch */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <FormControlLabel
                  control={<Switch checked={form.requiresApproval} onChange={handleChange('requiresApproval')} disabled={submitting} />}
                  label={
                    <Stack>
                      <Typography variant="body1">يتطلب موافقة مسبقة</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {form.requiresApproval ? 'الخدمة تتطلب موافقة قبل التنفيذ' : 'لا تتطلب موافقة مسبقة'}
                      </Typography>
                    </Stack>
                  }
                />
              </Paper>
            </Grid>

            {/* Active Switch */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <FormControlLabel
                  control={<Switch checked={form.active} onChange={handleChange('active')} disabled={submitting} />}
                  label={
                    <Stack>
                      <Typography variant="body1">تفعيل الخدمة</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {form.active ? 'الخدمة نشطة وظاهرة في النظام' : 'الخدمة غير نشطة ولن تظهر في النظام'}
                      </Typography>
                    </Stack>
                  }
                />
              </Paper>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate('/medical-services')} disabled={submitting}>
                  إلغاء
                </Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={submitting}>
                  {submitting ? 'جاري الحفظ...' : 'حفظ الخدمة'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </MainCard>
    </Box>
  );
};

export default MedicalServiceCreate;
