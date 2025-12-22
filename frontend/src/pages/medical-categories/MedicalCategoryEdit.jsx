/**
 * Medical Category Edit Page - Phase D2.4 (Golden Reference Clone)
 * Cloned from Medical Services Golden Reference
 *
 * ⚠️ This is a REFERENCE implementation for all CRUD edit pages.
 * Pattern: ModernPageHeader → MainCard → Form Sections → Actions
 *
 * Rules Applied:
 * 1. icon={Component} - NEVER JSX
 * 2. Arabic only - No English labels
 * 3. Array.isArray() for all lists
 * 4. Defensive optional chaining
 * 5. Proper error states (403 صلاحيات, 500 خطأ تقني)
 * 6. TableRefreshContext for post-edit refresh (Phase D2.3)
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// MUI Components
import { Box, Button, Grid, Paper, Stack, TextField, Typography, FormControlLabel, Switch, Divider, Alert, Skeleton } from '@mui/material';

// MUI Icons - Always as Component, NEVER as JSX
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CategoryIcon from '@mui/icons-material/Category';
import LockIcon from '@mui/icons-material/Lock';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import ModernEmptyState from 'components/tba/ModernEmptyState';

// Contexts
import { useTableRefresh } from 'contexts/TableRefreshContext';

// Hooks & Services
import { useMedicalCategoryDetails } from 'hooks/useMedicalCategories';
import { updateMedicalCategory } from 'services/api/medical-categories.service';

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_FORM_STATE = {
  code: '',
  nameAr: '',
  nameEn: '',
  description: '',
  sortOrder: 0,
  iconName: '',
  active: true
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse error response and return appropriate Arabic message
 */
const getErrorInfo = (error) => {
  const status = error?.response?.status || error?.status;

  if (status === 403) {
    return {
      type: 'permission',
      title: 'غير مصرح',
      message: 'ليس لديك صلاحية للوصول إلى هذا التصنيف',
      icon: LockIcon
    };
  }

  if (status === 404) {
    return {
      type: 'notfound',
      title: 'غير موجود',
      message: 'التصنيف المطلوب غير موجود',
      icon: ErrorOutlineIcon
    };
  }

  if (status >= 500) {
    return {
      type: 'server',
      title: 'خطأ تقني',
      message: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً',
      icon: ErrorOutlineIcon
    };
  }

  return {
    type: 'generic',
    title: 'خطأ',
    message: error?.message || 'فشل تحميل بيانات التصنيف',
    icon: ErrorOutlineIcon
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MedicalCategoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ========================================
  // TABLE REFRESH CONTEXT (Phase D2.3)
  // ========================================

  const { triggerRefresh } = useTableRefresh();

  // ========================================
  // DATA FETCHING
  // ========================================

  const { data: category, loading: loadingCategory, error: loadError } = useMedicalCategoryDetails(id);

  // ========================================
  // STATE
  // ========================================

  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // ========================================
  // EFFECTS - Populate form when category loads
  // ========================================

  useEffect(() => {
    if (category) {
      setForm({
        code: category?.code || '',
        nameAr: category?.nameAr || '',
        nameEn: category?.nameEn || '',
        description: category?.description || '',
        sortOrder: category?.sortOrder ?? 0,
        iconName: category?.iconName || '',
        active: category?.active !== undefined ? category.active : true
      });
    }
  }, [category]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleChange = useCallback(
    (field) => (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    },
    [errors]
  );

  const validate = useCallback(() => {
    const newErrors = {};

    if (!form.code?.trim()) {
      newErrors.code = 'الرمز مطلوب';
    }

    if (!form.nameAr?.trim()) {
      newErrors.nameAr = 'الاسم بالعربية مطلوب';
    }

    if (!form.nameEn?.trim()) {
      newErrors.nameEn = 'الاسم بالإنجليزية مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validate()) return;

      setSubmitting(true);
      setApiError(null);

      try {
        // Prepare payload - defensive parsing
        const payload = {
          code: form.code?.trim() || '',
          nameAr: form.nameAr?.trim() || '',
          nameEn: form.nameEn?.trim() || '',
          description: form.description?.trim() || null,
          sortOrder: form.sortOrder ? parseInt(form.sortOrder, 10) : 0,
          iconName: form.iconName?.trim() || null,
          active: Boolean(form.active)
        };

        await updateMedicalCategory(id, payload);

        // Trigger table refresh before navigating (Phase D2.3 Contract)
        triggerRefresh();

        navigate('/medical-categories');
      } catch (err) {
        console.error('[MedicalCategoryEdit] Submit failed:', err);
        const status = err?.response?.status;

        if (status === 403) {
          setApiError('ليس لديك صلاحية لتعديل هذا التصنيف');
        } else if (status >= 500) {
          setApiError('خطأ تقني في الخادم. يرجى المحاولة لاحقاً');
        } else {
          setApiError(err?.response?.data?.message || err?.message || 'حدث خطأ أثناء تحديث التصنيف');
        }
      } finally {
        setSubmitting(false);
      }
    },
    [form, id, navigate, validate, triggerRefresh]
  );

  const handleBack = useCallback(() => {
    navigate('/medical-categories');
  }, [navigate]);

  // ========================================
  // RENDER - LOADING STATE
  // ========================================

  if (loadingCategory) {
    return (
      <Box>
        <ModernPageHeader
          title="تعديل تصنيف طبي"
          subtitle="تحديث بيانات التصنيف الطبي"
          icon={CategoryIcon}
          breadcrumbs={[{ label: 'الرئيسية', path: '/' }, { label: 'التصنيفات الطبية', path: '/medical-categories' }, { label: 'تعديل' }]}
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

  // ========================================
  // RENDER - ERROR STATE
  // ========================================

  if (loadError || !category) {
    const errorInfo = getErrorInfo(loadError);
    const ErrorIcon = errorInfo.icon;

    return (
      <Box>
        <ModernPageHeader
          title="تعديل تصنيف طبي"
          subtitle="تحديث بيانات التصنيف الطبي"
          icon={CategoryIcon}
          breadcrumbs={[{ label: 'الرئيسية', path: '/' }, { label: 'التصنيفات الطبية', path: '/medical-categories' }, { label: 'تعديل' }]}
        />
        <MainCard>
          <ModernEmptyState
            icon={ErrorIcon}
            title={errorInfo.title}
            description={errorInfo.message}
            action={
              <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
                رجوع للقائمة
              </Button>
            }
          />
        </MainCard>
      </Box>
    );
  }

  // ========================================
  // RENDER - MAIN FORM
  // ========================================

  return (
    <Box>
      {/* ====== PAGE HEADER ====== */}
      <ModernPageHeader
        title="تعديل تصنيف طبي"
        subtitle={`تحديث بيانات: ${category?.nameAr || ''}`}
        icon={CategoryIcon}
        breadcrumbs={[{ label: 'الرئيسية', path: '/' }, { label: 'التصنيفات الطبية', path: '/medical-categories' }, { label: 'تعديل' }]}
        actions={
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
            رجوع
          </Button>
        }
      />

      {/* ====== MAIN CARD ====== */}
      <MainCard>
        <Box component="form" onSubmit={handleSubmit}>
          {/* API Error Alert */}
          {apiError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {apiError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* ====== BASIC INFORMATION SECTION ====== */}
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
                placeholder="أدخل الاسم بالإنجليزية"
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

            {/* ====== STATUS SECTION ====== */}
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
                  control={<Switch checked={form.active} onChange={handleChange('active')} disabled={submitting} />}
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

            {/* ====== ACTION BUTTONS ====== */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={handleBack} disabled={submitting}>
                  إلغاء
                </Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={submitting}>
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
