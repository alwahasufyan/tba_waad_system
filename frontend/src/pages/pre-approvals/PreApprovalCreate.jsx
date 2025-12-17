import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Stack, Alert, Autocomplete } from '@mui/material';
import { Save as SaveIcon, ArrowBack } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { useCreatePreApproval } from 'hooks/usePreApprovals';
import { membersService, insuranceCompaniesService } from 'services/api';

const PreApprovalCreate = () => {
  const navigate = useNavigate();
  const { create, creating, error } = useCreatePreApproval();

  const [members, setMembers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [packages, setPackages] = useState([]);

  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);

  const [formData, setFormData] = useState({
    memberId: null,
    insuranceCompanyId: '',
    insurancePolicyId: '',
    benefitPackageId: '',
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
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (formData.insuranceCompanyId) {
      fetchPolicies(formData.insuranceCompanyId);
    } else {
      setPolicies([]);
      setPackages([]);
    }
  }, [formData.insuranceCompanyId]);

  useEffect(() => {
    if (formData.insurancePolicyId) {
      fetchPackages(formData.insurancePolicyId);
    } else {
      setPackages([]);
    }
  }, [formData.insurancePolicyId]);

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

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const result = await insuranceCompaniesService.getAll({ page: 1, size: 1000 });
      setCompanies(result.items || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchPolicies = async (companyId) => {
    try {
      setLoadingPolicies(true);
      const result = await getInsurancePolicies({ page: 1, size: 1000, insuranceCompanyId: companyId });
      setPolicies(result.items || []);
    } catch (err) {
      console.error('Error fetching policies:', err);
    } finally {
      setLoadingPolicies(false);
    }
  };

  const fetchPackages = async (policyId) => {
    try {
      setLoadingPackages(true);
      const result = await getBenefitPackages(policyId);
      setPackages(result || []);
    } catch (err) {
      console.error('Error fetching packages:', err);
    } finally {
      setLoadingPackages(false);
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
      errors.memberId = 'العضو مطلوب';
    }

    if (!formData.insuranceCompanyId) {
      errors.insuranceCompanyId = 'شركة التأمين مطلوبة';
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
      const payload = {
        memberId: formData.memberId,
        insuranceCompanyId: formData.insuranceCompanyId,
        insurancePolicyId: formData.insurancePolicyId || null,
        benefitPackageId: formData.benefitPackageId || null,
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
    <MainCard title="طلب موافقة مسبقة جديد">
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
                <TextField {...params} label="العضو" required error={!!formErrors.memberId} helperText={formErrors.memberId} />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!formErrors.insuranceCompanyId} required>
              <InputLabel>شركة التأمين</InputLabel>
              <Select name="insuranceCompanyId" value={formData.insuranceCompanyId} onChange={handleChange} label="شركة التأمين">
                {loadingCompanies && (
                  <MenuItem disabled>
                    <em>جاري التحميل...</em>
                  </MenuItem>
                )}
                {!loadingCompanies && companies.length === 0 && (
                  <MenuItem disabled>
                    <em>لا توجد شركات تأمين</em>
                  </MenuItem>
                )}
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name} ({company.code})
                  </MenuItem>
                ))}
              </Select>
              {formErrors.insuranceCompanyId && (
                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>{formErrors.insuranceCompanyId}</Box>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>السياسة التأمينية (اختياري)</InputLabel>
              <Select
                name="insurancePolicyId"
                value={formData.insurancePolicyId}
                onChange={handleChange}
                label="السياسة التأمينية (اختياري)"
              >
                <MenuItem value="">
                  <em>بدون</em>
                </MenuItem>
                {loadingPolicies && (
                  <MenuItem disabled>
                    <em>جاري التحميل...</em>
                  </MenuItem>
                )}
                {policies.map((policy) => (
                  <MenuItem key={policy.id} value={policy.id}>
                    {policy.name} ({policy.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>الباقة الطبية (اختياري)</InputLabel>
              <Select
                name="benefitPackageId"
                value={formData.benefitPackageId}
                onChange={handleChange}
                label="الباقة الطبية (اختياري)"
                disabled={!formData.insurancePolicyId}
              >
                <MenuItem value="">
                  <em>بدون</em>
                </MenuItem>
                {loadingPackages && (
                  <MenuItem disabled>
                    <em>جاري التحميل...</em>
                  </MenuItem>
                )}
                {packages.map((pkg) => (
                  <MenuItem key={pkg.id} value={pkg.id}>
                    {pkg.name} ({pkg.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

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
  );
};

export default PreApprovalCreate;
