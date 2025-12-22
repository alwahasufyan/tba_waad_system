/**
 * Medical Service View Page - GOLDEN REFERENCE MODULE
 * Phase D3 - TbaForm System + Reference Module Pattern
 *
 * ⚠️ This is the REFERENCE implementation for all CRUD view pages.
 * Pattern: ModernPageHeader → MainCard → TbaFormSection → TbaDetailField (read-only)
 *
 * Rules Applied:
 * 1. icon={Component} - NEVER JSX
 * 2. Arabic only - No English labels
 * 3. Defensive optional chaining
 * 4. Proper error states (403 صلاحيات, 500 خطأ تقني)
 * 5. TbaForm System components for consistent UI (Phase D3)
 */

import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// MUI Components
import { Box, Button, Grid, Stack, Chip, Skeleton } from '@mui/material';

// MUI Icons - Always as Component, NEVER as JSX
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import ModernEmptyState from 'components/tba/ModernEmptyState';
import { TbaFormSection, TbaDetailField } from 'components/tba/form';

// Hooks & Services
import { useMedicalServiceDetails } from 'hooks/useMedicalServices';

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

/**
 * Format price with LYD currency
 */
const formatPrice = (value) => {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toFixed(2)} د.ل`;
};

/**
 * Format date in Arabic locale
 */
const formatDate = (date) => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleString('ar-LY');
  } catch {
    return '-';
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MedicalServiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ========================================
  // DATA FETCHING
  // ========================================

  const { data: service, loading, error } = useMedicalServiceDetails(id);

  // ========================================
  // HANDLERS
  // ========================================

  const handleBack = useCallback(() => {
    navigate('/medical-services');
  }, [navigate]);

  const handleEdit = useCallback(() => {
    navigate(`/medical-services/edit/${id}`);
  }, [navigate, id]);

  // ========================================
  // RENDER - LOADING STATE
  // ========================================

  if (loading) {
    return (
      <Box>
        <ModernPageHeader
          title="عرض الخدمة الطبية"
          subtitle="تفاصيل الخدمة الطبية"
          icon={MedicalServicesIcon}
          breadcrumbs={[{ label: 'الرئيسية', path: '/' }, { label: 'الخدمات الطبية', path: '/medical-services' }, { label: 'عرض' }]}
        />
        <MainCard>
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={80} />
            <Skeleton variant="rectangular" height={80} />
            <Skeleton variant="rectangular" height={80} />
          </Stack>
        </MainCard>
      </Box>
    );
  }

  // ========================================
  // RENDER - ERROR STATE
  // ========================================

  if (error || !service) {
    const errorInfo = getErrorInfo(error);
    const ErrorIcon = errorInfo.icon;

    return (
      <Box>
        <ModernPageHeader
          title="عرض الخدمة الطبية"
          subtitle="تفاصيل الخدمة الطبية"
          icon={MedicalServicesIcon}
          breadcrumbs={[{ label: 'الرئيسية', path: '/' }, { label: 'الخدمات الطبية', path: '/medical-services' }, { label: 'عرض' }]}
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
  // RENDER - MAIN VIEW
  // ========================================

  return (
    <Box>
      {/* ====== PAGE HEADER ====== */}
      <ModernPageHeader
        title="عرض الخدمة الطبية"
        subtitle={service?.nameAr || ''}
        icon={MedicalServicesIcon}
        breadcrumbs={[
          { label: 'الرئيسية', path: '/' },
          { label: 'الخدمات الطبية', path: '/medical-services' },
          { label: service?.code || 'عرض' }
        ]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
              رجوع
            </Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit}>
              تعديل
            </Button>
          </Stack>
        }
      />

      {/* ====== MAIN CARD ====== */}
      <MainCard>
        {/* ====== BASIC INFORMATION SECTION ====== */}
        <TbaFormSection title="المعلومات الأساسية" icon={InfoIcon}>
          <Grid container spacing={2}>
            {/* Code */}
            <Grid item xs={12} md={6}>
              <TbaDetailField label="الرمز" value={service?.code} />
            </Grid>

            {/* Category */}
            <Grid item xs={12} md={6}>
              <TbaDetailField label="التصنيف الطبي" value={service?.category?.nameAr || service?.category?.nameEn} />
            </Grid>

            {/* Name Arabic */}
            <Grid item xs={12} md={6}>
              <TbaDetailField label="الاسم (عربي)" value={service?.nameAr} />
            </Grid>

            {/* Name English */}
            <Grid item xs={12} md={6}>
              <TbaDetailField label="الاسم (إنجليزي)" value={service?.nameEn} />
            </Grid>

            {/* Description */}
            {service?.description && (
              <Grid item xs={12}>
                <TbaDetailField label="الوصف" value={service.description} multiline />
              </Grid>
            )}
          </Grid>
        </TbaFormSection>

        {/* ====== PRICING SECTION ====== */}
        <TbaFormSection title="التسعير والتغطية" icon={AttachMoneyIcon}>
          <Grid container spacing={2}>
            {/* Price */}
            <Grid item xs={12} md={4}>
              <TbaDetailField label="السعر (د.ل)" value={formatPrice(service?.priceLyd)} />
            </Grid>

            {/* Cost */}
            <Grid item xs={12} md={4}>
              <TbaDetailField label="التكلفة (د.ل)" value={formatPrice(service?.costLyd)} />
            </Grid>

            {/* Coverage Limit */}
            <Grid item xs={12} md={4}>
              <TbaDetailField label="حد التغطية (د.ل)" value={formatPrice(service?.coverageLimit)} />
            </Grid>
          </Grid>
        </TbaFormSection>

        {/* ====== DETAILS SECTION ====== */}
        <TbaFormSection title="تفاصيل الخدمة" icon={DescriptionIcon}>
          <Grid container spacing={2}>
            {/* Duration */}
            <Grid item xs={12} md={6}>
              <TbaDetailField label="المدة المتوقعة" value={service?.duration ? `${service.duration} دقيقة` : null} />
            </Grid>

            {/* Requires Approval */}
            <Grid item xs={12} md={6}>
              <TbaDetailField label="يتطلب موافقة مسبقة">
                <Stack direction="row" spacing={1} alignItems="center">
                  {service?.requiresApproval ? (
                    <>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <span>نعم</span>
                    </>
                  ) : (
                    <>
                      <CancelIcon color="disabled" fontSize="small" />
                      <span>لا</span>
                    </>
                  )}
                </Stack>
              </TbaDetailField>
            </Grid>
          </Grid>
        </TbaFormSection>

        {/* ====== STATUS SECTION ====== */}
        <TbaFormSection title="الحالة" icon={VerifiedUserIcon}>
          <Grid container spacing={2}>
            {/* Active Status */}
            <Grid item xs={12} md={6}>
              <TbaDetailField label="حالة الخدمة">
                <Chip
                  label={service?.active ? 'نشط' : 'غير نشط'}
                  color={service?.active ? 'success' : 'default'}
                  size="medium"
                  variant="light"
                />
              </TbaDetailField>
            </Grid>
          </Grid>
        </TbaFormSection>

        {/* ====== METADATA SECTION ====== */}
        <TbaFormSection title="معلومات النظام" icon={HistoryIcon}>
          <Grid container spacing={2}>
            {/* Created At */}
            <Grid item xs={12} md={6}>
              <TbaDetailField label="تاريخ الإنشاء" value={formatDate(service?.createdAt)} />
            </Grid>

            {/* Updated At */}
            <Grid item xs={12} md={6}>
              <TbaDetailField label="آخر تحديث" value={formatDate(service?.updatedAt)} />
            </Grid>

            {/* Created By */}
            {service?.createdBy && (
              <Grid item xs={12} md={6}>
                <TbaDetailField label="أنشئ بواسطة" value={service.createdBy} />
              </Grid>
            )}

            {/* Updated By */}
            {service?.updatedBy && (
              <Grid item xs={12} md={6}>
                <TbaDetailField label="آخر تحديث بواسطة" value={service.updatedBy} />
              </Grid>
            )}
          </Grid>
        </TbaFormSection>
      </MainCard>
    </Box>
  );
};

export default MedicalServiceView;
