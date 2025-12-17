import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  PeopleAlt as PeopleAltIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import { getMemberById, updateMember } from 'services/api/members.service';
import axiosClient from 'utils/axios';
import { openSnackbar } from 'api/snackbar';

/**
 * Member Edit Page
 * Backend: MemberController.update → MemberUpdateDto
 */
const MemberEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form State (aligned with MemberUpdateDto)
  const [form, setForm] = useState({
    fullNameArabic: '',
    fullNameEnglish: '',
    cardNumber: '',
    birthDate: null,
    gender: '',
    maritalStatus: '',
    phone: '',
    email: '',
    address: '',
    nationality: '',
    policyNumber: '',
    benefitPackageId: '',
    insuranceCompanyId: '',
    employeeNumber: '',
    joinDate: null,
    occupation: '',
    status: '',
    startDate: null,
    endDate: null,
    cardStatus: '',
    blockedReason: '',
    notes: '',
    active: true,
    familyMembers: []
  });

  // Family Member Draft
  const [familyDraft, setFamilyDraft] = useState({
    fullNameArabic: '',
    fullNameEnglish: '',
    civilId: '',
    birthDate: null,
    gender: 'MALE',
    relationship: 'SON',
    active: true
  });

  // Selectors Data
  const [employers, setEmployers] = useState([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);
  const [benefitPackages, setBenefitPackages] = useState([]);

  // Loading & Errors
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState(null);

  // Load Member Data
  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError(null);

      // Load Member
      const member = await getMemberById(id);

      // Populate form
      setForm({
        fullNameArabic: member.fullNameArabic || '',
        fullNameEnglish: member.fullNameEnglish || '',
        cardNumber: member.cardNumber || '',
        birthDate: member.birthDate || null,
        gender: member.gender || '',
        maritalStatus: member.maritalStatus || '',
        phone: member.phone || '',
        email: member.email || '',
        address: member.address || '',
        nationality: member.nationality || '',
        policyNumber: member.policyNumber || '',
        benefitPackageId: member.benefitPackageId || '',
        insuranceCompanyId: member.insuranceCompanyId || '',
        employeeNumber: member.employeeNumber || '',
        joinDate: member.joinDate || null,
        occupation: member.occupation || '',
        status: member.status || '',
        startDate: member.startDate || null,
        endDate: member.endDate || null,
        cardStatus: member.cardStatus || '',
        blockedReason: member.blockedReason || '',
        notes: member.notes || '',
        active: member.active ?? true,
        familyMembers: member.familyMembers || []
      });

      // Load Selectors
      await loadSelectors();
    } catch (err) {
      console.error('[MemberEdit] Failed to load member:', err);
      setLoadError(err.response?.data?.message || 'Failed to load member');
    } finally {
      setLoading(false);
    }
  };

  const loadSelectors = async () => {
    try {
      const [employersRes, insuranceRes, packagesRes] = await Promise.all([
        axiosClient.get('/employers/selector'),
        axiosClient.get('/insurance-companies/selector'),
        axiosClient.get('/benefit-packages/selector')
      ]);

      setEmployers(employersRes.data?.data || []);
      setInsuranceCompanies(insuranceRes.data?.data || []);
      setBenefitPackages(packagesRes.data?.data || []);
    } catch (err) {
      console.error('[MemberEdit] Failed to load selectors:', err);
    }
  };

  // Field Handlers
  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleDateChange = (field) => (date) => {
    setForm((prev) => ({
      ...prev,
      [field]: date ? date.format('YYYY-MM-DD') : null
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Family Member Handlers
  const handleFamilyDraftChange = (field) => (event) => {
    setFamilyDraft((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleFamilyDateChange = (date) => {
    setFamilyDraft((prev) => ({
      ...prev,
      birthDate: date ? date.format('YYYY-MM-DD') : null
    }));
  };

  const addFamilyMember = () => {
    if (!familyDraft.fullNameArabic) {
      openSnackbar({ message: 'Full name (Arabic) is required', variant: 'error' });
      return;
    }
    if (!familyDraft.civilId) {
      openSnackbar({ message: 'Civil ID is required', variant: 'error' });
      return;
    }
    if (!familyDraft.birthDate) {
      openSnackbar({ message: 'Birth date is required', variant: 'error' });
      return;
    }

    setForm((prev) => ({
      ...prev,
      familyMembers: [...prev.familyMembers, { ...familyDraft }]
    }));

    setFamilyDraft({
      fullNameArabic: '',
      fullNameEnglish: '',
      civilId: '',
      birthDate: null,
      gender: 'MALE',
      relationship: 'SON',
      active: true
    });

    openSnackbar({ message: 'Family member added', variant: 'success' });
  };

  const removeFamilyMember = (index) => {
    setForm((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== index)
    }));
  };

  // Validation
  const validate = () => {
    const newErrors = {};

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      openSnackbar({ message: 'Please fix validation errors', variant: 'error' });
      return;
    }

    try {
      setSaving(true);

      // Prepare payload (MemberUpdateDto structure)
      const payload = {
        fullNameArabic: form.fullNameArabic || null,
        fullNameEnglish: form.fullNameEnglish || null,
        cardNumber: form.cardNumber || null,
        birthDate: form.birthDate || null,
        gender: form.gender || null,
        maritalStatus: form.maritalStatus || null,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        nationality: form.nationality || null,
        policyNumber: form.policyNumber || null,
        benefitPackageId: form.benefitPackageId || null,
        insuranceCompanyId: form.insuranceCompanyId || null,
        employeeNumber: form.employeeNumber || null,
        joinDate: form.joinDate || null,
        occupation: form.occupation || null,
        status: form.status || null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        cardStatus: form.cardStatus || null,
        blockedReason: form.blockedReason || null,
        notes: form.notes || null,
        active: form.active,
        familyMembers: form.familyMembers.map((fm) => ({
          id: fm.id || null,
          relationship: fm.relationship,
          fullNameArabic: fm.fullNameArabic,
          fullNameEnglish: fm.fullNameEnglish || null,
          civilId: fm.civilId,
          birthDate: fm.birthDate,
          gender: fm.gender,
          active: fm.active ?? true
        }))
      };

      await updateMember(id, payload);

      openSnackbar({ message: 'Member updated successfully', variant: 'success' });
      navigate('/members');
    } catch (err) {
      console.error('[MemberEdit] Submit failed:', err);
      openSnackbar({
        message: err.response?.data?.message || 'Failed to update member',
        variant: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return (
      <>
        <ModernPageHeader
          title="Edit Member"
          subtitle="Update member information"
          icon={PeopleAltIcon}
          breadcrumbs={[
            { label: 'Members', path: '/members' },
            { label: 'Edit Member', path: `/members/edit/${id}` }
          ]}
        />
        <MainCard>
          <Alert severity="error">{loadError}</Alert>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/members')}>
              Back to List
            </Button>
          </Box>
        </MainCard>
      </>
    );
  }

  return (
    <>
      <ModernPageHeader
        title="Edit Member"
        subtitle="Update member information"
        icon={PeopleAltIcon}
        breadcrumbs={[
          { label: 'Members', path: '/members' },
          { label: 'Edit Member', path: `/members/edit/${id}` }
        ]}
        actions={
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/members')}>
            Back to List
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Personal Information */}
          <MainCard title="Personal Information">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name (Arabic)"
                  value={form.fullNameArabic}
                  onChange={handleChange('fullNameArabic')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name (English)"
                  value={form.fullNameEnglish}
                  onChange={handleChange('fullNameEnglish')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth disabled label="Civil ID" value={form.civilId || 'N/A'} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Card Number" value={form.cardNumber} onChange={handleChange('cardNumber')} />
              </Grid>

              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Birth Date"
                  value={form.birthDate ? dayjs(form.birthDate) : null}
                  onChange={handleDateChange('birthDate')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select value={form.gender} onChange={handleChange('gender')} label="Gender">
                    <MenuItem value="MALE">Male</MenuItem>
                    <MenuItem value="FEMALE">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Marital Status</InputLabel>
                  <Select value={form.maritalStatus} onChange={handleChange('maritalStatus')} label="Marital Status">
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="SINGLE">Single</MenuItem>
                    <MenuItem value="MARRIED">Married</MenuItem>
                    <MenuItem value="DIVORCED">Divorced</MenuItem>
                    <MenuItem value="WIDOWED">Widowed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Nationality" value={form.nationality} onChange={handleChange('nationality')} />
              </Grid>
            </Grid>
          </MainCard>

          {/* Contact Information */}
          <MainCard title="Contact Information">
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Phone" value={form.phone} onChange={handleChange('phone')} />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  value={form.email}
                  onChange={handleChange('email')}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Address" value={form.address} onChange={handleChange('address')} />
              </Grid>
            </Grid>
          </MainCard>

          {/* Employment Information */}
          <MainCard title="Employment Information">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Employee Number" value={form.employeeNumber} onChange={handleChange('employeeNumber')} />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Join Date"
                  value={form.joinDate ? dayjs(form.joinDate) : null}
                  onChange={handleDateChange('joinDate')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Occupation" value={form.occupation} onChange={handleChange('occupation')} />
              </Grid>
            </Grid>
          </MainCard>

          {/* Insurance Information */}
          <MainCard title="Insurance Information">
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Policy Number" value={form.policyNumber} onChange={handleChange('policyNumber')} />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Insurance Company</InputLabel>
                  <Select
                    value={form.insuranceCompanyId}
                    onChange={handleChange('insuranceCompanyId')}
                    label="Insurance Company"
                  >
                    <MenuItem value="">None</MenuItem>
                    {insuranceCompanies.map((ins) => (
                      <MenuItem key={ins.id} value={ins.id}>
                        {ins.nameAr}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Benefit Package</InputLabel>
                  <Select value={form.benefitPackageId} onChange={handleChange('benefitPackageId')} label="Benefit Package">
                    <MenuItem value="">None</MenuItem>
                    {benefitPackages.map((pkg) => (
                      <MenuItem key={pkg.id} value={pkg.id}>
                        {pkg.nameAr}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </MainCard>

          {/* Membership Period & Status */}
          <MainCard title="Membership Period & Status">
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Member Status</InputLabel>
                  <Select value={form.status} onChange={handleChange('status')} label="Member Status">
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="SUSPENDED">Suspended</MenuItem>
                    <MenuItem value="TERMINATED">Terminated</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Card Status</InputLabel>
                  <Select value={form.cardStatus} onChange={handleChange('cardStatus')} label="Card Status">
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                    <MenuItem value="BLOCKED">Blocked</MenuItem>
                    <MenuItem value="EXPIRED">Expired</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Start Date"
                  value={form.startDate ? dayjs(form.startDate) : null}
                  onChange={handleDateChange('startDate')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <DatePicker
                  label="End Date"
                  value={form.endDate ? dayjs(form.endDate) : null}
                  onChange={handleDateChange('endDate')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth multiline rows={3} label="Notes" value={form.notes} onChange={handleChange('notes')} />
              </Grid>
            </Grid>
          </MainCard>

          {/* Family Members */}
          <MainCard title="Family Members">
            <Stack spacing={2}>
              {form.familyMembers.length > 0 && (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Full Name (AR)</TableCell>
                        <TableCell>Civil ID</TableCell>
                        <TableCell>Birth Date</TableCell>
                        <TableCell>Gender</TableCell>
                        <TableCell>Relationship</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {form.familyMembers.map((fm, index) => (
                        <TableRow key={index}>
                          <TableCell>{fm.fullNameArabic}</TableCell>
                          <TableCell>{fm.civilId}</TableCell>
                          <TableCell>{fm.birthDate}</TableCell>
                          <TableCell>{fm.gender}</TableCell>
                          <TableCell>{fm.relationship}</TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="error" onClick={() => removeFamilyMember(index)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Divider />
              <Typography variant="h6">Add Family Member</Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Full Name (Arabic)"
                    value={familyDraft.fullNameArabic}
                    onChange={handleFamilyDraftChange('fullNameArabic')}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Full Name (English)"
                    value={familyDraft.fullNameEnglish}
                    onChange={handleFamilyDraftChange('fullNameEnglish')}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Civil ID"
                    value={familyDraft.civilId}
                    onChange={handleFamilyDraftChange('civilId')}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <DatePicker
                    label="Birth Date"
                    value={familyDraft.birthDate ? dayjs(familyDraft.birthDate) : null}
                    onChange={handleFamilyDateChange}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Gender</InputLabel>
                    <Select value={familyDraft.gender} onChange={handleFamilyDraftChange('gender')} label="Gender">
                      <MenuItem value="MALE">Male</MenuItem>
                      <MenuItem value="FEMALE">Female</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Relationship</InputLabel>
                    <Select
                      value={familyDraft.relationship}
                      onChange={handleFamilyDraftChange('relationship')}
                      label="Relationship"
                    >
                      <MenuItem value="WIFE">Wife</MenuItem>
                      <MenuItem value="HUSBAND">Husband</MenuItem>
                      <MenuItem value="SON">Son</MenuItem>
                      <MenuItem value="DAUGHTER">Daughter</MenuItem>
                      <MenuItem value="FATHER">Father</MenuItem>
                      <MenuItem value="MOTHER">Mother</MenuItem>
                      <MenuItem value="BROTHER">Brother</MenuItem>
                      <MenuItem value="SISTER">Sister</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={addFamilyMember}>
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Stack>
          </MainCard>

          {/* Submit Actions */}
          <MainCard>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => navigate('/members')} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Stack>
          </MainCard>
        </Stack>
      </form>
    </>
  );
};

export default MemberEdit;
