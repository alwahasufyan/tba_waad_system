import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Stack, Alert, Autocomplete } from '@mui/material';
import { Save as SaveIcon, ArrowBack, AssignmentTurnedIn as PreApprovalIcon } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { ModernPageHeader } from 'components/tba';
import { useCreatePreApproval } from 'hooks/usePreApprovals';
import { membersService } from 'services/api';

const PreApprovalCreate = () => {
  const navigate = useNavigate();
  const { create, creating, error } = useCreatePreApproval();

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // NOTE: insurancePolicyId REMOVED - No Policy concept in backend. Use BenefitPolicy only.
  const [formData, setFormData] = useState({
    memberId: null,
    providerName: '',
    doctorName: '',
    diagnosis: '',
    procedure: '',
    requestedAmount: '',
    attachmentsCount: 0
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async (searchTerm = '') => {
    try {
      setLoadingMembers(true);
      const result = await membersService.getAll({ page: 1, size: 100, search: searchTerm });
      setMembers(result.items || []);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const handleMemberChange = (event, newValue) => {
    setFormData({ ...formData, memberId: newValue?.id || null });
    if (formErrors.memberId) {
      setFormErrors({ ...formErrors, memberId: null });
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.memberId) {
      errors.memberId = 'المؤمَّن عليه مطلوب';
    }

    if (!formData.providerName?.trim()) {
      errors.providerName = 'اسم مقدم الخدمة مطلوب';
    }

    if (!formData.diagnosis?.trim()) {
      errors.diagnosis = 'التشخيص مطلوب';
    }

    if (!formData.requestedAmount || isNaN(Number(formData.requestedAmount)) || Number(formData.requestedAmount) <= 0) {
      errors.requestedAmount = 'المبلغ المطلوب يجب أن يكون أكبر من صفر';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      // NOTE: insurancePolicyId and benefitPackageId REMOVED from payload
      const payload = {
        memberId: formData.memberId,
        providerName: formData.providerName.trim(),
        doctorName: formData.doctorName?.trim() || null,
        diagnosis: formData.diagnosis.trim(),
        procedure: formData.procedure?.trim() || null,
        requestedAmount: Number(formData.requestedAmount),
        attachmentsCount: Number(formData.attachmentsCount) || 0
      };

      await create(payload);
      navigate('/pre-approvals');
    } catch (err) {
      console.error('Create error:', err);
    }
  };

  const handleCancel = () => {
    navigate('/pre-approvals');
  };

  return (
    <>
    <ModernPageHeader
      title="طلب موافقة مسبقة جديد"
      icon={PreApprovalIcon}
      breadcrumbs={[
        { label: 'الرئيسية', href: '/' },
        { label: 'الموافقات المسبقة', href: '/pre-approvals' },
        { label: 'طلب جديد' }
      ]}
    />
    <MainCard>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <Autocomplete
              options={members}
              getOptionLabel={(option) => `${option.fullNameArabic} (${option.civilId})`}
              loading={loadingMembers}
              onChange={handleMemberChange}
              onInputChange={(e, value) => {
                if (value) fetchMembers(value);
              }}
              renderInput={(params) => (
                <TextField {...params} label="المؤمَّن عليه" required error={!!formErrors.memberId} helperText={formErrors.memberId} />
              )}
            />
          </Grid>

          {/* NOTE: Insurance Company & Policy fields REMOVED - No InsuranceCompany/Policy concept in backend */}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="اسم مقدم الخدمة (المستشفى/العيادة)"
              name="providerName"
              value={formData.providerName}
              onChange={handleChange}
              error={!!formErrors.providerName}
              helperText={formErrors.providerName}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="اسم الطبيب" name="doctorName" value={formData.doctorName} onChange={handleChange} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="التشخيص (ICD10)"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              error={!!formErrors.diagnosis}
              helperText={formErrors.diagnosis}
              multiline
              rows={3}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="الإجراء الطبي (CPT)"
              name="procedure"
              value={formData.procedure}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="المبلغ المطلوب"
              name="requestedAmount"
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              value={formData.requestedAmount}
              onChange={handleChange}
              error={!!formErrors.requestedAmount}
              helperText={formErrors.requestedAmount}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="عدد المرفقات"
              name="attachmentsCount"
              type="number"
              inputProps={{ min: 0 }}
              value={formData.attachmentsCount}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={handleCancel}>
                إلغاء
              </Button>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={creating}>
                {creating ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </MainCard>
    </>
  );
};

export default PreApprovalCreate;
