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
  Alert
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import { createMedicalCategory } from 'services/api/medical-categories.service';

/**
 * Medical Category Create Page
 * Creates new medical category
 */
const MedicalCategoryCreate = () => {
  const navigate = useNavigate();

  // Form State
  const [form, setForm] = useState({
    code: '',
    nameAr: '',
    nameEn: '',
    description: '',
    sortOrder: 0,
    iconName: '',
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
        description: form.description.trim() || null,
        sortOrder: parseInt(form.sortOrder) || 0,
        iconName: form.iconName.trim() || null,
        active: form.active
      };

      await createMedicalCategory(payload);
      navigate('/medical-categories');
    } catch (err) {
      console.error('Failed to create medical category:', err);
      setApiError(err.response?.data?.message || err.message || 'حدث خطأ أثناء إنشاء التصنيف');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <ModernPageHeader
        title="إضافة تصنيف طبي جديد"
        subtitle="إنشاء تصنيف طبي جديد في النظام"
        icon={CategoryIcon}
        breadcrumbs={[
          { label: 'الرئيسية', path: '/' },
          { label: 'التصنيفات الطبية', path: '/medical-categories' },
          { label: 'إضافة جديد' }
        ]}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/medical-categories')}
          >
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
                placeholder="CAT001"
                value={form.code}
                onChange={handleChange('code')}
                error={!!errors.code}
                helperText={errors.code || 'رمز فريد للتصنيف'}
                disabled={submitting}
              />
            </Grid>

            {/* Sort Order */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="ترتيب العرض"
                placeholder="0"
                value={form.sortOrder}
                onChange={handleChange('sortOrder')}
                helperText="ترتيب ظهور التصنيف في القوائم"
                disabled={submitting}
              />
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

            {/* Icon Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="اسم الأيقونة"
                placeholder="medical_services"
                value={form.iconName}
                onChange={handleChange('iconName')}
                helperText="اسم أيقونة Material UI (اختياري)"
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
                placeholder="أدخل وصف التصنيف (اختياري)"
                value={form.description}
                onChange={handleChange('description')}
                disabled={submitting}
              />
            </Grid>

            {/* Status Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                الحالة
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Active Switch */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.active}
                      onChange={handleChange('active')}
                      disabled={submitting}
                    />
                  }
                  label={
                    <Stack>
                      <Typography variant="body1">تفعيل التصنيف</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {form.active ? 'التصنيف نشط وظاهر في النظام' : 'التصنيف غير نشط ولن يظهر في النظام'}
                      </Typography>
                    </Stack>
                  }
                />
              </Paper>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/medical-categories')}
                  disabled={submitting}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={submitting}
                >
                  {submitting ? 'جاري الحفظ...' : 'حفظ التصنيف'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </MainCard>
    </Box>
  );
};

export default MedicalCategoryCreate;
