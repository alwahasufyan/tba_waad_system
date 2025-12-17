import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon, ArrowBack } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { usePreApprovalDetails, useUpdatePreApproval } from 'hooks/usePreApprovals';
import { membersService, insuranceCompaniesService } from 'services/api';

const PreApprovalEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { preApproval, loading, error: fetchError } = usePreApprovalDetails(id);
  const { update, updating, error: updateError } = useUpdatePreApproval();

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
    status: 'PENDING',
    reviewerComment: '',
    approvedAmount: '',
    attachmentsCount: 0
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchMembers();
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (preApproval) {
      setFormData({
        memberId: preApproval.member?.id || null,
        insuranceCompanyId: preApproval.insuranceCompany?.id || '',
        insurancePolicyId: preApproval.insurancePolicy?.id || '',
        benefitPackageId: preApproval.benefitPackage?.id || '',
        providerName: preApproval.providerName || '',
        doctorName: preApproval.doctorName || '',
        diagnosis: preApproval.diagnosis || '',
        procedure: preApproval.procedure || '',
        requestedAmount: preApproval.requestedAmount || '',
        status: preApproval.status || 'PENDING',
        reviewerComment: preApproval.reviewerComment || '',
        approvedAmount: preApproval.approvedAmount || '',
        attachmentsCount: preApproval.attachmentsCount || 0
      });

      if (preApproval.insuranceCompany?.id) {
        fetchPolicies(preApproval.insuranceCompany.id);
      }
      if (preApproval.insurancePolicy?.id) {
        fetchPackages(preApproval.insurancePolicy.id);
      }
    }
  }, [preApproval]);

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

    if (!formData.providerName?.trim()) {
      errors.providerName = 'اسم مقدم الخدمة مطلوب';
    }

    if (!formData.diagnosis?.trim()) {
      errors.diagnosis = 'التشخيص مطلوب';
    }

    if (!formData.requestedAmount || isNaN(Number(formData.requestedAmount)) || Number(formData.requestedAmount) <= 0) {
      errors.requestedAmount = 'المبلغ المطلوب يجب أن يكون أكبر من صفر';
    }

    if (formData.status === 'APPROVED') {
      if (!formData.approvedAmount || isNaN(Number(formData.approvedAmount)) || Number(formData.approvedAmount) <= 0) {
        errors.approvedAmount = 'المبلغ الموافق عليه مطلوب ويجب أن يكون أكبر من صفر عند الموافقة';
      }
    }

    if (formData.status === 'REJECTED') {
      if (!formData.reviewerComment?.trim()) {
        errors.reviewerComment = 'تعليق المراجع مطلوب عند الرفض';
      }
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
        providerName: formData.providerName.trim(),
        doctorName: formData.doctorName?.trim() || null,
        diagnosis: formData.diagnosis.trim(),
        procedure: formData.procedure?.trim() || null,
        requestedAmount: Number(formData.requestedAmount),
        status: formData.status,
        reviewerComment: formData.reviewerComment?.trim() || null,
        approvedAmount: formData.approvedAmount ? Number(formData.approvedAmount) : null,
        insurancePolicyId: formData.insurancePolicyId || null,
        benefitPackageId: formData.benefitPackageId || null,
        attachmentsCount: Number(formData.attachmentsCount) || 0
      };

      await update(id, payload);
      navigate('/pre-approvals');
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleCancel = () => {
    navigate('/pre-approvals');
  };

  if (loading) {
    return (
      <MainCard>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (fetchError) {
    return (
      <MainCard>
        <Alert severity="error">{fetchError}</Alert>
      </MainCard>
    );
  }

  return (
    <MainCard title="تعديل طلب الموافقة المسبقة">
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {updateError && (
            <Grid item xs={12}>
              <Alert severity="error">{updateError}</Alert>
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <Autocomplete
              options={members}
              getOptionLabel={(option) => `${option.fullNameArabic} (${option.civilId})`}
              loading={loadingMembers}
              value={members.find((m) => m.id === formData.memberId) || null}
              onChange={handleMemberChange}
              onInputChange={(e, value) => {
                if (value) fetchMembers(value);
              }}
              disabled
              renderInput={(params) => <TextField {...params} label="العضو" disabled />}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled>
              <InputLabel>شركة التأمين</InputLabel>
              <Select name="insuranceCompanyId" value={formData.insuranceCompanyId} label="شركة التأمين">
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name} ({company.code})
                  </MenuItem>
                ))}
              </Select>
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

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>الحالة</InputLabel>
              <Select name="status" value={formData.status} onChange={handleChange} label="الحالة">
                <MenuItem value="PENDING">قيد المراجعة</MenuItem>
                <MenuItem value="APPROVED">موافق عليه</MenuItem>
                <MenuItem value="REJECTED">مرفوض</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="المبلغ الموافق عليه"
              name="approvedAmount"
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              value={formData.approvedAmount}
              onChange={handleChange}
              error={!!formErrors.approvedAmount}
              helperText={formErrors.approvedAmount}
              disabled={formData.status !== 'APPROVED'}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="تعليق المراجع"
              name="reviewerComment"
              value={formData.reviewerComment}
              onChange={handleChange}
              error={!!formErrors.reviewerComment}
              helperText={formErrors.reviewerComment}
              multiline
              rows={4}
              required={formData.status === 'REJECTED'}
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={handleCancel}>
                إلغاء
              </Button>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={updating}>
                {updating ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </MainCard>
  );
};

export default PreApprovalEdit;
