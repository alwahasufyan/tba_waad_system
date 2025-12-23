import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Stack
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { ModernPageHeader } from 'components/tba';
import { DataGrid } from '@mui/x-data-grid';
import { claimsService } from 'services/api';

/**
 * Claims Inbox - صندوق عمل موظف المطالبات
 * 
 * يعرض المطالبات المعلقة (SUBMITTED | UNDER_REVIEW)
 * مع إمكانية الموافقة أو الرفض
 */
const ClaimsInbox = () => {
  const navigate = useNavigate();
  
  // State
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  
  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [costBreakdown, setCostBreakdown] = useState(null);
  
  // Form states
  const [approvedAmount, setApprovedAmount] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [useSystemCalculation, setUseSystemCalculation] = useState(true);
  
  // Error/Success states
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch pending claims
  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      const response = await claimsService.getPendingClaims({
        page: page + 1,
        size: pageSize,
        sortBy: 'createdAt',
        sortDir: 'asc'
      });
      setClaims(response.items || []);
      setTotalRows(response.total || 0);
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError('فشل في تحميل المطالبات');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  // Fetch cost breakdown when opening approve dialog
  const handleOpenApprove = async (claim) => {
    setSelectedClaim(claim);
    setApprovedAmount(claim.requestedAmount?.toString() || '');
    setApprovalNotes('');
    setUseSystemCalculation(true);
    
    try {
      const breakdown = await claimsService.getCostBreakdown(claim.id);
      setCostBreakdown(breakdown);
      // Pre-fill with system-calculated amount
      if (breakdown?.netProviderAmount) {
        setApprovedAmount(breakdown.netProviderAmount.toString());
      }
    } catch (err) {
      console.error('Error fetching cost breakdown:', err);
    }
    
    setApproveDialogOpen(true);
  };

  const handleOpenReject = (claim) => {
    setSelectedClaim(claim);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  // Approve claim
  const handleApprove = async () => {
    if (!selectedClaim) return;
    
    try {
      setLoading(true);
      await claimsService.approve(selectedClaim.id, {
        approvedAmount: useSystemCalculation ? null : parseFloat(approvedAmount),
        notes: approvalNotes,
        useSystemCalculation
      });
      
      setSuccess('تمت الموافقة على المطالبة بنجاح');
      setApproveDialogOpen(false);
      fetchClaims();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في الموافقة على المطالبة');
    } finally {
      setLoading(false);
    }
  };

  // Reject claim
  const handleReject = async () => {
    if (!selectedClaim || !rejectionReason.trim()) {
      setError('سبب الرفض مطلوب');
      return;
    }
    
    try {
      setLoading(true);
      await claimsService.reject(selectedClaim.id, {
        rejectionReason: rejectionReason.trim()
      });
      
      setSuccess('تم رفض المطالبة');
      setRejectDialogOpen(false);
      fetchClaims();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في رفض المطالبة');
    } finally {
      setLoading(false);
    }
  };

  // Status chip renderer
  const renderStatus = (status) => {
    const statusColors = {
      SUBMITTED: 'warning',
      UNDER_REVIEW: 'info',
      APPROVED: 'success',
      REJECTED: 'error',
      SETTLED: 'default'
    };
    
    const statusLabels = {
      SUBMITTED: 'مقدم',
      UNDER_REVIEW: 'قيد المراجعة',
      APPROVED: 'موافق عليه',
      REJECTED: 'مرفوض',
      SETTLED: 'تم التسوية'
    };
    
    return (
      <Chip 
        label={statusLabels[status] || status} 
        color={statusColors[status] || 'default'}
        size="small"
      />
    );
  };

  // DataGrid columns
  const columns = [
    { 
      field: 'id', 
      headerName: '#', 
      width: 70 
    },
    { 
      field: 'memberFullNameArabic', 
      headerName: 'اسم المؤمن عليه', 
      flex: 1,
      minWidth: 150
    },
    { 
      field: 'memberCivilId', 
      headerName: 'الرقم الوطني', 
      width: 130 
    },
    { 
      field: 'providerName', 
      headerName: 'مقدم الخدمة', 
      flex: 1,
      minWidth: 150
    },
    { 
      field: 'visitDate', 
      headerName: 'تاريخ الزيارة', 
      width: 120,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('ar-LY') : '-'
    },
    { 
      field: 'requestedAmount', 
      headerName: 'المبلغ المطلوب', 
      width: 130,
      valueFormatter: (params) => params.value ? `${params.value.toFixed(2)} د.ل` : '-'
    },
    { 
      field: 'status', 
      headerName: 'الحالة', 
      width: 130,
      renderCell: (params) => renderStatus(params.value)
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="عرض التفاصيل">
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => navigate(`/claims/${params.row.id}`)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="موافقة">
            <IconButton 
              size="small" 
              color="success"
              onClick={() => handleOpenApprove(params.row)}
            >
              <ApproveIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="رفض">
            <IconButton 
              size="small" 
              color="error"
              onClick={() => handleOpenReject(params.row)}
            >
              <RejectIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <>
      <ModernPageHeader
        title="صندوق المطالبات"
        subtitle="المطالبات المعلقة في انتظار المراجعة والموافقة"
        icon={ReportIcon}
        actions={
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={fetchClaims}
            disabled={loading}
          >
            تحديث
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <MainCard>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={claims}
            columns={columns}
            loading={loading}
            paginationMode="server"
            rowCount={totalRows}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            rowsPerPageOptions={[10, 20, 50]}
            disableSelectionOnClick
            localeText={{
              noRowsLabel: 'لا توجد مطالبات معلقة',
              MuiTablePagination: {
                labelRowsPerPage: 'عدد الصفوف:'
              }
            }}
          />
        </Box>
      </MainCard>

      {/* Approve Dialog */}
      <Dialog 
        open={approveDialogOpen} 
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>موافقة على المطالبة #{selectedClaim?.id}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Cost Breakdown */}
            {costBreakdown && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      تفصيل التكلفة (Financial Snapshot)
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">المطلوب</Typography>
                        <Typography variant="h6">
                          {costBreakdown.requestedAmount?.toFixed(2)} د.ل
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">تحمل المريض</Typography>
                        <Typography variant="h6" color="warning.main">
                          {costBreakdown.patientCoPay?.toFixed(2)} د.ل
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ({costBreakdown.coPayPercent}%)
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">المستحق للمستشفى</Typography>
                        <Typography variant="h6" color="success.main">
                          {costBreakdown.netProviderAmount?.toFixed(2)} د.ل
                        </Typography>
                      </Grid>
                    </Grid>
                    {costBreakdown.calculationsValid && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        ✓ الحسابات صحيحة: المطلوب = تحمل المريض + المستحق للمستشفى
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="المبلغ المعتمد"
                value={approvedAmount}
                onChange={(e) => {
                  setApprovedAmount(e.target.value);
                  setUseSystemCalculation(false);
                }}
                type="number"
                helperText={useSystemCalculation ? 'سيتم استخدام الحساب التلقائي' : 'مبلغ يدوي'}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ملاحظات (اختياري)"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>إلغاء</Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={handleApprove}
            startIcon={<ApproveIcon />}
          >
            موافقة
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog 
        open={rejectDialogOpen} 
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>رفض المطالبة #{selectedClaim?.id}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            required
            label="سبب الرفض (إلزامي)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            multiline
            rows={4}
            error={!rejectionReason.trim()}
            helperText="يرجى تحديد سبب الرفض بوضوح"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>إلغاء</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleReject}
            disabled={!rejectionReason.trim()}
            startIcon={<RejectIcon />}
          >
            رفض
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClaimsInbox;
