/**
 * Medical Service Edit Page - GOLDEN REFERENCE MODULE
 * Phase D2/D2.3 - Reference Module Pattern + Refresh Contract
 *
 * ⚠️ This is the REFERENCE implementation for all CRUD edit pages.
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

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// MUI Components
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
  Skeleton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  FormHelperText
} from '@mui/material';

// MUI Icons - Always as Component, NEVER as JSX
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LockIcon from '@mui/icons-material/Lock';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import ModernEmptyState from 'components/tba/ModernEmptyState';

// Contexts
import { useTableRefresh } from 'contexts/TableRefreshContext';

// Hooks & Services
import { useMedicalServiceDetails } from 'hooks/useMedicalServices';
import { useAllMedicalCategories } from 'hooks/useMedicalCategories';
import { updateMedicalService } from 'services/api/medical-services.service';

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_FORM_STATE = {
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
      message: 'ليس لديك صلاحية للوصول إلى هذه الخدمة',
      icon: LockIcon
    };
  }

  if (status === 404) {
    return {
      type: 'notfound',
      title: 'غير موجود',
      message: 'الخدمة المطلوبة غير موجودة',
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
    message: error?.message || 'فشل تحميل بيانات الخدمة',
    icon: ErrorOutlineIcon
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MedicalServiceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ========================================
  // TABLE REFRESH CONTEXT (Phase D2.3)
  // ========================================

  const { triggerRefresh } = useTableRefresh();

  // ========================================
  // DATA FETCHING
  // ========================================

  const { data: service, loading: loadingService, error: loadError } = useMedicalServiceDetails(id);
  const { data: categories, loading: categoriesLoading } = useAllMedicalCategories();

  // ========================================
  // DERIVED DATA - Defensive
  // ========================================

  const categoryList = useMemo(() => {
    if (!categories) return [];
    return Array.isArray(categories) ? categories : [];
  }, [categories]);

  // ========================================
  // STATE
  // ========================================

  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // ========================================
  // EFFECTS - Populate form when service loads
  // ========================================

  useEffect(() => {
    if (service) {
      setForm({
        code: service?.code || '',
        nameAr: service?.nameAr || '',
        nameEn: service?.nameEn || '',
        categoryId: service?.categoryId || service?.category?.id || '',
        description: service?.description || '',
        priceLyd: service?.priceLyd ?? '',
        costLyd: service?.costLyd ?? '',
        coverageLimit: service?.coverageLimit ?? '',
        duration: service?.duration ?? '',
        requiresApproval: Boolean(service?.requiresApproval),
        active: service?.active !== undefined ? service.active : true
      });
    }
  }, [service]);

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

    if (!form.categoryId) {
      newErrors.categoryId = 'التصنيف مطلوب';
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
          categoryId: form.categoryId ? parseInt(form.categoryId, 10) : null,
          description: form.description?.trim() || null,
          priceLyd: form.priceLyd ? parseFloat(form.priceLyd) : null,
          costLyd: form.costLyd ? parseFloat(form.costLyd) : null,
          coverageLimit: form.coverageLimit ? parseFloat(form.coverageLimit) : null,
          duration: form.duration ? parseInt(form.duration, 10) : null,
          requiresApproval: Boolean(form.requiresApproval),
          active: Boolean(form.active)
        };

        await updateMedicalService(id, payload);

        // Trigger table refresh before navigating (Phase D2.3 Contract)
        triggerRefresh();

        navigate('/medical-services');
      } catch (err) {
        console.error('[MedicalServiceEdit] Submit failed:', err);
        const status = err?.response?.status;

        if (status === 403) {
          setApiError('ليس لديك صلاحية لتعديل هذه الخدمة');
        } else if (status >= 500) {
          setApiError('خطأ تقني في الخادم. يرجى المحاولة لاحقاً');
        } else {
          setApiError(err?.response?.data?.message || err?.message || 'حدث خطأ أثناء تحديث الخدمة');
        }
      } finally {
        setSubmitting(false);
      }
    },
    [form, id, navigate, validate, triggerRefresh]
  );

  const handleBack = useCallback(() => {
    navigate('/medical-services');
  }, [navigate]);

  // ========================================
  // RENDER - LOADING STATE
  // ========================================

  if (loadingService) {
    return (
      <Box>
        <ModernPageHeader
          title="تعديل خدمة طبية"
          subtitle="تحديث بيانات الخدمة الطبية"
          icon={MedicalServicesIcon}
          breadcrumbs={[{ label: 'الرئيسية', path: '/' }, { label: 'الخدمات الطبية', path: '/medical-services' }, { label: 'تعديل' }]}
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

  if (loadError || !service) {
    const errorInfo = getErrorInfo(loadError);
    const ErrorIcon = errorInfo.icon;

    return (
      <Box>
        <ModernPageHeader
          title="تعديل خدمة طبية"
          subtitle="تحديث بيانات الخدمة الطبية"
          icon={MedicalServicesIcon}
          breadcrumbs={[{ label: 'الرئيسية', path: '/' }, { label: 'الخدمات الطبية', path: '/medical-services' }, { label: 'تعديل' }]}
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

  // ========================================
  // RENDER - MAIN FORM
  // ========================================

  return (
    <Box>
      {/* ====== PAGE HEADER ====== */}
      <ModernPageHeader
        title="تعديل خدمة طبية"
        subtitle={`تحديث بيانات: ${service?.nameAr || ''}`}
        icon={MedicalServicesIcon}
        breadcrumbs={[{ label: 'الرئيسية', path: '/' }, { label: 'الخدمات الطبية', path: '/medical-services' }, { label: 'تعديل' }]}
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
                  {categoryList.map((cat) => (
                    <MenuItem key={cat?.id} value={cat?.id}>
                      {cat?.nameAr || cat?.nameEn || '-'}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoryId && <FormHelperText>{errors.categoryId}</FormHelperText>}
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

            {/* ====== PRICING SECTION ====== */}
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
                label="السعر (د.ل)"
                placeholder="0.00"
                value={form.priceLyd}
                onChange={handleChange('priceLyd')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">د.ل</InputAdornment>
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
                label="التكلفة (د.ل)"
                placeholder="0.00"
                value={form.costLyd}
                onChange={handleChange('costLyd')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">د.ل</InputAdornment>
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
                label="حد التغطية (د.ل)"
                placeholder="0.00"
                value={form.coverageLimit}
                onChange={handleChange('coverageLimit')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">د.ل</InputAdornment>
                }}
                inputProps={{ step: '0.01', min: '0' }}
                disabled={submitting}
              />
            </Grid>

            {/* ====== DETAILS SECTION ====== */}
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

            {/* ====== SETTINGS SECTION ====== */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                الإعدادات
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Requires Approval */}
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

export default MedicalServiceEdit;
