import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import { createEmployer } from 'services/api/employers.service';

// Static Arabic labels
const LABELS = {
  list: 'أصحاب العمل',
  add: 'إضافة صاحب عمل',
  back: 'رجوع',
  employerCode: 'رمز صاحب العمل',
  employerCodePlaceholder: 'أدخل رمز صاحب العمل',
  nameAr: 'الاسم (عربي)',
  nameArPlaceholder: 'أدخل الاسم بالعربية',
  nameEn: 'الاسم (إنجليزي)',
  nameEnPlaceholder: 'أدخل الاسم بالإنجليزية',
  active: 'نشط',
  cancel: 'إلغاء',
  save: 'حفظ',
  saving: 'جار الحفظ...',
  required: 'مطلوب',
  fixErrors: 'الرجاء تصحيح الأخطاء',
  createdSuccess: 'تم إنشاء صاحب العمل بنجاح',
  saveError: 'فشل في حفظ صاحب العمل'
};

const emptyEmployer = {
  employerCode: '',
  nameAr: '',
  nameEn: '',
  active: true
};

const EmployerCreate = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [employer, setEmployer] = useState(emptyEmployer);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setEmployer((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!employer.employerCode?.trim()) {
      newErrors.employerCode = LABELS.required;
    }
    if (!employer.nameAr?.trim()) {
      newErrors.nameAr = LABELS.required;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      enqueueSnackbar(LABELS.fixErrors, { variant: 'warning' });
      return;
    }

    try {
      setSaving(true);
      await createEmployer(employer);
      enqueueSnackbar(LABELS.createdSuccess, { variant: 'success' });
      navigate('/employers');
    } catch (err) {
      console.error('Failed to create employer:', err);
      enqueueSnackbar(LABELS.saveError, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ModernPageHeader
        title={LABELS.add}
        icon={BusinessIcon}
        breadcrumbs={[
          { label: LABELS.list, path: '/employers' },
          { label: LABELS.add, path: '/employers/create' }
        ]}
        actions={
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/employers')} variant="outlined">
            {LABELS.back}
          </Button>
        }
      />

      <MainCard>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            {/* Employer Code */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label={LABELS.employerCode}
                value={employer.employerCode}
                onChange={handleChange('employerCode')}
                error={!!errors.employerCode}
                helperText={errors.employerCode}
                placeholder={LABELS.employerCodePlaceholder}
              />
            </Grid>

            {/* Name Arabic */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label={LABELS.nameAr}
                value={employer.nameAr}
                onChange={handleChange('nameAr')}
                error={!!errors.nameAr}
                helperText={errors.nameAr}
                placeholder={LABELS.nameArPlaceholder}
              />
            </Grid>

            {/* Name English */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={LABELS.nameEn}
                value={employer.nameEn}
                onChange={handleChange('nameEn')}
                placeholder={LABELS.nameEnPlaceholder}
              />
            </Grid>

            {/* Active Status */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={<Switch checked={employer.active} onChange={handleChange('active')} color="primary" />}
                label={LABELS.active}
              />
            </Grid>
          </Grid>

          {/* Form Actions */}
          <Divider sx={{ my: 3 }} />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate('/employers')} disabled={saving}>
              {LABELS.cancel}
            </Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving}>
              {saving ? LABELS.saving : LABELS.save}
            </Button>
          </Stack>
        </Box>
      </MainCard>
    </>
  );
};

export default EmployerCreate;
