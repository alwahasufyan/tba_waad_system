import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  Typography,
  Chip,
  Stack,
  Alert,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  LocalHospital as LocalHospitalIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import { useVisitDetails } from 'hooks/useVisits';

/**
 * Visit View Page
 * Read-only detailed view of a visit
 */
const VisitView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: visit, loading, error } = useVisitDetails(id);

  const breadcrumbs = [{ title: 'الزيارات', path: '/visits' }, { title: 'عرض الزيارة' }];

  if (loading) {
    return (
      <>
        <ModernPageHeader title="عرض الزيارة" subtitle="تحميل بيانات الزيارة..." icon={<LocalHospitalIcon />} breadcrumbs={breadcrumbs} />
        <MainCard>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} md={6} key={i}>
                <Skeleton variant="rectangular" height={120} />
              </Grid>
            ))}
          </Grid>
        </MainCard>
      </>
    );
  }

  if (error || !visit) {
    return (
      <>
        <ModernPageHeader title="خطأ" subtitle="فشل تحميل بيانات الزيارة" icon={<LocalHospitalIcon />} breadcrumbs={breadcrumbs} />
        <MainCard>
          <Alert severity="error">
            {error?.message || 'لم يتم العثور على الزيارة'}
            <Button onClick={() => navigate('/visits')} sx={{ mt: 2 }}>
              العودة إلى القائمة
            </Button>
          </Alert>
        </MainCard>
      </>
    );
  }

  const InfoRow = ({ label, value }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        {label}
      </Typography>
      <Typography variant="body1">{value || '-'}</Typography>
    </Box>
  );

  return (
    <>
      <ModernPageHeader
        title="عرض الزيارة"
        subtitle={`تفاصيل الزيارة #${id}`}
        icon={<LocalHospitalIcon />}
        breadcrumbs={breadcrumbs}
        actions={
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/visits')}>
              رجوع
            </Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/visits/edit/${id}`)}>
              تعديل
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        {/* Visit Information */}
        <Grid item xs={12} md={6}>
          <MainCard title="معلومات الزيارة" contentSX={{ pt: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <CalendarMonthIcon color="primary" />
              <Typography variant="subtitle2">التاريخ</Typography>
            </Stack>
            <InfoRow
              label="تاريخ الزيارة"
              value={visit.visitDate ? new Date(visit.visitDate).toLocaleDateString('ar-LY', { dateStyle: 'long' }) : '-'}
            />
          </MainCard>
        </Grid>

        {/* Member Information */}
        <Grid item xs={12} md={6}>
          <MainCard title="معلومات العضو" contentSX={{ pt: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <PersonIcon color="primary" />
              <Typography variant="subtitle2">العضو</Typography>
            </Stack>
            <InfoRow label="اسم العضو" value={visit.member?.fullName || visit.member?.nameAr || visit.member?.nameEn || '-'} />
            <InfoRow label="معرف العضو" value={visit.memberId || visit.member?.id || '-'} />
          </MainCard>
        </Grid>

        {/* Provider Information */}
        <Grid item xs={12} md={6}>
          <MainCard title="معلومات مقدم الخدمة" contentSX={{ pt: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <BusinessIcon color="primary" />
              <Typography variant="subtitle2">مقدم الخدمة</Typography>
            </Stack>
            <InfoRow label="الاسم بالعربية" value={visit.provider?.nameAr || '-'} />
            <InfoRow label="الاسم بالإنجليزية" value={visit.provider?.nameEn || '-'} />
            <InfoRow label="معرف المقدم" value={visit.providerId || visit.provider?.id || '-'} />
          </MainCard>
        </Grid>

        {/* Services */}
        <Grid item xs={12} md={6}>
          <MainCard
            title="الخدمات المقدمة"
            contentSX={{ pt: 2 }}
            secondary={
              <Chip
                label={`${visit.services?.length || 0} خدمة`}
                color="primary"
                size="small"
                sx={{ backgroundColor: 'primary.lighter', color: 'primary.main' }}
              />
            }
          >
            {Array.isArray(visit.services) && visit.services.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>الرمز</TableCell>
                      <TableCell>الاسم بالعربية</TableCell>
                      <TableCell>الاسم بالإنجليزية</TableCell>
                      <TableCell align="center">السعر</TableCell>
                      <TableCell align="center">يتطلب موافقة</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visit.services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.code || '-'}</TableCell>
                        <TableCell>{service.nameAr || '-'}</TableCell>
                        <TableCell>{service.nameEn || '-'}</TableCell>
                        <TableCell align="center">{service.price ? `${service.price.toFixed(2)} د.ل` : '-'}</TableCell>
                        <TableCell align="center">
                          {service.requiresApproval ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : (
                            <CancelIcon color="disabled" fontSize="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">لا توجد خدمات مسجلة</Alert>
            )}
          </MainCard>
        </Grid>

        {/* Notes & Diagnosis */}
        <Grid item xs={12}>
          <MainCard title="الملاحظات والتشخيص" contentSX={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <InfoRow
                  label="الملاحظات"
                  value={
                    visit.notes ? (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {visit.notes}
                      </Typography>
                    ) : (
                      '-'
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <InfoRow
                  label="التشخيص"
                  value={
                    visit.diagnosis ? (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {visit.diagnosis}
                      </Typography>
                    ) : (
                      '-'
                    )
                  }
                />
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        {/* Status */}
        <Grid item xs={12} md={6}>
          <MainCard title="الحالة" contentSX={{ pt: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              {visit.active ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {visit.active ? 'نشط' : 'غير نشط'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {visit.active ? 'هذه الزيارة مفعلة في النظام' : 'هذه الزيارة غير مفعلة'}
                </Typography>
              </Box>
            </Stack>
          </MainCard>
        </Grid>

        {/* System Metadata */}
        <Grid item xs={12} md={6}>
          <MainCard title="معلومات النظام" contentSX={{ pt: 2 }}>
            <InfoRow label="المعرف" value={visit.id} />
            {visit.createdAt && (
              <InfoRow label="تاريخ الإنشاء" value={new Date(visit.createdAt).toLocaleString('ar-LY', { dateStyle: 'medium', timeStyle: 'short' })} />
            )}
            {visit.updatedAt && (
              <InfoRow
                label="آخر تحديث"
                value={new Date(visit.updatedAt).toLocaleString('ar-LY', { dateStyle: 'medium', timeStyle: 'short' })}
              />
            )}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default VisitView;
