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
import { FIXED_INSURANCE_COMPANY, getFixedInsuranceCompanyId } from 'constants/insuranceCompany';

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
    insuranceCompanyId: getFixedInsuranceCompanyId(), // Fixed single-tenant insurance company

    // Membership Period
    status: 'ACTIVE',
    startDate: null,
    endDate: null,
    cardStatus: 'ACTIVE',

    // Additional
    notes: '',
    active: true,

    // Family Members
    familyMembers: [],

    // Flexible Attributes
    attributes: []
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

  // Attribute Draft
  const [attributeDraft, setAttributeDraft] = useState({
    code: '',
    value: ''
  });

  // Selectors Data
  const [employers, setEmployers] = useState([]);
  // Insurance company is fixed - no dropdown needed (single-tenant mode)
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

      // Insurance company is fixed in single-tenant mode - no API call needed

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

  // Attribute Handlers
  const handleAttributeDraftChange = (field) => (event) => {
    setAttributeDraft((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const addAttribute = () => {
    if (!attributeDraft.code) {
      openSnackbar({ message: 'رمز السمة مطلوب', variant: 'error' });
      return;
    }
    if (!attributeDraft.value) {
      openSnackbar({ message: 'قيمة السمة مطلوبة', variant: 'error' });
      return;
    }

    // Check for duplicate attribute code
    if (form.attributes.some((attr) => attr.code === attributeDraft.code)) {
      openSnackbar({ message: 'هذه السمة موجودة بالفعل', variant: 'warning' });
      return;
    }

    setForm((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { ...attributeDraft, source: 'MANUAL' }]
    }));

    setAttributeDraft({ code: '', value: '' });
    openSnackbar({ message: 'تمت إضافة السمة', variant: 'success' });
  };

  const removeAttribute = (index) => {
    setForm((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
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
        insuranceCompanyId: getFixedInsuranceCompanyId(), // Fixed single-tenant insurance company
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
        })),
        attributes: form.attributes.map((attr) => ({
          code: attr.code,
          value: attr.value,
          source: attr.source || 'MANUAL'
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
        title="إضافة مؤمَّن عليه جديد"
        subtitle="إنشاء سجل جديد للمؤمَّن عليه"
        icon={PeopleAltIcon}
        breadcrumbs={[
          { label: 'المؤمَّن عليهم', path: '/members' },
          { label: 'إضافة جديد', path: '/members/create' }
        ]}
        actions={
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/members')}>
            العودة للقائمة
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* SECTION 1: Personal Information */}
          <MainCard title="البيانات الشخصية">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="الاسم بالعربية"
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
                  label="الاسم بالإنجليزية"
                  value={form.fullNameEnglish}
                  onChange={handleChange('fullNameEnglish')}
                  placeholder="Ahmed Mohammed Ali"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="الرقم المدني"
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
                  label="رقم البطاقة"
                  value={form.cardNumber}
                  onChange={handleChange('cardNumber')}
                  placeholder="MEM-123456"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <DatePicker
                  label="تاريخ الميلاد *"
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
                  <InputLabel>الجنس</InputLabel>
                  <Select value={form.gender} onChange={handleChange('gender')} label="الجنس">
                    <MenuItem value="MALE">ذكر</MenuItem>
                    <MenuItem value="FEMALE">أنثى</MenuItem>
                  </Select>
                  {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>الحالة الاجتماعية</InputLabel>
                  <Select value={form.maritalStatus} onChange={handleChange('maritalStatus')} label="الحالة الاجتماعية">
                    <MenuItem value="">غير محدد</MenuItem>
                    <MenuItem value="SINGLE">أعزب</MenuItem>
                    <MenuItem value="MARRIED">متزوج</MenuItem>
                    <MenuItem value="DIVORCED">مطلق</MenuItem>
                    <MenuItem value="WIDOWED">أرمل</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="الجنسية"
                  value={form.nationality}
                  onChange={handleChange('nationality')}
                  placeholder="ليبي"
                />
              </Grid>
            </Grid>
          </MainCard>

          {/* SECTION 2: Contact Information */}
          <MainCard title="بيانات التواصل">
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="الهاتف"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  placeholder="+218912345678"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="email"
                  label="البريد الإلكتروني"
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
                  label="العنوان"
                  value={form.address}
                  onChange={handleChange('address')}
                  placeholder="طرابلس، شارع ..."
                />
              </Grid>
            </Grid>
          </MainCard>

          {/* SECTION 3: Employment Information */}
          <MainCard title="بيانات العمل">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!errors.employerId}>
                  <InputLabel>جهة العمل</InputLabel>
                  <Select value={form.employerId} onChange={handleChange('employerId')} label="جهة العمل">
                    <MenuItem value="">-- اختر جهة العمل --</MenuItem>
                    {Array.isArray(employers) && employers.map((emp) => (
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
                  label="الرقم الوظيفي"
                  value={form.employeeNumber}
                  onChange={handleChange('employeeNumber')}
                  placeholder="EMP-001"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="تاريخ الالتحاق"
                  value={form.joinDate ? dayjs(form.joinDate) : null}
                  onChange={handleDateChange('joinDate')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="المهنة"
                  value={form.occupation}
                  onChange={handleChange('occupation')}
                  placeholder="مهندس برمجيات"
                />
              </Grid>
            </Grid>
          </MainCard>

          {/* SECTION 4: Insurance Information */}
          <MainCard title="بيانات التأمين">
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="رقم البوليصة"
                  value={form.policyNumber}
                  onChange={handleChange('policyNumber')}
                  placeholder="POL-2024-001"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                {/* Fixed Insurance Company - Single Tenant Mode */}
                <TextField
                  fullWidth
                  label="شركة التأمين"
                  value={FIXED_INSURANCE_COMPANY.name}
                  InputProps={{ readOnly: true }}
                  disabled
                  helperText="شركة التأمين ثابتة في النظام"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>باقة المنافع</InputLabel>
                  <Select value={form.benefitPackageId} onChange={handleChange('benefitPackageId')} label="باقة المنافع">
                    <MenuItem value="">-- اختر باقة المنافع --</MenuItem>
                    {Array.isArray(benefitPackages) && benefitPackages.map((pkg) => (
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
          <MainCard title="فترة التغطية والحالة">
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>حالة العضوية</InputLabel>
                  <Select value={form.status} onChange={handleChange('status')} label="حالة العضوية">
                    <MenuItem value="ACTIVE">نشط</MenuItem>
                    <MenuItem value="SUSPENDED">موقوف</MenuItem>
                    <MenuItem value="TERMINATED">منتهي</MenuItem>
                    <MenuItem value="PENDING">قيد الانتظار</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>حالة البطاقة</InputLabel>
                  <Select value={form.cardStatus} onChange={handleChange('cardStatus')} label="حالة البطاقة">
                    <MenuItem value="ACTIVE">نشطة</MenuItem>
                    <MenuItem value="INACTIVE">غير نشطة</MenuItem>
                    <MenuItem value="BLOCKED">محظورة</MenuItem>
                    <MenuItem value="EXPIRED">منتهية</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <DatePicker
                  label="تاريخ بداية التغطية"
                  value={form.startDate ? dayjs(form.startDate) : null}
                  onChange={handleDateChange('startDate')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <DatePicker
                  label="تاريخ انتهاء التغطية"
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
                  label="ملاحظات"
                  value={form.notes}
                  onChange={handleChange('notes')}
                  placeholder="أي ملاحظات إضافية..."
                />
              </Grid>
            </Grid>
          </MainCard>

          {/* SECTION 6: Family Members */}
          <MainCard title="التابعين">
            <Stack spacing={2}>
              {/* Family Members List */}
              {Array.isArray(form.familyMembers) && form.familyMembers.length > 0 && (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>الاسم بالعربية</TableCell>
                        <TableCell>الرقم المدني</TableCell>
                        <TableCell>تاريخ الميلاد</TableCell>
                        <TableCell>الجنس</TableCell>
                        <TableCell>صلة القرابة</TableCell>
                        <TableCell align="center">الإجراءات</TableCell>
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
                إضافة تابع
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="الاسم بالعربية"
                    value={familyDraft.fullNameArabic}
                    onChange={handleFamilyDraftChange('fullNameArabic')}
                    placeholder="محمد أحمد"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="الاسم بالإنجليزية"
                    value={familyDraft.fullNameEnglish}
                    onChange={handleFamilyDraftChange('fullNameEnglish')}
                    placeholder="Mohammed Ahmed"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="الرقم المدني"
                    value={familyDraft.civilId}
                    onChange={handleFamilyDraftChange('civilId')}
                    placeholder="289123456789"
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <DatePicker
                    label="تاريخ الميلاد"
                    value={familyDraft.birthDate ? dayjs(familyDraft.birthDate) : null}
                    onChange={handleFamilyDateChange}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>الجنس</InputLabel>
                    <Select value={familyDraft.gender} onChange={handleFamilyDraftChange('gender')} label="الجنس">
                      <MenuItem value="MALE">ذكر</MenuItem>
                      <MenuItem value="FEMALE">أنثى</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>صلة القرابة</InputLabel>
                    <Select
                      value={familyDraft.relationship}
                      onChange={handleFamilyDraftChange('relationship')}
                      label="صلة القرابة"
                    >
                      <MenuItem value="WIFE">زوجة</MenuItem>
                      <MenuItem value="HUSBAND">زوج</MenuItem>
                      <MenuItem value="SON">ابن</MenuItem>
                      <MenuItem value="DAUGHTER">ابنة</MenuItem>
                      <MenuItem value="FATHER">أب</MenuItem>
                      <MenuItem value="MOTHER">أم</MenuItem>
                      <MenuItem value="BROTHER">أخ</MenuItem>
                      <MenuItem value="SISTER">أخت</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={addFamilyMember}>
                    إضافة تابع
                  </Button>
                </Grid>
              </Grid>
            </Stack>
          </MainCard>

          {/* SECTION 7: Custom Attributes */}
          <MainCard title="السمات المخصصة">
            <Stack spacing={2}>
              {/* Attributes List */}
              {Array.isArray(form.attributes) && form.attributes.length > 0 && (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>رمز السمة</TableCell>
                        <TableCell>القيمة</TableCell>
                        <TableCell>المصدر</TableCell>
                        <TableCell align="center">الإجراءات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {form.attributes.map((attr, index) => (
                        <TableRow key={index}>
                          <TableCell>{attr.code}</TableCell>
                          <TableCell>{attr.value}</TableCell>
                          <TableCell>{attr.source || 'MANUAL'}</TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="error" onClick={() => removeAttribute(index)}>
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

              {/* Add Attribute Form */}
              <Typography variant="h6" gutterBottom>
                إضافة سمة
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>رمز السمة</InputLabel>
                    <Select
                      value={attributeDraft.code}
                      onChange={handleAttributeDraftChange('code')}
                      label="رمز السمة"
                    >
                      <MenuItem value="job_title">المسمى الوظيفي</MenuItem>
                      <MenuItem value="department">القسم</MenuItem>
                      <MenuItem value="work_location">موقع العمل</MenuItem>
                      <MenuItem value="cost_center">مركز التكلفة</MenuItem>
                      <MenuItem value="badge_number">رقم البطاقة</MenuItem>
                      <MenuItem value="blood_type">فصيلة الدم</MenuItem>
                      <MenuItem value="emergency_contact">جهة الاتصال للطوارئ</MenuItem>
                      <MenuItem value="emergency_phone">هاتف الطوارئ</MenuItem>
                      <MenuItem value="custom">مخصص...</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {attributeDraft.code === 'custom' && (
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="رمز السمة المخصص"
                      value={attributeDraft.code === 'custom' ? '' : attributeDraft.code}
                      onChange={(e) =>
                        setAttributeDraft((prev) => ({ ...prev, code: e.target.value }))
                      }
                      placeholder="custom_field"
                    />
                  </Grid>
                )}

                <Grid item xs={12} md={attributeDraft.code === 'custom' ? 4 : 5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="قيمة السمة"
                    value={attributeDraft.value}
                    onChange={handleAttributeDraftChange('value')}
                    placeholder="أدخل القيمة"
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={addAttribute}>
                    إضافة سمة
                  </Button>
                </Grid>
              </Grid>
            </Stack>
          </MainCard>

          {/* Submit Actions */}
          <MainCard>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => navigate('/members')} disabled={loading}>
                إلغاء
              </Button>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>
                {loading ? 'جاري الحفظ...' : 'حفظ البيانات'}
              </Button>
            </Stack>
          </MainCard>
        </Stack>
      </form>
    </>
  );
};

export default MemberCreate;
