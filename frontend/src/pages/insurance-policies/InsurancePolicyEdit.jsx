import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Grid, MenuItem, Stack, TextField, CircularProgress } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon, Description as DescriptionIcon } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import RBACGuard from 'components/tba/RBACGuard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = '/api/insurance-policies';
const INSURANCE_COMPANIES_API = '/api/insurance-companies';

const fetchInsurancePolicy = async (id) => {
  const { data } = await axios.get(`${API_BASE}/${id}`);
  return data;
};

const fetchInsuranceCompanies = async () => {
  const { data } = await axios.get(INSURANCE_COMPANIES_API);
  return data;
};

const updateInsurancePolicy = async ({ id, policyData }) => {
  const { data } = await axios.put(`${API_BASE}/${id}`, policyData);
  return data;
};

const InsurancePolicyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [policy, setPolicy] = useState(null);
  const [errors, setErrors] = useState({});

  const { data: policyData, isLoading } = useQuery({
    queryKey: ['insurance-policy', id],
    queryFn: () => fetchInsurancePolicy(id),
    enabled: !!id
  });

  const { data: companies } = useQuery({
    queryKey: ['insurance-companies'],
    queryFn: fetchInsuranceCompanies
  });

  const updateMutation = useMutation({
    mutationFn: updateInsurancePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries(['insurance-policies']);
      queryClient.invalidateQueries(['insurance-policy', id]);
      navigate('/insurance-policies');
    },
    onError: (err) => {
      console.error('Failed to update insurance policy', err);
      alert('حدث خطأ أثناء تحديث بوليصة التأمين');
    }
  });

  useEffect(() => {
    if (policyData) {
      setPolicy({
        policyNumber: policyData.policyNumber || '',
        insuranceCompanyId: policyData.insuranceCompanyId || '',
        startDate: policyData.startDate || '',
        endDate: policyData.endDate || '',
        coverageAmount: policyData.coverageAmount || '',
        premiumAmount: policyData.premiumAmount || '',
        status: policyData.status || 'PENDING',
        notes: policyData.notes || ''
      });
    }
  }, [policyData]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setPolicy((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!policy.policyNumber) newErrors.policyNumber = 'مطلوب';
    if (!policy.insuranceCompanyId) newErrors.insuranceCompanyId = 'مطلوب';
    if (!policy.startDate) newErrors.startDate = 'مطلوب';
    if (!policy.endDate) newErrors.endDate = 'مطلوب';
    if (policy.startDate && policy.endDate && new Date(policy.endDate) <= new Date(policy.startDate)) {
      newErrors.endDate = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    updateMutation.mutate({ id, policyData: policy });
  };

  if (isLoading || !policy) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <RBACGuard permission="INSURANCE_POLICY_UPDATE">
      <ModernPageHeader
        title="تعديل بوليصة التأمين"
        icon={DescriptionIcon}
        breadcrumbs={[
          { label: 'بوليصات التأمين', path: '/insurance-policies' },
          { label: `تعديل #${id}`, path: `/insurance-policies/edit/${id}` }
        ]}
        actions={
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/insurance-policies')} variant="outlined">
            رجوع
          </Button>
        }
      />

      <MainCard>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            {/* Policy Number */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="رقم البوليصة"
                value={policy.policyNumber}
                onChange={handleChange('policyNumber')}
                error={Boolean(errors.policyNumber)}
                helperText={errors.policyNumber}
              />
            </Grid>

            {/* Insurance Company */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                required
                label="شركة التأمين"
                value={policy.insuranceCompanyId}
                onChange={handleChange('insuranceCompanyId')}
                error={Boolean(errors.insuranceCompanyId)}
                helperText={errors.insuranceCompanyId}
              >
                {companies?.content?.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.nameAr || company.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Start Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="date"
                label="تاريخ البدء"
                value={policy.startDate}
                onChange={handleChange('startDate')}
                error={Boolean(errors.startDate)}
                helperText={errors.startDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* End Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="date"
                label="تاريخ الانتهاء"
                value={policy.endDate}
                onChange={handleChange('endDate')}
                error={Boolean(errors.endDate)}
                helperText={errors.endDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Coverage Amount */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="مبلغ التغطية"
                value={policy.coverageAmount}
                onChange={handleChange('coverageAmount')}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>

            {/* Premium Amount */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="مبلغ القسط"
                value={policy.premiumAmount}
                onChange={handleChange('premiumAmount')}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="الحالة" value={policy.status} onChange={handleChange('status')}>
                <MenuItem value="PENDING">قيد الانتظار</MenuItem>
                <MenuItem value="ACTIVE">نشط</MenuItem>
                <MenuItem value="INACTIVE">غير نشط</MenuItem>
                <MenuItem value="EXPIRED">منتهي</MenuItem>
              </TextField>
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={4} label="ملاحظات" value={policy.notes} onChange={handleChange('notes')} />
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate('/insurance-policies')}>
                  إلغاء
                </Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </MainCard>
    </RBACGuard>
  );
};

export default InsurancePolicyEdit;
