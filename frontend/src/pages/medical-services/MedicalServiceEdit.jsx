/**
 * Medical Service Edit Page - GOLDEN REFERENCE MODULE
 * Phase D3 - TbaForm System + Reference Module Pattern
 *
 * ⚠️ This is the REFERENCE implementation for all CRUD edit pages.
 * Pattern: ModernPageHeader → MainCard → TbaFormSection → TbaForm Components → TbaFormActions
 *
 * Rules Applied:
 * 1. icon={Component} - NEVER JSX
 * 2. Arabic only - No English labels
 * 3. Array.isArray() for all lists
 * 4. Defensive optional chaining
 * 5. Proper error states (403 صلاحيات, 500 خطأ تقني)
 * 6. TableRefreshContext for post-edit refresh (Phase D2.3)
 * 7. TbaForm System components for consistent UI (Phase D3)
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// MUI Components
import { Box, Button, Grid, Stack, Alert, Skeleton, InputAdornment } from '@mui/material';

// MUI Icons - Always as Component, NEVER as JSX
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LockIcon from '@mui/icons-material/Lock';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import ModernEmptyState from 'components/tba/ModernEmptyState';
import { TbaFormSection, TbaTextField, TbaSelectField, TbaSwitchField, TbaFormActions } from 'components/tba/form';

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

          {/* ====== BASIC INFORMATION SECTION ====== */}
          <TbaFormSection title="المعلومات الأساسية" subtitle="أدخل البيانات الأساسية للخدمة الطبية" icon={InfoIcon}>
            <Grid container spacing={2}>
              {/* Code */}
              <Grid item xs={12} md={6}>
                <TbaTextField
                  name="code"
                  label="الرمز"
                  placeholder="SRV001"
                  value={form.code}
                  onChange={handleChange('code')}
                  error={errors.code}
                  helperText={errors.code || 'رمز فريد للخدمة'}
                  required
                  disabled={submitting}
                  sx={{ '& .MuiOutlinedInput-input': { fontWeight: 500 } }}
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} md={6}>
                <TbaSelectField
                  name="categoryId"
                  label="التصنيف الطبي"
                  value={form.categoryId}
                  onChange={handleChange('categoryId')}
                  error={errors.categoryId}
                  required
                  disabled={submitting || categoriesLoading}
                  options={categoryList.map((cat) => ({
                    value: cat?.id,
                    label: cat?.nameAr || cat?.nameEn || '-'
                  }))}
                />
              </Grid>

              {/* Name Arabic */}
              <Grid item xs={12} md={6}>
                <TbaTextField
                  name="nameAr"
                  label="الاسم (عربي)"
                  placeholder="أدخل الاسم بالعربية"
                  value={form.nameAr}
                  onChange={handleChange('nameAr')}
                  error={errors.nameAr}
                  required
                  disabled={submitting}
                  sx={{ '& .MuiOutlinedInput-input': { fontWeight: 500 } }}
                />
              </Grid>

              {/* Name English */}
              <Grid item xs={12} md={6}>
                <TbaTextField
                  name="nameEn"
                  label="الاسم (إنجليزي)"
                  placeholder="Enter name in English"
                  value={form.nameEn}
                  onChange={handleChange('nameEn')}
                  error={errors.nameEn}
                  required
                  disabled={submitting}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TbaTextField
                  name="description"
                  label="الوصف"
                  placeholder="أدخل وصف الخدمة (اختياري)"
                  value={form.description}
                  onChange={handleChange('description')}
                  multiline
                  rows={3}
                  disabled={submitting}
                />
              </Grid>
            </Grid>
          </TbaFormSection>

          {/* ====== PRICING SECTION ====== */}
          <TbaFormSection title="التسعير والتغطية" subtitle="حدد أسعار وتكاليف الخدمة" icon={AttachMoneyIcon}>
            <Grid container spacing={2}>
              {/* Price */}
              <Grid item xs={12} md={4}>
                <TbaTextField
                  name="priceLyd"
                  label="السعر (د.ل)"
                  placeholder="0.00"
                  type="number"
                  value={form.priceLyd}
                  onChange={handleChange('priceLyd')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">د.ل</InputAdornment>
                  }}
                  inputProps={{ step: '0.01', min: '0' }}
                  disabled={submitting}
                  sx={{ '& .MuiOutlinedInput-input': { fontWeight: 500 } }}
                />
              </Grid>

              {/* Cost */}
              <Grid item xs={12} md={4}>
                <TbaTextField
                  name="costLyd"
                  label="التكلفة (د.ل)"
                  placeholder="0.00"
                  type="number"
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
                <TbaTextField
                  name="coverageLimit"
                  label="حد التغطية (د.ل)"
                  placeholder="0.00"
                  type="number"
                  value={form.coverageLimit}
                  onChange={handleChange('coverageLimit')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">د.ل</InputAdornment>
                  }}
                  inputProps={{ step: '0.01', min: '0' }}
                  disabled={submitting}
                />
              </Grid>
            </Grid>
          </TbaFormSection>

          {/* ====== DETAILS SECTION ====== */}
          <TbaFormSection title="تفاصيل الخدمة" subtitle="معلومات إضافية عن الخدمة" icon={DescriptionIcon}>
            <Grid container spacing={2}>
              {/* Duration */}
              <Grid item xs={12} md={6}>
                <TbaTextField
                  name="duration"
                  label="المدة (دقائق)"
                  placeholder="0"
                  type="number"
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
            </Grid>
          </TbaFormSection>

          {/* ====== SETTINGS SECTION ====== */}
          <TbaFormSection title="الإعدادات" subtitle="خيارات تكوين الخدمة" icon={SettingsIcon}>
            <Grid container spacing={2}>
              {/* Requires Approval */}
              <Grid item xs={12} md={6}>
                <TbaSwitchField
                  name="requiresApproval"
                  label="يتطلب موافقة مسبقة"
                  checked={form.requiresApproval}
                  onChange={handleChange('requiresApproval')}
                  helperText={form.requiresApproval ? 'الخدمة تتطلب موافقة قبل التنفيذ' : 'لا تتطلب موافقة مسبقة'}
                  disabled={submitting}
                />
              </Grid>

              {/* Active Switch */}
              <Grid item xs={12} md={6}>
                <TbaSwitchField
                  name="active"
                  label="تفعيل الخدمة"
                  checked={form.active}
                  onChange={handleChange('active')}
                  helperText={form.active ? 'الخدمة نشطة وظاهرة في النظام' : 'الخدمة غير نشطة ولن تظهر في النظام'}
                  disabled={submitting}
                />
              </Grid>
            </Grid>
          </TbaFormSection>

          {/* ====== ACTION BUTTONS ====== */}
          <TbaFormActions onCancel={handleBack} loading={submitting} saveLabel="حفظ التعديلات" loadingLabel="جاري الحفظ..." />
        </Box>
      </MainCard>
    </Box>
  );
};

export default MedicalServiceEdit;
