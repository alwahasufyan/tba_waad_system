import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import { useEmployerDetails } from 'hooks/useEmployers';
import { updateEmployer } from 'services/api/employers.service';

const LABELS = {
  list: 'أصحاب العمل',
  edit: 'تعديل صاحب العمل',
  back: 'رجوع',
  backToList: 'رجوع إلى القائمة',
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
  updatedSuccess: 'تم تحديث صاحب العمل بنجاح',
  saveError: 'فشل في تحديث صاحب العمل',
  notFound: 'لم يتم العثور على صاحب العمل'
};

const EmployerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { data: employerData, loading: loadingEmployer, error: fetchError } = useEmployerDetails(id);
  const [employer, setEmployer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employerData) {
      setEmployer(employerData);
    }
  }, [employerData]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setEmployer((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    if (!employer) return false;
    const newErrors = {};
    if (!employer.code?.trim()) {
      newErrors.code = LABELS.required;
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
      await updateEmployer(id, employer);
      enqueueSnackbar(LABELS.updatedSuccess, { variant: 'success' });
      navigate('/employers');
    } catch (err) {
      console.error('Failed to update employer:', err);
      enqueueSnackbar(LABELS.saveError, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loadingEmployer) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (fetchError || !employer) {
    return (
      <>
        <ModernPageHeader
          title={LABELS.edit}
          icon={EditIcon}
          breadcrumbs={[
            { label: LABELS.list, path: '/employers' },
            { label: LABELS.edit, path: `/employers/edit/${id}` }
          ]}
        />
        <MainCard>
          <Alert severity="error">
            {LABELS.notFound}
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/employers')} variant="outlined">
              {LABELS.backToList}
            </Button>
          </Box>
        </MainCard>
      </>
    );
  }

  return (
    <>
      <ModernPageHeader
        title={LABELS.edit}
        subtitle={employer.nameAr || employer.code}
        icon={EditIcon}
        breadcrumbs={[
          { label: LABELS.list, path: '/employers' },
          { label: LABELS.edit, path: `/employers/edit/${id}` }
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
                value={employer.code || ''}
                onChange={handleChange('code')}
                error={!!errors.code}
                helperText={errors.code}
                placeholder={LABELS.employerCodePlaceholder}
              />
            </Grid>

            {/* Name Arabic */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label={LABELS.nameAr}
                value={employer.nameAr || ''}
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
                value={employer.nameEn || ''}
                onChange={handleChange('nameEn')}
                placeholder={LABELS.nameEnPlaceholder}
              />
            </Grid>

            {/* Active Status */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={<Switch checked={employer.active || false} onChange={handleChange('active')} color="primary" />}
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

export default EmployerEdit;
