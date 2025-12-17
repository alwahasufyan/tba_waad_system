import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Chip, CircularProgress, Divider, Grid, Paper, Stack, Typography, Alert } from '@mui/material';
import { Edit as EditIcon, ArrowBack } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { usePreApprovalDetails } from 'hooks/usePreApprovals';

const STATUS_COLORS = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error'
};

const STATUS_LABELS = {
  PENDING: 'قيد المراجعة',
  APPROVED: 'موافق عليه',
  REJECTED: 'مرفوض'
};

const PreApprovalView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { preApproval, loading, error } = usePreApprovalDetails(id);

  const handleEdit = () => {
    navigate(`/pre-approvals/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/pre-approvals');
  };

  if (loading) {
    return (
      <MainCard>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (error) {
    return (
      <MainCard>
        <Alert severity="error">{error}</Alert>
      </MainCard>
    );
  }

  if (!preApproval) {
    return (
      <MainCard>
        <Alert severity="warning">لم يتم العثور على الطلب</Alert>
      </MainCard>
    );
  }

  return (
    <MainCard
      title="تفاصيل طلب الموافقة المسبقة"
      secondary={
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={handleBack}>
            رجوع
          </Button>
          <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit}>
            تعديل
          </Button>
        </Stack>
      }
    >
      <Grid container spacing={3}>
        {/* Section 1: Basic Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              المعلومات الأساسية
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  رقم الطلب
                </Typography>
                <Typography variant="body1">{preApproval.id}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  حالة الطلب
                </Typography>
                <Chip label={STATUS_LABELS[preApproval.status]} color={STATUS_COLORS[preApproval.status]} size="small" />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  اسم العضو
                </Typography>
                <Typography variant="body1">{preApproval.member?.fullNameArabic || '-'}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  الرقم المدني
                </Typography>
                <Typography variant="body1">{preApproval.member?.civilId || '-'}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  شركة التأمين
                </Typography>
                <Typography variant="body1">
                  {preApproval.insuranceCompany?.name || '-'}{' '}
                  {preApproval.insuranceCompany?.code ? `(${preApproval.insuranceCompany.code})` : ''}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  السياسة التأمينية
                </Typography>
                <Typography variant="body1">
                  {preApproval.insurancePolicy?.name || '-'}{' '}
                  {preApproval.insurancePolicy?.code ? `(${preApproval.insurancePolicy.code})` : ''}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  الباقة الطبية
                </Typography>
                <Typography variant="body1">
                  {preApproval.benefitPackage?.name || '-'} {preApproval.benefitPackage?.code ? `(${preApproval.benefitPackage.code})` : ''}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  تاريخ الإنشاء
                </Typography>
                <Typography variant="body1">
                  {preApproval.createdAt ? new Date(preApproval.createdAt).toLocaleString('ar-KW') : '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  تاريخ آخر تحديث
                </Typography>
                <Typography variant="body1">
                  {preApproval.updatedAt ? new Date(preApproval.updatedAt).toLocaleString('ar-KW') : '-'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Section 2: Medical Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              المعلومات الطبية
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  اسم مقدم الخدمة
                </Typography>
                <Typography variant="body1">{preApproval.providerName || '-'}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  اسم الطبيب
                </Typography>
                <Typography variant="body1">{preApproval.doctorName || '-'}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  التشخيص (ICD10)
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {preApproval.diagnosis || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  الإجراء الطبي (CPT)
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {preApproval.procedure || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  عدد المرفقات
                </Typography>
                <Typography variant="body1">{preApproval.attachmentsCount || 0}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Section 3: Financial & Approval Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              المعلومات المالية والموافقة
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  المبلغ المطلوب
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {preApproval.requestedAmount ? `${Number(preApproval.requestedAmount).toLocaleString('ar-KW')} د.ك` : '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  المبلغ الموافق عليه
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: preApproval.status === 'APPROVED' ? 'success.main' : 'inherit' }}
                >
                  {preApproval.approvedAmount ? `${Number(preApproval.approvedAmount).toLocaleString('ar-KW')} د.ك` : '-'}
                </Typography>
              </Grid>

              {preApproval.reviewedAt && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    تاريخ المراجعة
                  </Typography>
                  <Typography variant="body1">{new Date(preApproval.reviewedAt).toLocaleString('ar-KW')}</Typography>
                </Grid>
              )}

              {preApproval.reviewerComment && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    تعليق المراجع
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      mt: 1,
                      backgroundColor: preApproval.status === 'REJECTED' ? 'error.lighter' : 'success.lighter'
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {preApproval.reviewerComment}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {preApproval.createdBy && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    أنشئ بواسطة
                  </Typography>
                  <Typography variant="body1">{preApproval.createdBy}</Typography>
                </Grid>
              )}

              {preApproval.updatedBy && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    آخر تحديث بواسطة
                  </Typography>
                  <Typography variant="body1">{preApproval.updatedBy}</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default PreApprovalView;
