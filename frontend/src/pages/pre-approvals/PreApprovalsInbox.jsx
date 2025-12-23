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
  Stack,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Assignment as PreApprovalIcon,
  MedicalServices as MedicalIcon
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { ModernPageHeader } from 'components/tba';
import { DataGrid } from '@mui/x-data-grid';
import { preApprovalsService } from 'services/api';

/**
 * Pre-Approvals Inbox - صندوق الموافقات المسبقة
 * 
 * يعرض طلبات الموافقة المسبقة المعلقة (PENDING) ويتيح الموافقة أو الرفض
 */
const PreApprovalsInbox = () => {
  const navigate = useNavigate();
  
  // State
  const [preApprovals, setPreApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  
  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedPreApproval, setSelectedPreApproval] = useState(null);
  
  // Form states
  const [approvedAmount, setApprovedAmount] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Error/Success states
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch pending pre-approvals
  const fetchPreApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await preApprovalsService.getPending({
        page: page + 1,
        size: pageSize,
        sortBy: 'createdAt',
        sortDir: 'asc' // FIFO - الأقدم أولاً
      });
      setPreApprovals(response.items || []);
      setTotalRows(response.total || 0);
    } catch (err) {
      console.error('Error fetching pre-approvals:', err);
      setError('فشل في تحميل طلبات الموافقة المسبقة');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchPreApprovals();
  }, [fetchPreApprovals]);

  // Open approve dialog
  const handleOpenApprove = (preApproval) => {
    setSelectedPreApproval(preApproval);
    setApprovedAmount(preApproval.requestedAmount?.toString() || '');
    setApprovalNotes('');
    setApproveDialogOpen(true);
  };

  // Open reject dialog
  const handleOpenReject = (preApproval) => {
    setSelectedPreApproval(preApproval);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  // Approve pre-approval
  const handleApprove = async () => {
    if (!selectedPreApproval) return;
    
    try {
      setLoading(true);
      await preApprovalsService.approve(selectedPreApproval.id, {
        approvedAmount: parseFloat(approvedAmount) || selectedPreApproval.requestedAmount,
        notes: approvalNotes
      });
      
      setSuccess('تمت الموافقة على الطلب بنجاح');
      setApproveDialogOpen(false);
      fetchPreApprovals();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في الموافقة على الطلب');
    } finally {
      setLoading(false);
    }
  };

  // Reject pre-approval
  const handleReject = async () => {
    if (!selectedPreApproval || !rejectionReason.trim()) {
      setError('يجب إدخال سبب الرفض');
      return;
    }
    
    try {
      setLoading(true);
      await preApprovalsService.reject(selectedPreApproval.id, {
        reason: rejectionReason.trim()
      });
      
      setSuccess('تم رفض الطلب');
      setRejectDialogOpen(false);
      fetchPreApprovals();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في رفض الطلب');
    } finally {
      setLoading(false);
    }
  };

  // Status chip
  const getStatusChip = (status) => {
    const configs = {
      PENDING: { color: 'warning', label: 'قيد المراجعة' },
      APPROVED: { color: 'success', label: 'موافق عليه' },
      REJECTED: { color: 'error', label: 'مرفوض' },
      EXPIRED: { color: 'default', label: 'منتهي' },
      USED: { color: 'info', label: 'مستخدم' }
    };
    const config = configs[status] || configs.PENDING;
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  // Priority indicator based on urgency
  const getUrgencyBadge = (urgency) => {
    if (urgency === 'EMERGENCY') {
      return <Chip size="small" color="error" label="طارئ" variant="filled" />;
    }
    if (urgency === 'URGENT') {
      return <Chip size="small" color="warning" label="عاجل" variant="outlined" />;
    }
    return null;
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
      field: 'serviceType', 
      headerName: 'نوع الخدمة', 
      width: 130,
      valueGetter: (params) => params.row.serviceType || params.row.procedureName || '-'
    },
    { 
      field: 'requestedAmount', 
      headerName: 'المبلغ المطلوب', 
      width: 120,
      valueFormatter: (params) => params.value ? `${params.value.toFixed(2)}` : '-'
    },
    { 
      field: 'urgency', 
      headerName: 'الأولوية', 
      width: 100,
      renderCell: (params) => getUrgencyBadge(params.value)
    },
    { 
      field: 'createdAt', 
      headerName: 'تاريخ الطلب', 
      width: 130,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('ar-LY') : '-'
    },
    { 
      field: 'expiresAt', 
      headerName: 'تاريخ الانتهاء', 
      width: 130,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('ar-LY') : '-'
    },
    {
      field: 'status',
      headerName: 'الحالة',
      width: 120,
      renderCell: (params) => getStatusChip(params.value)
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
              onClick={() => navigate(`/pre-approvals/${params.row.id}`)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.status === 'PENDING' && (
            <>
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
            </>
          )}
        </Stack>
      )
    }
  ];

  return (
    <>
      <ModernPageHeader
        title="صندوق الموافقات المسبقة"
        subtitle="طلبات الموافقة المسبقة المعلقة"
        icon={PreApprovalIcon}
        actions={
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={fetchPreApprovals}
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
            rows={preApprovals}
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
              noRowsLabel: 'لا توجد طلبات موافقة مسبقة معلقة',
              MuiTablePagination: {
                labelRowsPerPage: 'عدد الصفوف:'
              }
            }}
            sx={{
              '& .MuiDataGrid-row': {
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }
            }}
          />
        </Box>
      </MainCard>

      {/* Approve Dialog */}
      <Dialog 
        open={approveDialogOpen} 
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ApproveIcon color="success" />
            <span>الموافقة على الطلب #{selectedPreApproval?.id}</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Card variant="outlined" sx={{ mb: 3, mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                تفاصيل الطلب
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>المؤمن عليه</TableCell>
                    <TableCell>{selectedPreApproval?.memberFullNameArabic}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>مقدم الخدمة</TableCell>
                    <TableCell>{selectedPreApproval?.providerName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>نوع الخدمة</TableCell>
                    <TableCell>
                      {selectedPreApproval?.serviceType || selectedPreApproval?.procedureName || '-'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>المبلغ المطلوب</TableCell>
                    <TableCell>
                      <Typography color="primary" fontWeight="bold">
                        {selectedPreApproval?.requestedAmount?.toFixed(2)} د.ل
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Divider sx={{ my: 2 }} />

          <TextField
            fullWidth
            type="number"
            label="المبلغ الموافق عليه"
            value={approvedAmount}
            onChange={(e) => setApprovedAmount(e.target.value)}
            InputProps={{
              endAdornment: <Typography color="textSecondary">د.ل</Typography>
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="ملاحظات (اختياري)"
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            multiline
            rows={2}
          />
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
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <RejectIcon color="error" />
            <span>رفض الطلب #{selectedPreApproval?.id}</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2, mt: 1 }}>
            يرجى إدخال سبب واضح للرفض. هذا السبب سيظهر للمستشفى/العيادة.
          </Alert>
          
          <TextField
            fullWidth
            required
            label="سبب الرفض"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            multiline
            rows={3}
            error={!rejectionReason.trim()}
            helperText="مطلوب - اشرح سبب الرفض بوضوح"
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
            تأكيد الرفض
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PreApprovalsInbox;
