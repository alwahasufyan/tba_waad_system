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
  TableRow
} from '@mui/material';
import { ArrowBack, Edit } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { useClaimDetails } from 'hooks/useClaims';

const STATUS_COLORS = {
  PENDING_REVIEW: 'warning',
  PREAPPROVED: 'info',
  APPROVED: 'success',
  PARTIALLY_APPROVED: 'primary',
  REJECTED: 'error',
  RETURNED_FOR_INFO: 'secondary',
  CANCELLED: 'default'
};

const InfoRow = ({ label, value }) => (
  <Grid container spacing={2} sx={{ mb: 2 }}>
    <Grid item xs={4}>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
    </Grid>
    <Grid item xs={8}>
      <Typography variant="body1">{value || '-'}</Typography>
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

  return (
    <MainCard
      title="تفاصيل المطالبة"
      secondary={
        <Box sx={{ display: 'flex', gap: 1 }}>
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
        </Box>
      }
    >
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                المعلومات الأساسية
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <InfoRow label="رقم المطالبة" value={claim.id} />
              <InfoRow
                label="حالة المطالبة"
                value={
                  <Chip
                    label={claim.statusLabel}
                    color={STATUS_COLORS[claim.status] || 'default'}
                  />
                }
              />
              <InfoRow label="اسم العضو" value={claim.memberFullNameArabic} />
              <InfoRow label="الرقم المدني" value={claim.memberCivilId} />
              <InfoRow label="شركة التأمين" value={claim.companyName} />
              {claim.policyName && (
                <InfoRow label="السياسة التأمينية" value={claim.policyName} />
              )}
              {claim.packageName && (
                <InfoRow label="الباقة الطبية" value={claim.packageName} />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Medical Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                المعلومات الطبية
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <InfoRow label="مقدم الخدمة" value={claim.providerName} />
              <InfoRow label="الطبيب" value={claim.doctorName} />
              <InfoRow label="التشخيص" value={claim.diagnosis} />
              <InfoRow
                label="تاريخ الزيارة"
                value={
                  claim.visitDate
                    ? new Date(claim.visitDate).toLocaleDateString('ar-SA')
                    : '-'
                }
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                المعلومات المالية
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <InfoRow
                label="المبلغ المطلوب"
                value={claim.requestedAmount?.toLocaleString('ar-SA', {
                  minimumFractionDigits: 2
                })}
              />
              <InfoRow
                label="المبلغ الموافق عليه"
                value={
                  claim.approvedAmount
                    ? claim.approvedAmount.toLocaleString('ar-SA', {
                        minimumFractionDigits: 2
                      })
                    : '-'
                }
              />
              <InfoRow
                label="الفرق"
                value={
                  claim.differenceAmount
                    ? claim.differenceAmount.toLocaleString('ar-SA', {
                        minimumFractionDigits: 2
                      })
                    : '-'
                }
              />
              {claim.reviewerComment && (
                <InfoRow label="تعليق المراجع" value={claim.reviewerComment} />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Service Lines */}
        {claim.lines && claim.lines.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  الخدمات
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="right">كود الخدمة</TableCell>
                        <TableCell align="right">الوصف</TableCell>
                        <TableCell align="right">الكمية</TableCell>
                        <TableCell align="right">سعر الوحدة</TableCell>
                        <TableCell align="right">المجموع</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {claim.lines.map((line, index) => (
                        <TableRow key={index}>
                          <TableCell align="right">{line.serviceCode}</TableCell>
                          <TableCell align="right">{line.description}</TableCell>
                          <TableCell align="right">{line.quantity}</TableCell>
                          <TableCell align="right">
                            {line.unitPrice?.toLocaleString('ar-SA', {
                              minimumFractionDigits: 2
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {line.totalPrice?.toLocaleString('ar-SA', {
                              minimumFractionDigits: 2
                            })}
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

        {/* Attachments */}
        {claim.attachments && claim.attachments.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  المرفقات
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="right">اسم الملف</TableCell>
                        <TableCell align="right">نوع الملف</TableCell>
                        <TableCell align="right">تاريخ الرفع</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {claim.attachments.map((attachment, index) => (
                        <TableRow key={index}>
                          <TableCell align="right">{attachment.fileName}</TableCell>
                          <TableCell align="right">{attachment.fileType}</TableCell>
                          <TableCell align="right">
                            {new Date(attachment.createdAt).toLocaleDateString(
                              'ar-SA'
                            )}
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
    </MainCard>
  );
};

export default ClaimView;
