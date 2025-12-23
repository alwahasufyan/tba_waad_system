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
  Stack
} from '@mui/material';
import {
  Payment as SettleIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  AccountBalance as FinanceIcon
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { ModernPageHeader } from 'components/tba';
import { DataGrid } from '@mui/x-data-grid';
import { claimsService } from 'services/api';

/**
 * Settlement Inbox - صندوق التسويات
 * 
 * يعرض المطالبات الموافق عليها (APPROVED) والجاهزة للتسوية
 */
const SettlementInbox = () => {
  const navigate = useNavigate();
  
  // State
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  
  // Dialog state
  const [settleDialogOpen, setSettleDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  
  // Form states
  const [paymentReference, setPaymentReference] = useState('');
  const [settlementNotes, setSettlementNotes] = useState('');
  
  // Error/Success states
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Totals
  const [totals, setTotals] = useState({
    totalApproved: 0,
    totalCoPay: 0,
    totalNet: 0,
    count: 0
  });

  // Fetch approved claims
  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      const response = await claimsService.getApprovedClaims({
        page: page + 1,
        size: pageSize,
        sortBy: 'reviewedAt',
        sortDir: 'asc'
      });
      
      const items = response.items || [];
      setClaims(items);
      setTotalRows(response.total || 0);
      
      // Calculate totals
      const totalApproved = items.reduce((sum, c) => sum + (c.approvedAmount || 0), 0);
      const totalCoPay = items.reduce((sum, c) => sum + (c.patientCoPay || 0), 0);
      const totalNet = items.reduce((sum, c) => sum + (c.netProviderAmount || c.approvedAmount || 0), 0);
      
      setTotals({
        totalApproved,
        totalCoPay,
        totalNet,
        count: items.length
      });
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

  const handleOpenSettle = (claim) => {
    setSelectedClaim(claim);
    setPaymentReference('');
    setSettlementNotes('');
    setSettleDialogOpen(true);
  };

  // Settle claim
  const handleSettle = async () => {
    if (!selectedClaim || !paymentReference.trim()) {
      setError('رقم مرجع الدفع مطلوب');
      return;
    }
    
    try {
      setLoading(true);
      await claimsService.settle(selectedClaim.id, {
        paymentReference: paymentReference.trim(),
        notes: settlementNotes
      });
      
      setSuccess('تمت تسوية المطالبة بنجاح');
      setSettleDialogOpen(false);
      fetchClaims();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في تسوية المطالبة');
    } finally {
      setLoading(false);
    }
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
      headerName: 'المطلوب', 
      width: 120,
      valueFormatter: (params) => params.value ? `${params.value.toFixed(2)}` : '-'
    },
    { 
      field: 'patientCoPay', 
      headerName: 'تحمل المريض', 
      width: 120,
      valueFormatter: (params) => params.value ? `${params.value.toFixed(2)}` : '-',
      cellClassName: 'text-warning'
    },
    { 
      field: 'netProviderAmount', 
      headerName: 'المستحق', 
      width: 120,
      valueGetter: (params) => params.row.netProviderAmount || params.row.approvedAmount,
      valueFormatter: (params) => params.value ? `${params.value.toFixed(2)}` : '-',
      cellClassName: 'text-success'
    },
    { 
      field: 'reviewedAt', 
      headerName: 'تاريخ الموافقة', 
      width: 130,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('ar-LY') : '-'
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 150,
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
          <Tooltip title="تسوية">
            <IconButton 
              size="small" 
              color="success"
              onClick={() => handleOpenSettle(params.row)}
            >
              <SettleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <>
      <ModernPageHeader
        title="صندوق التسويات"
        subtitle="المطالبات الموافق عليها والجاهزة للدفع"
        icon={FinanceIcon}
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

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary">عدد المطالبات</Typography>
              <Typography variant="h4">{totals.count}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary">إجمالي المعتمد</Typography>
              <Typography variant="h4">{totals.totalApproved.toFixed(2)} د.ل</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary">إجمالي تحمل المرضى</Typography>
              <Typography variant="h4" color="warning.main">{totals.totalCoPay.toFixed(2)} د.ل</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary">صافي المستحق للدفع</Typography>
              <Typography variant="h4" color="success.main">{totals.totalNet.toFixed(2)} د.ل</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <MainCard>
        <Box sx={{ height: 500, width: '100%' }}>
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
              noRowsLabel: 'لا توجد مطالبات جاهزة للتسوية',
              MuiTablePagination: {
                labelRowsPerPage: 'عدد الصفوف:'
              }
            }}
          />
        </Box>
      </MainCard>

      {/* Settle Dialog */}
      <Dialog 
        open={settleDialogOpen} 
        onClose={() => setSettleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>تسوية المطالبة #{selectedClaim?.id}</DialogTitle>
        <DialogContent>
          <Card variant="outlined" sx={{ mb: 3, mt: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">المؤمن عليه</Typography>
                  <Typography variant="subtitle1">{selectedClaim?.memberFullNameArabic}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">مقدم الخدمة</Typography>
                  <Typography variant="subtitle1">{selectedClaim?.providerName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">المبلغ المطلوب</Typography>
                  <Typography variant="subtitle1">{selectedClaim?.requestedAmount?.toFixed(2)} د.ل</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">المبلغ المستحق للدفع</Typography>
                  <Typography variant="h6" color="success.main">
                    {(selectedClaim?.netProviderAmount || selectedClaim?.approvedAmount)?.toFixed(2)} د.ل
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <TextField
            fullWidth
            required
            label="رقم مرجع الدفع"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            error={!paymentReference.trim()}
            helperText="رقم الحوالة أو الشيك"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="ملاحظات (اختياري)"
            value={settlementNotes}
            onChange={(e) => setSettlementNotes(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettleDialogOpen(false)}>إلغاء</Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={handleSettle}
            disabled={!paymentReference.trim()}
            startIcon={<SettleIcon />}
          >
            تأكيد التسوية
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SettlementInbox;
