import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Card, 
  CardContent,
  CircularProgress, 
  Divider, 
  Grid, 
  Paper, 
  Stack, 
  Typography, 
  Alert 
} from '@mui/material';
import { 
  Edit as EditIcon, 
  ArrowBack,
  AssignmentTurnedIn as PreApprovalIcon,
  MedicalServices as MedicalIcon,
  AttachFile as AttachmentIcon,
  Receipt as ClaimIcon
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { usePreApprovalDetails } from 'hooks/usePreApprovals';

// Insurance UX Components - Phase B2 Step 3
import { 
  StatusTimeline, 
  CardStatusBadge, 
  PriorityBadge,
  ValidityCountdown,
  AmountComparisonBar,
  getWorkflowSteps
} from 'components/insurance';

// Pre-Approval Status Mapping for CardStatusBadge
const PREAPPROVAL_STATUS_MAP = {
  PENDING: 'PENDING',
  REQUESTED: 'PENDING',
  UNDER_REVIEW: 'PENDING',
  PENDING_DOCUMENTS: 'SUSPENDED',
  APPROVED: 'ACTIVE',
  REJECTED: 'BLOCKED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'INACTIVE'
};

// Arabic labels for statuses
const STATUS_LABELS = {
  PENDING: 'قيد المراجعة',
  REQUESTED: 'تم الإرسال',
  UNDER_REVIEW: 'قيد المراجعة الطبية',
  PENDING_DOCUMENTS: 'مطلوب مستندات',
  APPROVED: 'تمت الموافقة',
  REJECTED: 'مرفوض',
  EXPIRED: 'منتهية الصلاحية',
  CANCELLED: 'ملغى'
};

// Helper Info Row Component
const InfoRow = ({ label, value, valueColor }) => (
  <Grid container spacing={2} sx={{ mb: 1.5 }}>
    <Grid item xs={12} sm={4}>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
    </Grid>
    <Grid item xs={12} sm={8}>
      <Typography variant="body1" color={valueColor || 'text.primary'}>
        {value ?? '-'}
      </Typography>
    </Grid>
  </Grid>
);

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

  // Placeholder for Convert to Claim (UI only - no logic)
  const handleConvertToClaim = () => {
    // TODO: Implement in future phase
    console.log('Convert to Claim - Not implemented yet');
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

  // Get workflow steps for timeline
  const timelineSteps = getWorkflowSteps('preapproval', preApproval?.status, 'ar');

  return (
    <MainCard
      title={
        <Stack direction="row" spacing={2} alignItems="center">
          <PreApprovalIcon color="primary" />
          <Box>
            <Typography variant="h5">طلب موافقة مسبقة #{preApproval?.id ?? '-'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {preApproval?.member?.fullNameArabic ?? preApproval?.memberFullNameArabic ?? '-'}
            </Typography>
          </Box>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Insurance UX - CardStatusBadge */}
          <CardStatusBadge
            status={PREAPPROVAL_STATUS_MAP[preApproval?.status] ?? 'PENDING'}
            customLabel={STATUS_LABELS[preApproval?.status] ?? preApproval?.status}
            size="medium"
            variant="detailed"
          />
          {/* Insurance UX - PriorityBadge */}
          <PriorityBadge
            priority={preApproval?.priority ?? 'ROUTINE'}
            size="medium"
            variant="chip"
            showResponseTime={false}
            language="ar"
          />
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={handleBack}>
            رجوع
          </Button>
          <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit}>
            تعديل
          </Button>
        </Stack>
      }
    >
      <Stack spacing={3}>
        {/* ===================== WORKFLOW TIMELINE ===================== */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              مسار الطلب
            </Typography>
            {/* Insurance UX - StatusTimeline */}
            <StatusTimeline
              steps={timelineSteps}
              currentStep={preApproval?.status === 'PENDING' ? 'MEDICAL_REVIEW' : preApproval?.status}
              variant="horizontal"
              size="medium"
              showDates={true}
              language="ar"
            />
          </CardContent>
        </Card>

        {/* ===================== VALIDITY COUNTDOWN (APPROVED ONLY) ===================== */}
        {preApproval?.status === 'APPROVED' && (
          <Card variant="outlined" sx={{ bgcolor: 'success.lighter', borderColor: 'success.light' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                صلاحية الموافقة
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {/* Insurance UX - ValidityCountdown */}
              <ValidityCountdown
                approvalDate={preApproval?.reviewedAt ?? preApproval?.updatedAt ?? preApproval?.createdAt}
                validityDays={preApproval?.validityDays ?? 30}
                status={preApproval?.status}
                showAction={true}
                showProgress={true}
                onConvertToClaim={handleConvertToClaim}
                size="medium"
                language="ar"
              />
            </CardContent>
          </Card>
        )}

        <Grid container spacing={3}>
          {/* ===================== BASIC INFORMATION ===================== */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  المعلومات الأساسية
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <InfoRow label="رقم الطلب" value={preApproval?.id} />
                <InfoRow 
                  label="المؤمَّن عليه" 
                  value={preApproval?.member?.fullNameArabic ?? preApproval?.memberFullNameArabic} 
                />
                <InfoRow 
                  label="الرقم المدني" 
                  value={preApproval?.member?.civilId ?? preApproval?.memberCivilId} 
                />
                <InfoRow 
                  label="شركة التأمين" 
                  value={
                    preApproval?.insuranceCompany?.name ?? preApproval?.insuranceCompanyName
                      ? `${preApproval?.insuranceCompany?.name ?? preApproval?.insuranceCompanyName}${preApproval?.insuranceCompany?.code ? ` (${preApproval.insuranceCompany.code})` : ''}`
                      : '-'
                  } 
                />
                <InfoRow 
                  label="السياسة التأمينية" 
                  value={
                    preApproval?.insurancePolicy?.name
                      ? `${preApproval.insurancePolicy.name}${preApproval.insurancePolicy.code ? ` (${preApproval.insurancePolicy.code})` : ''}`
                      : '-'
                  } 
                />
                <InfoRow 
                  label="الباقة الطبية" 
                  value={
                    preApproval?.benefitPackage?.name
                      ? `${preApproval.benefitPackage.name}${preApproval.benefitPackage.code ? ` (${preApproval.benefitPackage.code})` : ''}`
                      : '-'
                  } 
                />
              </CardContent>
            </Card>
          </Grid>

          {/* ===================== MEDICAL INFORMATION ===================== */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <MedicalIcon color="primary" fontSize="small" />
                  <Typography variant="h6">المعلومات الطبية</Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <InfoRow label="مقدم الخدمة" value={preApproval?.providerName} />
                <InfoRow label="الطبيب" value={preApproval?.doctorName} />
                <InfoRow label="التشخيص (ICD10)" value={preApproval?.diagnosis} />
                <InfoRow label="الإجراء الطبي (CPT)" value={preApproval?.procedure} />
                <InfoRow 
                  label="عدد المرفقات" 
                  value={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AttachmentIcon fontSize="small" color="action" />
                      <Typography>{preApproval?.attachmentsCount ?? 0} مرفق</Typography>
                    </Stack>
                  } 
                />
              </CardContent>
            </Card>
          </Grid>

          {/* ===================== FINANCIAL INFORMATION ===================== */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  المعلومات المالية والموافقة
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                {/* Insurance UX - AmountComparisonBar */}
                <AmountComparisonBar
                  requestedAmount={typeof preApproval?.requestedAmount === 'number' ? preApproval.requestedAmount : 0}
                  approvedAmount={typeof preApproval?.approvedAmount === 'number' ? preApproval.approvedAmount : 0}
                  currency="د.ك"
                  copayPercentage={typeof preApproval?.copayPercentage === 'number' ? preApproval.copayPercentage : 0}
                  deductible={typeof preApproval?.deductible === 'number' ? preApproval.deductible : 0}
                  showBreakdown={preApproval?.status === 'APPROVED' || preApproval?.status === 'PARTIALLY_APPROVED'}
                  size="medium"
                  language="ar"
                />

                {/* Reviewer Comment */}
                {preApproval?.reviewerComment && (
                  <Box 
                    sx={{ 
                      mt: 3, 
                      p: 2, 
                      borderRadius: 1,
                      bgcolor: preApproval?.status === 'REJECTED' ? 'error.lighter' : 'success.lighter'
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      تعليق المراجع
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {preApproval.reviewerComment}
                    </Typography>
                  </Box>
                )}

                {/* Review Date */}
                {preApproval?.reviewedAt && (
                  <Box sx={{ mt: 2 }}>
                    <InfoRow 
                      label="تاريخ المراجعة" 
                      value={new Date(preApproval.reviewedAt).toLocaleString('ar-KW')} 
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* ===================== ACTION HINT (APPROVED ONLY) ===================== */}
          {preApproval?.status === 'APPROVED' && (
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ bgcolor: 'info.lighter', borderColor: 'info.light' }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        تحويل إلى مطالبة
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        يمكنك تحويل هذه الموافقة المسبقة إلى مطالبة بعد تقديم الخدمة للمؤمَّن عليه
                      </Typography>
                    </Box>
                    {/* Placeholder button - disabled until implementation */}
                    <Button 
                      variant="contained" 
                      color="info" 
                      startIcon={<ClaimIcon />}
                      disabled
                      sx={{ opacity: 0.7 }}
                    >
                      تحويل إلى مطالبة
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* ===================== AUDIT INFORMATION ===================== */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  معلومات التدقيق
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <InfoRow 
                      label="تاريخ الإنشاء" 
                      value={preApproval?.createdAt ? new Date(preApproval.createdAt).toLocaleString('ar-KW') : '-'} 
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoRow 
                      label="تاريخ آخر تحديث" 
                      value={preApproval?.updatedAt ? new Date(preApproval.updatedAt).toLocaleString('ar-KW') : '-'} 
                    />
                  </Grid>
                  {preApproval?.createdBy && (
                    <Grid item xs={12} md={6}>
                      <InfoRow label="أنشئ بواسطة" value={preApproval.createdBy} />
                    </Grid>
                  )}
                  {preApproval?.updatedBy && (
                    <Grid item xs={12} md={6}>
                      <InfoRow label="آخر تحديث بواسطة" value={preApproval.updatedBy} />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </MainCard>
  );
};

export default PreApprovalView;
