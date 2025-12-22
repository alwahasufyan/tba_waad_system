/**
 * Medical Service Create Page - GOLDEN REFERENCE MODULE
 * Phase D3 - TbaForm System + Reference Module Pattern
 *
 * ⚠️ This is the REFERENCE implementation for all CRUD create pages.
 * Pattern: ModernPageHeader → MainCard → TbaFormSection → TbaForm Components → TbaFormActions
 *
 * Rules Applied:
 * 1. icon={Component} - NEVER JSX
 * 2. Arabic only - No English labels
 * 3. Array.isArray() for all lists
 * 4. Defensive optional chaining
 * 5. Form validation with Arabic messages
 * 6. TableRefreshContext for post-create refresh (Phase D2.3)
 * 7. TbaForm System components for consistent UI (Phase D3)
 */

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI Components
import { Box, Button, Grid, Alert, InputAdornment } from '@mui/material';

// MUI Icons - Always as Component, NEVER as JSX
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import { TbaFormSection, TbaTextField, TbaSelectField, TbaSwitchField, TbaFormActions } from 'components/tba/form';

// Contexts
import { useTableRefresh } from 'contexts/TableRefreshContext';

// Hooks & Services
import { createMedicalService } from 'services/api/medical-services.service';
import { useAllMedicalCategories } from 'hooks/useMedicalCategories';

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
// MAIN COMPONENT
// ============================================================================

const MedicalServiceCreate = () => {
  const navigate = useNavigate();

  // ========================================
  // TABLE REFRESH CONTEXT (Phase D2.3)
  // ========================================

  const { triggerRefresh } = useTableRefresh();

  // ========================================
  // DATA FETCHING
  // ========================================

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

        await createMedicalService(payload);

        // Trigger table refresh before navigating (Phase D2.3 Contract)
        triggerRefresh();

        navigate('/medical-services');
      } catch (err) {
        console.error('[MedicalServiceCreate] Submit failed:', err);
        const status = err?.response?.status;

        if (status === 403) {
          setApiError('ليس لديك صلاحية لإنشاء خدمة طبية');
        } else if (status >= 500) {
          setApiError('خطأ تقني في الخادم. يرجى المحاولة لاحقاً');
        } else {
          setApiError(err?.response?.data?.message || err?.message || 'حدث خطأ أثناء إنشاء الخدمة');
        }
      } finally {
        setSubmitting(false);
      }
    },
    [form, navigate, validate, triggerRefresh]
  );

  const handleBack = useCallback(() => {
    navigate('/medical-services');
  }, [navigate]);

  // ========================================
  // RENDER
  // ========================================

  return (
    <Box>
      {/* ====== PAGE HEADER ====== */}
      <ModernPageHeader
        title="إضافة خدمة طبية جديدة"
        subtitle="إنشاء خدمة طبية جديدة في النظام"
        icon={MedicalServicesIcon}
        breadcrumbs={[{ label: 'الرئيسية', path: '/' }, { label: 'الخدمات الطبية', path: '/medical-services' }, { label: 'إضافة جديد' }]}
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
          <TbaFormActions onCancel={handleBack} loading={submitting} saveLabel="حفظ الخدمة" loadingLabel="جاري الحفظ..." />
        </Box>
      </MainCard>
    </Box>
  );
};

export default MedicalServiceCreate;
