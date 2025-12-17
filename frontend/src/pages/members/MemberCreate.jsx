import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FormHelperText
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
import { createMember } from 'services/api/members.service';
import axiosClient from 'utils/axios';
import { openSnackbar } from 'api/snackbar';

/**
 * Member Create Page
 * Backend: MemberController.create → MemberCreateDto
 */
const MemberCreate = () => {
  const navigate = useNavigate();

  // Form State (aligned with MemberCreateDto)
  const [form, setForm] = useState({
    // Personal Information
    fullNameArabic: '',
    fullNameEnglish: '',
    civilId: '',
    cardNumber: '',
    birthDate: null,
    gender: 'MALE',
    maritalStatus: '',
    nationality: '',

    // Contact
    phone: '',
    email: '',
    address: '',

    // Employment
    employerId: '',
    employeeNumber: '',
    joinDate: null,
    occupation: '',

    // Insurance
    policyNumber: '',
    benefitPackageId: '',
    insuranceCompanyId: '',

    // Membership Period
    status: 'ACTIVE',
    startDate: null,
    endDate: null,
    cardStatus: 'ACTIVE',

    // Additional
    notes: '',
    active: true,

    // Family Members
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load Selectors
  useEffect(() => {
    loadSelectors();
  }, []);

  const loadSelectors = async () => {
    try {
      // Load Employers
      const employersRes = await axiosClient.get('/employers/selector');
      setEmployers(employersRes.data?.data || []);

      // Load Insurance Companies
      const insuranceRes = await axiosClient.get('/insurance-companies/selector');
      setInsuranceCompanies(insuranceRes.data?.data || []);

      // Load Benefit Packages
      const packagesRes = await axiosClient.get('/benefit-packages/selector');
      setBenefitPackages(packagesRes.data?.data || []);
    } catch (err) {
      console.error('[MemberCreate] Failed to load selectors:', err);
    }
  };

  // Field Handlers
  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    // Clear error on change
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
    // Validate family member
    if (!familyDraft.fullNameArabic) {
      openSnackbar({ message: 'Full name (Arabic) is required for family member', variant: 'error' });
      return;
    }
    if (!familyDraft.civilId) {
      openSnackbar({ message: 'Civil ID is required for family member', variant: 'error' });
      return;
    }
    if (!familyDraft.birthDate) {
      openSnackbar({ message: 'Birth date is required for family member', variant: 'error' });
      return;
    }

    setForm((prev) => ({
      ...prev,
      familyMembers: [...prev.familyMembers, { ...familyDraft }]
    }));

    // Reset draft
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

    // Required fields
    if (!form.fullNameArabic) newErrors.fullNameArabic = 'Full name (Arabic) is required';
    if (!form.civilId) newErrors.civilId = 'Civil ID is required';
    if (!form.birthDate) newErrors.birthDate = 'Birth date is required';
    if (!form.gender) newErrors.gender = 'Gender is required';
    if (!form.employerId) newErrors.employerId = 'Employer is required';

    // Email validation
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
      setLoading(true);

      // Prepare payload (exact MemberCreateDto structure)
      const payload = {
        fullNameArabic: form.fullNameArabic,
        fullNameEnglish: form.fullNameEnglish || null,
        civilId: form.civilId,
        cardNumber: form.cardNumber || null,
        birthDate: form.birthDate,
        gender: form.gender,
        maritalStatus: form.maritalStatus || null,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        nationality: form.nationality || null,
        policyNumber: form.policyNumber || null,
        benefitPackageId: form.benefitPackageId || null,
        insuranceCompanyId: form.insuranceCompanyId || null,
        employerId: parseInt(form.employerId),
        employeeNumber: form.employeeNumber || null,
        joinDate: form.joinDate || null,
        occupation: form.occupation || null,
        status: form.status || null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        cardStatus: form.cardStatus || null,
        notes: form.notes || null,
        active: form.active,
        familyMembers: form.familyMembers.map((fm) => ({
          relationship: fm.relationship,
          fullNameArabic: fm.fullNameArabic,
          fullNameEnglish: fm.fullNameEnglish || null,
          civilId: fm.civilId,
          birthDate: fm.birthDate,
          gender: fm.gender,
          active: fm.active ?? true
        }))
      };

      await createMember(payload);

      openSnackbar({ message: 'Member created successfully', variant: 'success' });
      navigate('/members');
    } catch (err) {
      console.error('[MemberCreate] Submit failed:', err);
      openSnackbar({
        message: err.response?.data?.message || 'Failed to create member',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ModernPageHeader
        title="Add New Member"
        subtitle="Create a new insurance member"
        icon={PeopleAltIcon}
        breadcrumbs={[
          { label: 'Members', path: '/members' },
          { label: 'Add Member', path: '/members/create' }
        ]}
        actions={
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/members')}>
            Back to List
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* SECTION 1: Personal Information */}
          <MainCard title="Personal Information">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Full Name (Arabic)"
                  value={form.fullNameArabic}
                  onChange={handleChange('fullNameArabic')}
                  error={!!errors.fullNameArabic}
                  helperText={errors.fullNameArabic}
                  placeholder="أحمد محمد علي"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name (English)"
                  value={form.fullNameEnglish}
                  onChange={handleChange('fullNameEnglish')}
                  placeholder="Ahmed Mohammed Ali"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Civil ID"
                  value={form.civilId}
                  onChange={handleChange('civilId')}
                  error={!!errors.civilId}
                  helperText={errors.civilId}
                  placeholder="289123456789"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Card Number"
                  value={form.cardNumber}
                  onChange={handleChange('cardNumber')}
                  placeholder="MEM-123456"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Birth Date *"
                  value={form.birthDate ? dayjs(form.birthDate) : null}
                  onChange={handleDateChange('birthDate')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.birthDate,
                      helperText: errors.birthDate
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth required error={!!errors.gender}>
                  <InputLabel>Gender</InputLabel>
                  <Select value={form.gender} onChange={handleChange('gender')} label="Gender">
                    <MenuItem value="MALE">Male (ذكر)</MenuItem>
                    <MenuItem value="FEMALE">Female (أنثى)</MenuItem>
                  </Select>
                  {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Marital Status</InputLabel>
                  <Select value={form.maritalStatus} onChange={handleChange('maritalStatus')} label="Marital Status">
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="SINGLE">Single (أعزب)</MenuItem>
                    <MenuItem value="MARRIED">Married (متزوج)</MenuItem>
                    <MenuItem value="DIVORCED">Divorced (مطلق)</MenuItem>
                    <MenuItem value="WIDOWED">Widowed (أرمل)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nationality"
                  value={form.nationality}
                  onChange={handleChange('nationality')}
                  placeholder="Kuwaiti"
                />
              </Grid>
            </Grid>
          </MainCard>

          {/* SECTION 2: Contact Information */}
          <MainCard title="Contact Information">
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  placeholder="+96512345678"
                />
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
                  placeholder="ahmed@example.com"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Address"
                  value={form.address}
                  onChange={handleChange('address')}
                  placeholder="Block 5, Street 10, House 25"
                />
              </Grid>
            </Grid>
          </MainCard>

          {/* SECTION 3: Employment Information */}
          <MainCard title="Employment Information">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!errors.employerId}>
                  <InputLabel>Employer</InputLabel>
                  <Select value={form.employerId} onChange={handleChange('employerId')} label="Employer">
                    <MenuItem value="">Select Employer</MenuItem>
                    {employers.map((emp) => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {emp.code} - {emp.nameAr}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.employerId && <FormHelperText>{errors.employerId}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Employee Number"
                  value={form.employeeNumber}
                  onChange={handleChange('employeeNumber')}
                  placeholder="EMP-001"
                />
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
                <TextField
                  fullWidth
                  label="Occupation"
                  value={form.occupation}
                  onChange={handleChange('occupation')}
                  placeholder="Software Engineer"
                />
              </Grid>
            </Grid>
          </MainCard>

          {/* SECTION 4: Insurance Information */}
          <MainCard title="Insurance Information">
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Policy Number"
                  value={form.policyNumber}
                  onChange={handleChange('policyNumber')}
                  placeholder="POL-2024-001"
                />
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

          {/* SECTION 5: Membership Period */}
          <MainCard title="Membership Period & Status">
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Member Status</InputLabel>
                  <Select value={form.status} onChange={handleChange('status')} label="Member Status">
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
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes"
                  value={form.notes}
                  onChange={handleChange('notes')}
                  placeholder="Any additional notes..."
                />
              </Grid>
            </Grid>
          </MainCard>

          {/* SECTION 6: Family Members */}
          <MainCard title="Family Members">
            <Stack spacing={2}>
              {/* Family Members List */}
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

              {/* Add Family Member Form */}
              <Typography variant="h6" gutterBottom>
                Add Family Member
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Full Name (Arabic)"
                    value={familyDraft.fullNameArabic}
                    onChange={handleFamilyDraftChange('fullNameArabic')}
                    placeholder="محمد أحمد"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Full Name (English)"
                    value={familyDraft.fullNameEnglish}
                    onChange={handleFamilyDraftChange('fullNameEnglish')}
                    placeholder="Mohammed Ahmed"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Civil ID"
                    value={familyDraft.civilId}
                    onChange={handleFamilyDraftChange('civilId')}
                    placeholder="289123456789"
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
                      <MenuItem value="WIFE">Wife (زوجة)</MenuItem>
                      <MenuItem value="HUSBAND">Husband (زوج)</MenuItem>
                      <MenuItem value="SON">Son (ابن)</MenuItem>
                      <MenuItem value="DAUGHTER">Daughter (ابنة)</MenuItem>
                      <MenuItem value="FATHER">Father (أب)</MenuItem>
                      <MenuItem value="MOTHER">Mother (أم)</MenuItem>
                      <MenuItem value="BROTHER">Brother (أخ)</MenuItem>
                      <MenuItem value="SISTER">Sister (أخت)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={addFamilyMember}>
                    Add Family Member
                  </Button>
                </Grid>
              </Grid>
            </Stack>
          </MainCard>

          {/* Submit Actions */}
          <MainCard>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => navigate('/members')} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>
                {loading ? 'Creating...' : 'Create Member'}
              </Button>
            </Stack>
          </MainCard>
        </Stack>
      </form>
    </>
  );
};

export default MemberCreate;
