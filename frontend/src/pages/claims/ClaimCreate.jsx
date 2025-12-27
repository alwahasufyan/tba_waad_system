import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem
} from '@mui/material';
import { ArrowBack, Save, Receipt as ClaimIcon } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import { useCreateClaim } from 'hooks/useClaims';

const ClaimCreate = () => {
  const navigate = useNavigate();
  const { create, creating } = useCreateClaim();

  const [formData, setFormData] = useState({
    memberId: '',
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
    <>
      <ModernPageHeader
        title="إضافة مطالبة جديدة"
        subtitle="إنشاء سجل مطالبة تأمين جديدة"
        icon={ClaimIcon}
        breadcrumbs={[
          { label: 'المطالبات', path: '/claims' },
          { label: 'إضافة جديد' }
        ]}
        actions={
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/claims')}>
            عودة
          </Button>
        }
      />

    <MainCard>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="رقم المؤمَّن عليه"
              value={formData.memberId}
              onChange={handleChange('memberId')}
              type="number"
            />
          </Grid>
          {/* NOTE: insuranceCompanyId field REMOVED - No InsuranceCompany concept in backend */}
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
    </>
  );
};

export default ClaimCreate;
