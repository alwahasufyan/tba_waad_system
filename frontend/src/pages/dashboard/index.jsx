import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

// icons
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RefreshIcon from '@mui/icons-material/Refresh';

// project imports
import MainCard from 'components/MainCard';
import { CardStatusBadge, PriorityBadge } from 'components/insurance';

// hooks
import { useClaimsList } from 'hooks/useClaims';
import { useVisitsList } from 'hooks/useVisits';
import { usePreApprovalsList } from 'hooks/usePreApprovals';

// ==============================|| DASHBOARD - OPERATIONAL REPORTS ||============================== //

// Claim Status Mapping for CardStatusBadge
const CLAIM_STATUS_MAP = {
  PENDING_REVIEW: 'PENDING',
  PREAPPROVED: 'ACTIVE',
  APPROVED: 'ACTIVE',
  PARTIALLY_APPROVED: 'ACTIVE',
  REJECTED: 'BLOCKED',
  RETURNED_FOR_INFO: 'SUSPENDED',
  CANCELLED: 'INACTIVE',
  SETTLED: 'ACTIVE',
  PENDING: 'PENDING'
};

// Pre-Approval Status Mapping
const PREAPPROVAL_STATUS_MAP = {
  PENDING: 'PENDING',
  PENDING_REVIEW: 'PENDING',
  APPROVED: 'ACTIVE',
  REJECTED: 'BLOCKED',
  CANCELLED: 'INACTIVE',
  EXPIRED: 'EXPIRED'
};

// Visit type labels (Arabic)
const VISIT_TYPE_LABELS = {
  OUTPATIENT: 'عيادة خارجية',
  INPATIENT: 'تنويم',
  EMERGENCY: 'طوارئ',
  DAY_CASE: 'حالة يومية',
  DENTAL: 'أسنان',
  OPTICAL: 'بصريات',
  MATERNITY: 'ولادة'
};

// ==============================|| SUMMARY CARD COMPONENT ||============================== //

const SummaryCard = ({ title, mainValue, subValue, subLabel, icon: Icon, color = 'primary', loading }) => (
  <Card 
    sx={{ 
      height: '100%',
      borderRight: 4,
      borderColor: `${color}.main`,
      '&:hover': { boxShadow: 3 }
    }}
  >
    <CardContent>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <>
              <Typography variant="h3" fontWeight={700}>
                {mainValue}
              </Typography>
              {subValue !== undefined && subLabel && (
                <Typography variant="body2" color="text.secondary">
                  {subLabel}: <strong>{subValue}</strong>
                </Typography>
              )}
            </>
          )}
        </Stack>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: `${color}.lighter`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon sx={{ fontSize: 28, color: `${color}.main` }} />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

// ==============================|| EMPTY STATE COMPONENT ||============================== //

const EmptyState = ({ message }) => (
  <TableRow>
    <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </TableCell>
  </TableRow>
);

// ==============================|| LOADING STATE COMPONENT ||============================== //

const LoadingState = ({ colSpan = 5 }) => (
  <TableRow>
    <TableCell colSpan={colSpan} align="center" sx={{ py: 4 }}>
      <CircularProgress size={32} />
    </TableCell>
  </TableRow>
);

// ==============================|| MAIN DASHBOARD ||============================== //

export default function OperationalDashboard() {
  const navigate = useNavigate();

  // Fetch data using existing hooks
  const { 
    data: claimsData, 
    loading: claimsLoading, 
    error: claimsError,
    refresh: refreshClaims 
  } = useClaimsList({ page: 0, size: 10 });

  const { 
    data: visitsData, 
    loading: visitsLoading, 
    error: visitsError,
    refresh: refreshVisits 
  } = useVisitsList({ page: 1, size: 10 });

  const { 
    data: preApprovalsData, 
    loading: preApprovalsLoading, 
    error: preApprovalsError,
    refresh: refreshPreApprovals 
  } = usePreApprovalsList({ page: 1, size: 10 });

  // Safe data extraction with defensive coding
  const claims = Array.isArray(claimsData?.content) ? claimsData.content : [];
  const visits = Array.isArray(visitsData?.items) ? visitsData.items : [];
  const preApprovals = Array.isArray(preApprovalsData?.items) ? preApprovalsData.items : [];

  // Calculate summary statistics defensively
  const totalClaims = claimsData?.totalElements ?? claims.length ?? 0;
  const pendingClaims = claims.filter(c => 
    c?.status === 'PENDING' || c?.status === 'PENDING_REVIEW'
  ).length;

  const totalPreApprovals = preApprovalsData?.total ?? preApprovals.length ?? 0;
  const pendingPreApprovals = preApprovals.filter(p => 
    p?.status === 'PENDING' || p?.status === 'PENDING_REVIEW'
  ).length;

  const totalVisits = visitsData?.total ?? visits.length ?? 0;
  // Calculate today's visits (if visitDate exists)
  const today = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter(v => v?.visitDate?.startsWith?.(today)).length;

  // Calculate items requiring action
  const actionRequired = pendingClaims + pendingPreApprovals;

  // Refresh all data
  const handleRefreshAll = useCallback(() => {
    refreshClaims();
    refreshVisits();
    refreshPreApprovals();
  }, [refreshClaims, refreshVisits, refreshPreApprovals]);

  // Navigation handlers
  const handleClaimClick = (id) => {
    if (id) navigate(`/claims/${id}`);
  };

  const handlePreApprovalClick = (id) => {
    if (id) navigate(`/pre-approvals/${id}`);
  };

  const handleVisitClick = (id) => {
    if (id) navigate(`/visits/${id}`);
  };

  // Format date safely
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('ar-SA');
    } catch {
      return '—';
    }
  };

  // Get safe display value
  const safeValue = (value, fallback = '—') => value ?? fallback;

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      {/* Page Header */}
      <Grid item xs={12}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4" fontWeight={600}>
            لوحة التقارير التشغيلية
          </Typography>
          <Tooltip title="تحديث البيانات">
            <IconButton onClick={handleRefreshAll} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Grid>

      {/* Summary Cards Row */}
      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="المطالبات"
          mainValue={totalClaims}
          subValue={pendingClaims}
          subLabel="قيد المراجعة"
          icon={ReceiptIcon}
          color="primary"
          loading={claimsLoading}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="الموافقات المسبقة"
          mainValue={totalPreApprovals}
          subValue={pendingPreApprovals}
          subLabel="بانتظار المراجعة"
          icon={AssignmentIcon}
          color="info"
          loading={preApprovalsLoading}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="الزيارات"
          mainValue={totalVisits}
          subValue={todayVisits}
          subLabel="اليوم"
          icon={LocalHospitalIcon}
          color="success"
          loading={visitsLoading}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="إجراءات مطلوبة"
          mainValue={actionRequired}
          subLabel=""
          icon={WarningAmberIcon}
          color={actionRequired > 0 ? 'warning' : 'success'}
          loading={claimsLoading || preApprovalsLoading}
        />
      </Grid>

      {/* Claims Table */}
      <Grid item xs={12}>
        <MainCard
          title="المطالبات المعلقة"
          secondary={
            <Typography variant="body2" color="text.secondary">
              آخر 10 مطالبات
            </Typography>
          }
        >
          {claimsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              فشل تحميل المطالبات
            </Alert>
          )}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>رقم المطالبة</TableCell>
                  <TableCell>المؤمَّن عليه</TableCell>
                  <TableCell>مقدم الخدمة الصحية</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>تاريخ التقديم</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claimsLoading ? (
                  <LoadingState colSpan={5} />
                ) : claims.length === 0 ? (
                  <EmptyState message="لا توجد مطالبات معلقة" />
                ) : (
                  claims.slice(0, 10).map((claim) => (
                    <TableRow
                      key={claim?.id ?? Math.random()}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleClaimClick(claim?.id)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {safeValue(claim?.claimNumber)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {safeValue(claim?.memberName || claim?.member?.name)}
                      </TableCell>
                      <TableCell>
                        {safeValue(claim?.providerName || claim?.provider?.name)}
                      </TableCell>
                      <TableCell>
                        <CardStatusBadge
                          status={CLAIM_STATUS_MAP[claim?.status] || 'PENDING'}
                          size="small"
                          variant="chip"
                        />
                      </TableCell>
                      <TableCell>
                        {formatDate(claim?.submissionDate || claim?.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>

      {/* Pre-Approvals Table */}
      <Grid item xs={12}>
        <MainCard
          title="الموافقات المسبقة المعلقة"
          secondary={
            <Typography variant="body2" color="text.secondary">
              آخر 10 طلبات
            </Typography>
          }
        >
          {preApprovalsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              فشل تحميل الموافقات المسبقة
            </Alert>
          )}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>رقم الطلب</TableCell>
                  <TableCell>المؤمَّن عليه</TableCell>
                  <TableCell>نوع الإجراء</TableCell>
                  <TableCell>الأولوية</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>تاريخ الطلب</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {preApprovalsLoading ? (
                  <LoadingState colSpan={6} />
                ) : preApprovals.length === 0 ? (
                  <EmptyState message="لا توجد موافقات مسبقة معلقة" />
                ) : (
                  preApprovals.slice(0, 10).map((pa) => (
                    <TableRow
                      key={pa?.id ?? Math.random()}
                      hover
                      sx={{ 
                        cursor: 'pointer',
                        bgcolor: (pa?.priority === 'URGENT' || pa?.priority === 'EMERGENCY') 
                          ? 'warning.lighter' 
                          : 'inherit'
                      }}
                      onClick={() => handlePreApprovalClick(pa?.id)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {safeValue(pa?.requestNumber || pa?.id)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {safeValue(pa?.memberName || pa?.member?.name)}
                      </TableCell>
                      <TableCell>
                        {safeValue(pa?.procedureType || pa?.serviceType)}
                      </TableCell>
                      <TableCell>
                        <PriorityBadge
                          priority={pa?.priority || 'ROUTINE'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <CardStatusBadge
                          status={PREAPPROVAL_STATUS_MAP[pa?.status] || 'PENDING'}
                          size="small"
                          variant="chip"
                        />
                      </TableCell>
                      <TableCell>
                        {formatDate(pa?.requestDate || pa?.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>

      {/* Recent Visits Table */}
      <Grid item xs={12}>
        <MainCard
          title="الزيارات الأخيرة"
          secondary={
            <Typography variant="body2" color="text.secondary">
              آخر 10 زيارات
            </Typography>
          }
        >
          {visitsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              فشل تحميل الزيارات
            </Alert>
          )}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>رقم الزيارة</TableCell>
                  <TableCell>المؤمَّن عليه</TableCell>
                  <TableCell>مقدم الخدمة</TableCell>
                  <TableCell>نوع الزيارة</TableCell>
                  <TableCell>التاريخ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visitsLoading ? (
                  <LoadingState colSpan={5} />
                ) : visits.length === 0 ? (
                  <EmptyState message="لا توجد زيارات مسجلة" />
                ) : (
                  visits.slice(0, 10).map((visit) => (
                    <TableRow
                      key={visit?.id ?? Math.random()}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleVisitClick(visit?.id)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {safeValue(visit?.visitNumber || visit?.id)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {safeValue(visit?.memberName || visit?.member?.name)}
                      </TableCell>
                      <TableCell>
                        {safeValue(visit?.providerName || visit?.provider?.name)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={VISIT_TYPE_LABELS[visit?.visitType] || safeValue(visit?.visitType)}
                          size="small"
                          color={visit?.visitType === 'EMERGENCY' ? 'error' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {formatDate(visit?.visitDate)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>
    </Grid>
  );
}
