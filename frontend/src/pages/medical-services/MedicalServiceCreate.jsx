/**
 * Medical Service Create Page - GOLDEN REFERENCE MODULE
 * Original Mantis Form Architecture - NO custom form abstractions
 *
 * ⚠️ This is the REFERENCE implementation for all CRUD create pages.
 * Pattern: ModernPageHeader → MainCard → Typography(h6) + Divider sections → MUI inputs
 *
 * Rules Applied:
 * 1. icon={Component} - NEVER JSX
 * 2. Arabic only - No English labels
 * 3. Array.isArray() for all lists
 * 4. Defensive optional chaining
 * 5. Form validation with Arabic messages
 * 6. TableRefreshContext for post-create refresh
 */

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI Components
import {
  Box,
  Button,
  Grid,
  Alert,
  TextField,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  InputAdornment
} from '@mui/material';

// MUI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';

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
  const { triggerRefresh } = useTableRefresh();

  // ========================================
  // DATA FETCHING
  // ========================================

  const { data: categories, loading: categoriesLoading } = useAllMedicalCategories();

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
          <Typography variant="h6" gutterBottom>
            المعلومات الأساسية
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* Code */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="الرمز"
                placeholder="SRV001"
                value={form.code}
                onChange={handleChange('code')}
                error={!!errors.code}
                helperText={errors.code || 'رمز فريد للخدمة'}
                required
                disabled={submitting}
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" error={!!errors.categoryId} required disabled={submitting || categoriesLoading}>
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
                size="small"
                label="الاسم (عربي)"
                placeholder="أدخل الاسم بالعربية"
                value={form.nameAr}
                onChange={handleChange('nameAr')}
                error={!!errors.nameAr}
                helperText={errors.nameAr}
                required
                disabled={submitting}
              />
            </Grid>

            {/* Name English */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="الاسم (إنجليزي)"
                placeholder="Enter name in English"
                value={form.nameEn}
                onChange={handleChange('nameEn')}
                error={!!errors.nameEn}
                helperText={errors.nameEn}
                required
                disabled={submitting}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
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

          {/* ====== PRICING SECTION ====== */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            التسعير والتغطية
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* Price */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
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
              />
            </Grid>

            {/* Cost */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
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
              <TextField
                fullWidth
                size="small"
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

          {/* ====== DETAILS SECTION ====== */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            تفاصيل الخدمة
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* Duration */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
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

          {/* ====== SETTINGS SECTION ====== */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            الإعدادات
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* Requires Approval */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant="body1">يتطلب موافقة مسبقة</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {form.requiresApproval ? 'الخدمة تتطلب موافقة قبل التنفيذ' : 'لا تتطلب موافقة مسبقة'}
                  </Typography>
                </Box>
                <Switch checked={form.requiresApproval} onChange={handleChange('requiresApproval')} disabled={submitting} />
              </Box>
            </Grid>

            {/* Active Switch */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant="body1">تفعيل الخدمة</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {form.active ? 'الخدمة نشطة وظاهرة في النظام' : 'الخدمة غير نشطة ولن تظهر في النظام'}
                  </Typography>
                </Box>
                <Switch checked={form.active} onChange={handleChange('active')} disabled={submitting} />
              </Box>
            </Grid>
          </Grid>

          {/* ====== ACTION BUTTONS ====== */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={handleBack} disabled={submitting}>
              إلغاء
            </Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={submitting}>
              {submitting ? 'جاري الحفظ...' : 'حفظ الخدمة'}
            </Button>
          </Box>
        </Box>
      </MainCard>
    </Box>
  );
};

export default MedicalServiceCreate;
