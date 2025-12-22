/**
 * Medical Service View Page - GOLDEN REFERENCE MODULE
 * Phase D2 - Reference Module Pattern
 *
 * ⚠️ This is the REFERENCE implementation for all CRUD view pages.
 * Pattern: ModernPageHeader → MainCard → Detail Sections (Paper boxes)
 *
 * Rules Applied:
 * 1. icon={Component} - NEVER JSX
 * 2. Arabic only - No English labels
 * 3. Defensive optional chaining
 * 4. Proper error states (403 صلاحيات, 500 خطأ تقني)
 */

import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// MUI Components
import { Box, Button, Grid, Paper, Stack, Typography, Chip, Divider, Skeleton } from '@mui/material';

// MUI Icons - Always as Component, NEVER as JSX
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import ModernEmptyState from 'components/tba/ModernEmptyState';

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
// SUB-COMPONENTS
// ============================================================================

/**
 * DetailField - Reusable field display component
 */
const DetailField = ({ label, children }) => (
  <Paper variant="outlined" sx={{ p: 2 }}>
    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
      {label}
    </Typography>
    {children}
  </Paper>
);

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
            <DetailField label="الرمز">
              <Typography variant="body1" fontWeight="medium">
                {service?.code || '-'}
              </Typography>
            </DetailField>
          </Grid>

          {/* Category */}
          <Grid item xs={12} md={6}>
            <DetailField label="التصنيف الطبي">
              <Typography variant="body1" fontWeight="medium">
                {service?.category?.nameAr || service?.category?.nameEn || '-'}
              </Typography>
            </DetailField>
          </Grid>

          {/* Name Arabic */}
          <Grid item xs={12} md={6}>
            <DetailField label="الاسم (عربي)">
              <Typography variant="body1" fontWeight="medium">
                {service?.nameAr || '-'}
              </Typography>
            </DetailField>
          </Grid>

          {/* Name English */}
          <Grid item xs={12} md={6}>
            <DetailField label="الاسم (إنجليزي)">
              <Typography variant="body1" fontWeight="medium">
                {service?.nameEn || '-'}
              </Typography>
            </DetailField>
          </Grid>

          {/* Description */}
          {service?.description && (
            <Grid item xs={12}>
              <DetailField label="الوصف">
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {service.description}
                </Typography>
              </DetailField>
            </Grid>
          )}

          {/* ====== PRICING SECTION ====== */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              التسعير والتغطية
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* Price */}
          <Grid item xs={12} md={4}>
            <DetailField label="السعر (د.ل)">
              <Typography variant="body1" fontWeight="medium">
                {formatPrice(service?.priceLyd)}
              </Typography>
            </DetailField>
          </Grid>

          {/* Cost */}
          <Grid item xs={12} md={4}>
            <DetailField label="التكلفة (د.ل)">
              <Typography variant="body1" fontWeight="medium">
                {formatPrice(service?.costLyd)}
              </Typography>
            </DetailField>
          </Grid>

          {/* Coverage Limit */}
          <Grid item xs={12} md={4}>
            <DetailField label="حد التغطية (د.ل)">
              <Typography variant="body1" fontWeight="medium">
                {formatPrice(service?.coverageLimit)}
              </Typography>
            </DetailField>
          </Grid>

          {/* ====== DETAILS SECTION ====== */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              تفاصيل الخدمة
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* Duration */}
          <Grid item xs={12} md={6}>
            <DetailField label="المدة المتوقعة">
              <Typography variant="body1" fontWeight="medium">
                {service?.duration ? `${service.duration} دقيقة` : '-'}
              </Typography>
            </DetailField>
          </Grid>

          {/* Requires Approval */}
          <Grid item xs={12} md={6}>
            <DetailField label="يتطلب موافقة مسبقة">
              <Stack direction="row" spacing={1} alignItems="center">
                {service?.requiresApproval ? (
                  <>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body1" fontWeight="medium">
                      نعم
                    </Typography>
                  </>
                ) : (
                  <>
                    <CancelIcon color="disabled" fontSize="small" />
                    <Typography variant="body1" fontWeight="medium">
                      لا
                    </Typography>
                  </>
                )}
              </Stack>
            </DetailField>
          </Grid>

          {/* ====== STATUS SECTION ====== */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              الحالة
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* Active Status */}
          <Grid item xs={12} md={6}>
            <DetailField label="حالة الخدمة">
              <Chip
                label={service?.active ? 'نشط' : 'غير نشط'}
                color={service?.active ? 'success' : 'default'}
                size="medium"
                variant="light"
              />
            </DetailField>
          </Grid>

          {/* ====== METADATA SECTION ====== */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              معلومات النظام
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* Created At */}
          <Grid item xs={12} md={6}>
            <DetailField label="تاريخ الإنشاء">
              <Typography variant="body1">{formatDate(service?.createdAt)}</Typography>
            </DetailField>
          </Grid>

          {/* Updated At */}
          <Grid item xs={12} md={6}>
            <DetailField label="آخر تحديث">
              <Typography variant="body1">{formatDate(service?.updatedAt)}</Typography>
            </DetailField>
          </Grid>

          {/* Created By */}
          {service?.createdBy && (
            <Grid item xs={12} md={6}>
              <DetailField label="أنشئ بواسطة">
                <Typography variant="body1">{service.createdBy}</Typography>
              </DetailField>
            </Grid>
          )}

          {/* Updated By */}
          {service?.updatedBy && (
            <Grid item xs={12} md={6}>
              <DetailField label="آخر تحديث بواسطة">
                <Typography variant="body1">{service.updatedBy}</Typography>
              </DetailField>
            </Grid>
          )}
        </Grid>
      </MainCard>
    </Box>
  );
};

export default MedicalServiceView;
