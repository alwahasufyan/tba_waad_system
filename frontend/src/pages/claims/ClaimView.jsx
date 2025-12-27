import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Paper
} from '@mui/material';
import { 
  ArrowBack, 
  Edit,
  Receipt as ReceiptIcon,
  MedicalServices as MedicalIcon,
  AttachFile as AttachmentIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { ModernPageHeader } from 'components/tba';
import { useClaimDetails } from 'hooks/useClaims';

// Insurance UX Components - Phase B2 Step 2
import { 
  StatusTimeline, 
  AmountComparisonBar, 
  CardStatusBadge, 
  NetworkBadge,
  CLAIM_WORKFLOW_STEPS,
  getWorkflowSteps 
} from 'components/insurance';

// Claim Status Mapping for CardStatusBadge
const CLAIM_STATUS_MAP = {
  PENDING_REVIEW: 'PENDING',
  PREAPPROVED: 'ACTIVE',
  APPROVED: 'ACTIVE',
  PARTIALLY_APPROVED: 'ACTIVE',
  REJECTED: 'BLOCKED',
  RETURNED_FOR_INFO: 'SUSPENDED',
  CANCELLED: 'INACTIVE',
  SETTLED: 'ACTIVE'
};

// Helper to get file icon based on type
const getFileIcon = (fileType) => {
  if (!fileType) return <DocIcon fontSize="small" color="action" />;
  const type = fileType.toLowerCase();
  if (type.includes('pdf')) return <PdfIcon fontSize="small" color="error" />;
  if (type.includes('image') || type.includes('jpg') || type.includes('png')) {
    return <ImageIcon fontSize="small" color="primary" />;
  }
  return <DocIcon fontSize="small" color="action" />;
};

const InfoRow = ({ label, value, valueColor }) => (
  <Grid container spacing={2} sx={{ mb: 1.5 }}>
    <Grid item xs={4}>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
    </Grid>
    <Grid item xs={8}>
      <Typography variant="body1" color={valueColor || 'text.primary'}>
        {value ?? '-'}
      </Typography>
    </Grid>
  </Grid>
);

const ClaimView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { claim, loading } = useClaimDetails(id);

  if (loading) {
    return (
      <MainCard title="تفاصيل المطالبة">
        <Typography>جاري التحميل...</Typography>
      </MainCard>
    );
  }

  if (!claim) {
    return (
      <MainCard title="تفاصيل المطالبة">
        <Typography>المطالبة غير موجودة</Typography>
      </MainCard>
    );
  }

  // Get workflow steps for timeline
  const timelineSteps = getWorkflowSteps('claim', claim?.status, 'ar');

  return (
    <>
    <ModernPageHeader
      title={`مطالبة #${claim?.id ?? '-'}`}
      subtitle={claim?.memberFullNameArabic ?? claim?.memberFullNameEnglish ?? '-'}
      icon={ReceiptIcon}
      breadcrumbs={[
        { label: 'الرئيسية', href: '/' },
        { label: 'المطالبات', href: '/claims' },
        { label: `مطالبة #${claim?.id ?? '-'}` }
      ]}
      actions={
        <Stack direction="row" spacing={2} alignItems="center">
          <CardStatusBadge
            status={CLAIM_STATUS_MAP[claim?.status] ?? 'PENDING'}
            customLabel={claim?.statusLabel}
            size="medium"
            variant="detailed"
          />
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`/claims/edit/${id}`)}
          >
            تعديل
          </Button>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/claims')}
          >
            عودة
          </Button>
        </Stack>
      }
    />
    <MainCard>
      <Stack spacing={3}>
        {/* ===================== CLAIM TIMELINE ===================== */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              مسار المطالبة
            </Typography>
            {/* Insurance UX - StatusTimeline */}
            <StatusTimeline
              steps={timelineSteps}
              currentStep={claim?.status}
              variant="horizontal"
              size="medium"
              showDates={true}
              language="ar"
            />
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* ===================== BASIC INFORMATION ===================== */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  المعلومات الأساسية
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <InfoRow label="رقم المطالبة" value={claim?.id} />
                <InfoRow label="المؤمَّن عليه" value={claim?.memberFullNameArabic ?? claim?.memberFullNameEnglish} />
                <InfoRow label="الرقم المدني" value={claim?.memberCivilId} />
                <InfoRow label="جهة العمل" value={claim?.employerName ?? '-'} />
                {/* NOTE: InsuranceCompany/Policy/Package fields REMOVED - Use BenefitPolicy via member only */}
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
                
                {/* Provider with NetworkBadge */}
                <Grid container spacing={2} sx={{ mb: 1.5 }}>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      مقدم الخدمة
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body1">{claim?.providerName ?? '-'}</Typography>
                      {/* Insurance UX - NetworkBadge */}
                      <NetworkBadge
                        networkTier={claim?.networkTier ?? 'IN_NETWORK'}
                        size="small"
                        variant="chip"
                        language="ar"
                      />
                    </Stack>
                  </Grid>
                </Grid>
                
                <InfoRow label="الطبيب" value={claim?.doctorName} />
                <InfoRow label="التشخيص" value={claim?.diagnosis} />
                <InfoRow 
                  label="تاريخ الزيارة" 
                  value={claim?.visitDate ? new Date(claim.visitDate).toLocaleDateString('ar-SA') : '-'}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* ===================== FINANCIAL BREAKDOWN ===================== */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  الملخص المالي
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                {/* Insurance UX - AmountComparisonBar */}
                <AmountComparisonBar
                  requestedAmount={typeof claim?.requestedAmount === 'number' ? claim.requestedAmount : 0}
                  approvedAmount={typeof claim?.approvedAmount === 'number' ? claim.approvedAmount : 0}
                  currency="LYD"
                  copayPercentage={typeof claim?.copayPercentage === 'number' ? claim.copayPercentage : 0}
                  deductible={typeof claim?.deductible === 'number' ? claim.deductible : 0}
                  showBreakdown={true}
                  size="medium"
                  language="ar"
                />
                
                {/* Reviewer Comment */}
                {claim?.reviewerComment && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      تعليق المراجع
                    </Typography>
                    <Typography variant="body2">{claim.reviewerComment}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

        {/* ===================== SERVICE LINES ===================== */}
        {Array.isArray(claim?.lines) && claim.lines.length > 0 && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <MedicalIcon color="primary" fontSize="small" />
                  <Typography variant="h6">الخدمات الطبية ({claim.lines.length})</Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>كود الخدمة</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>الوصف</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>الكمية</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>سعر الوحدة</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>المجموع</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {claim.lines.map((line, index) => (
                        <TableRow key={line?.id ?? index} hover>
                          <TableCell align="right">
                            <Chip 
                              label={line?.serviceCode ?? '-'} 
                              size="small" 
                              variant="outlined" 
                              color="primary"
                            />
                          </TableCell>
                          <TableCell align="right">{line?.description ?? '-'}</TableCell>
                          <TableCell align="center">{line?.quantity ?? 1}</TableCell>
                          <TableCell align="right">
                            {typeof line?.unitPrice === 'number'
                              ? line.unitPrice.toLocaleString('ar-SA', { minimumFractionDigits: 2 })
                              : '-'}
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={500}>
                              {typeof line?.totalPrice === 'number'
                                ? line.totalPrice.toLocaleString('ar-SA', { minimumFractionDigits: 2 })
                                : '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* ===================== ATTACHMENTS ===================== */}
        {Array.isArray(claim?.attachments) && claim.attachments.length > 0 && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <AttachmentIcon color="primary" fontSize="small" />
                  <Typography variant="h6">المرفقات ({claim.attachments.length})</Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>النوع</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>اسم الملف</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>تاريخ الرفع</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {claim.attachments.map((attachment, index) => (
                        <TableRow key={attachment?.id ?? index} hover>
                          <TableCell align="right">
                            {/* File type icon */}
                            {getFileIcon(attachment?.fileType)}
                          </TableCell>
                          <TableCell align="right">{attachment?.fileName ?? '-'}</TableCell>
                          <TableCell align="right">
                            {attachment?.createdAt 
                              ? new Date(attachment.createdAt).toLocaleDateString('ar-SA')
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
        </Grid>
      </Stack>
    </MainCard>
    </>
  );
};

export default ClaimView;
