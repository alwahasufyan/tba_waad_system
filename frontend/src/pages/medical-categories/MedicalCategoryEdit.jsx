import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Skeleton
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import { useMedicalCategoryDetails } from 'hooks/useMedicalCategories';
import { updateMedicalCategory } from 'services/api/medical-categories.service';

/**
 * Medical Category Edit Page
 * Edits existing medical category
 */
const MedicalCategoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch existing category
  const { data: category, loading: loadingCategory, error: loadError } = useMedicalCategoryDetails(id);

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

  // Populate form when category loads
  useEffect(() => {
    if (category) {
      setForm({
        code: category.code || '',
        nameAr: category.nameAr || '',
        nameEn: category.nameEn || '',
        description: category.description || '',
        sortOrder: category.sortOrder || 0,
        iconName: category.iconName || '',
        active: category.active !== undefined ? category.active : true
      });
    }
  }, [category]);

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

      await updateMedicalCategory(id, payload);
      navigate('/medical-categories');
    } catch (err) {
      console.error('Failed to update medical category:', err);
      setApiError(err.response?.data?.message || err.message || 'حدث خطأ أثناء تحديث التصنيف');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading skeleton
  if (loadingCategory) {
    return (
      <Box>
        <ModernPageHeader
          title="تعديل تصنيف طبي"
          subtitle="تحديث بيانات التصنيف الطبي"
          icon={CategoryIcon}
          breadcrumbs={[
            { label: 'الرئيسية', path: '/' },
            { label: 'التصنيفات الطبية', path: '/medical-categories' },
            { label: 'تعديل' }
          ]}
        />
        <MainCard>
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={120} />
          </Stack>
        </MainCard>
      </Box>
    );
  }

  // Error loading category
  if (loadError || !category) {
    return (
      <Box>
        <ModernPageHeader
          title="تعديل تصنيف طبي"
          subtitle="تحديث بيانات التصنيف الطبي"
          icon={CategoryIcon}
          breadcrumbs={[
            { label: 'الرئيسية', path: '/' },
            { label: 'التصنيفات الطبية', path: '/medical-categories' },
            { label: 'تعديل' }
          ]}
        />
        <MainCard>
          <Alert severity="error">
            {loadError?.message || 'فشل تحميل بيانات التصنيف'}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/medical-categories')}
            sx={{ mt: 2 }}
          >
            رجوع للقائمة
          </Button>
        </MainCard>
      </Box>
    );
  }

  return (
    <Box>
      <ModernPageHeader
        title="تعديل تصنيف طبي"
        subtitle={`تحديث بيانات: ${category.nameAr}`}
        icon={CategoryIcon}
        breadcrumbs={[
          { label: 'الرئيسية', path: '/' },
          { label: 'التصنيفات الطبية', path: '/medical-categories' },
          { label: 'تعديل' }
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
                  {submitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </MainCard>
    </Box>
  );
};

export default MedicalCategoryEdit;
