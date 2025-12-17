import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Grid, Paper, Stack, Typography, Chip, Divider, Alert, Skeleton } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon, MedicalServices as MedicalServicesIcon, CheckCircle, Cancel } from '@mui/icons-material';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import { useMedicalServiceDetails } from 'hooks/useMedicalServices';

/**
 * Medical Service View Page
 * Displays detailed read-only view of a medical service
 */
const MedicalServiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: service, loading, error } = useMedicalServiceDetails(id);

  // Loading skeleton
  if (loading) {
    return (
      <Box>
        <ModernPageHeader
          title="عرض الخدمة الطبية"
          subtitle="تفاصيل الخدمة الطبية"
          icon={MedicalServicesIcon}
          breadcrumbs={[
            { label: 'الرئيسية', path: '/' },
            { label: 'الخدمات الطبية', path: '/medical-services' },
            { label: 'عرض' }
          ]}
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

  // Error state
  if (error || !service) {
    return (
      <Box>
        <ModernPageHeader
          title="عرض الخدمة الطبية"
          subtitle="تفاصيل الخدمة الطبية"
          icon={MedicalServicesIcon}
          breadcrumbs={[
            { label: 'الرئيسية', path: '/' },
            { label: 'الخدمات الطبية', path: '/medical-services' },
            { label: 'عرض' }
          ]}
        />
        <MainCard>
          <Alert severity="error">{error?.message || 'فشل تحميل بيانات الخدمة'}</Alert>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/medical-services')} sx={{ mt: 2 }}>
            رجوع للقائمة
          </Button>
        </MainCard>
      </Box>
    );
  }

  return (
    <Box>
      <ModernPageHeader
        title="عرض الخدمة الطبية"
        subtitle={service.nameAr}
        icon={MedicalServicesIcon}
        breadcrumbs={[
          { label: 'الرئيسية', path: '/' },
          { label: 'الخدمات الطبية', path: '/medical-services' },
          { label: service.code }
        ]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/medical-services')}>
              رجوع
            </Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/medical-services/edit/${id}`)}>
              تعديل
            </Button>
          </Stack>
        }
      />

      <MainCard>
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
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                الرمز
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {service.code}
              </Typography>
            </Paper>
          </Grid>

          {/* Category */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                التصنيف الطبي
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {service.category?.nameAr || service.category?.nameEn || '-'}
              </Typography>
            </Paper>
          </Grid>

          {/* Name Arabic */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                الاسم (عربي)
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {service.nameAr}
              </Typography>
            </Paper>
          </Grid>

          {/* Name English */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                الاسم (إنجليزي)
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {service.nameEn}
              </Typography>
            </Paper>
          </Grid>

          {/* Description */}
          {service.description && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  الوصف
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {service.description}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Pricing & Coverage Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              التسعير والتغطية
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* Price */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                السعر (LYD)
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {service.priceLyd ? `${service.priceLyd.toFixed(2)} LYD` : '-'}
              </Typography>
            </Paper>
          </Grid>

          {/* Cost */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                التكلفة (LYD)
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {service.costLyd ? `${service.costLyd.toFixed(2)} LYD` : '-'}
              </Typography>
            </Paper>
          </Grid>

          {/* Coverage Limit */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                حد التغطية (LYD)
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {service.coverageLimit ? `${service.coverageLimit.toFixed(2)} LYD` : '-'}
              </Typography>
            </Paper>
          </Grid>

          {/* Service Details Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              تفاصيل الخدمة
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* Duration */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                المدة المتوقعة
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {service.duration ? `${service.duration} دقيقة` : '-'}
              </Typography>
            </Paper>
          </Grid>

          {/* Requires Approval */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                يتطلب موافقة مسبقة
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                {service.requiresApproval ? (
                  <>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="body1" fontWeight="medium">
                      نعم
                    </Typography>
                  </>
                ) : (
                  <>
                    <Cancel color="disabled" fontSize="small" />
                    <Typography variant="body1" fontWeight="medium">
                      لا
                    </Typography>
                  </>
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* Status Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              الحالة
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* Active Status */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                حالة الخدمة
              </Typography>
              <Chip label={service.active ? 'نشط' : 'غير نشط'} color={service.active ? 'success' : 'default'} size="medium" />
            </Paper>
          </Grid>

          {/* Metadata Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              معلومات النظام
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* Created At */}
          {service.createdAt && (
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  تاريخ الإنشاء
                </Typography>
                <Typography variant="body1">{new Date(service.createdAt).toLocaleString('ar-LY')}</Typography>
              </Paper>
            </Grid>
          )}

          {/* Updated At */}
          {service.updatedAt && (
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  آخر تحديث
                </Typography>
                <Typography variant="body1">{new Date(service.updatedAt).toLocaleString('ar-LY')}</Typography>
              </Paper>
            </Grid>
          )}

          {/* Created By */}
          {service.createdBy && (
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  أنشئ بواسطة
                </Typography>
                <Typography variant="body1">{service.createdBy}</Typography>
              </Paper>
            </Grid>
          )}

          {/* Updated By */}
          {service.updatedBy && (
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  آخر تحديث بواسطة
                </Typography>
                <Typography variant="body1">{service.updatedBy}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </MainCard>
    </Box>
  );
};

export default MedicalServiceView;
