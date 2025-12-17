import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { useClaimDetails, useUpdateClaim } from 'hooks/useClaims';

const STATUS_OPTIONS = [
  { value: 'PENDING_REVIEW', label: 'قيد المراجعة' },
  { value: 'PREAPPROVED', label: 'موافقة مسبقة' },
  { value: 'APPROVED', label: 'موافق عليه' },
  { value: 'PARTIALLY_APPROVED', label: 'موافق جزئياً' },
  { value: 'REJECTED', label: 'مرفوض' },
  { value: 'RETURNED_FOR_INFO', label: 'إعادة للاستكمال' },
  { value: 'CANCELLED', label: 'ملغي' }
];

const ClaimEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { claim, loading } = useClaimDetails(id);
  const { update, updating } = useUpdateClaim();

  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (claim) {
      setFormData({
        providerName: claim.providerName || '',
        diagnosis: claim.diagnosis || '',
        visitDate: claim.visitDate || '',
        requestedAmount: claim.requestedAmount || '',
        status: claim.status || 'PENDING_REVIEW',
        approvedAmount: claim.approvedAmount || '',
        reviewerComment: claim.reviewerComment || ''
      });
    }
  }, [claim]);

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await update(id, formData);
    if (result.success) {
      navigate('/claims');
    }
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <MainCard
      title="تعديل المطالبة"
      secondary={
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/claims')}
        >
          عودة
        </Button>
      }
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="مقدم الخدمة"
              value={formData.providerName || ''}
              onChange={handleChange('providerName')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="التشخيص"
              value={formData.diagnosis || ''}
              onChange={handleChange('diagnosis')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="تاريخ الزيارة"
              value={formData.visitDate || ''}
              onChange={handleChange('visitDate')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="المبلغ المطلوب"
              value={formData.requestedAmount || ''}
              onChange={handleChange('requestedAmount')}
              inputProps={{ step: '0.01' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="الحالة"
              value={formData.status || 'PENDING_REVIEW'}
              onChange={handleChange('status')}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="المبلغ الموافق عليه"
              value={formData.approvedAmount || ''}
              onChange={handleChange('approvedAmount')}
              inputProps={{ step: '0.01' }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="تعليق المراجع"
              value={formData.reviewerComment || ''}
              onChange={handleChange('reviewerComment')}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/claims')}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={updating}
              >
                حفظ التغييرات
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  );
};

export default ClaimEdit;
