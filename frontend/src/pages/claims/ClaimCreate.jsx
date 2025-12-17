import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { useCreateClaim } from 'hooks/useClaims';

const ClaimCreate = () => {
  const navigate = useNavigate();
  const { create, creating } = useCreateClaim();

  const [formData, setFormData] = useState({
    memberId: '',
    insuranceCompanyId: '',
    providerName: '',
    diagnosis: '',
    visitDate: new Date().toISOString().split('T')[0],
    requestedAmount: ''
  });

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await create(formData);
    if (result.success) {
      navigate('/claims');
    }
  };

  return (
    <MainCard
      title="إضافة مطالبة جديدة"
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
              required
              label="رقم العضو"
              value={formData.memberId}
              onChange={handleChange('memberId')}
              type="number"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="رقم شركة التأمين"
              value={formData.insuranceCompanyId}
              onChange={handleChange('insuranceCompanyId')}
              type="number"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="مقدم الخدمة"
              value={formData.providerName}
              onChange={handleChange('providerName')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="التشخيص"
              value={formData.diagnosis}
              onChange={handleChange('diagnosis')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              type="date"
              label="تاريخ الزيارة"
              value={formData.visitDate}
              onChange={handleChange('visitDate')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              type="number"
              label="المبلغ المطلوب"
              value={formData.requestedAmount}
              onChange={handleChange('requestedAmount')}
              inputProps={{ step: '0.01', min: '0' }}
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
                disabled={creating}
              >
                حفظ
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  );
};

export default ClaimCreate;
