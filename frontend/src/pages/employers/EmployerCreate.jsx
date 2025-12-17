import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
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

const emptyEmployer = {
  employerCode: '',
  nameAr: '',
  nameEn: '',
  active: true
};

const EmployerCreate = () => {
  const navigate = useNavigate();
  const intl = useIntl();
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
      newErrors.employerCode = intl.formatMessage({ id: 'validation.required' }) || 'Required';
    }
    if (!employer.nameAr?.trim()) {
      newErrors.nameAr = intl.formatMessage({ id: 'validation.required' }) || 'Required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      enqueueSnackbar(
        intl.formatMessage({ id: 'validation.fix-errors' }) || 'Please fix validation errors',
        { variant: 'warning' }
      );
      return;
    }

    try {
      setSaving(true);
      await createEmployer(employer);
      enqueueSnackbar(
        intl.formatMessage({ id: 'employers.created-success' }) || 'Employer created successfully',
        { variant: 'success' }
      );
      navigate('/employers');
    } catch (err) {
      console.error('Failed to create employer:', err);
      enqueueSnackbar(
        intl.formatMessage({ id: 'common.error' }) || 'Failed to save employer',
        { variant: 'error' }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ModernPageHeader
        title={intl.formatMessage({ id: 'employers.add' }) || 'Add Employer'}
        icon={BusinessIcon}
        breadcrumbs={[
          { label: intl.formatMessage({ id: 'employers.list' }) || 'Employers', path: '/employers' },
          { label: intl.formatMessage({ id: 'employers.add' }) || 'Add', path: '/employers/create' }
        ]}
        actions={
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/employers')} variant="outlined">
            {intl.formatMessage({ id: 'common.back' }) || 'Back'}
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
                label={intl.formatMessage({ id: 'employers.employer-code' }) || 'Employer Code'}
                value={employer.employerCode}
                onChange={handleChange('employerCode')}
                error={!!errors.employerCode}
                helperText={errors.employerCode}
                placeholder={intl.formatMessage({ id: 'employers.employer-code-placeholder' }) || 'Enter employer code'}
              />
            </Grid>

            {/* Name Arabic */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label={intl.formatMessage({ id: 'employers.name-ar' }) || 'Name (Arabic)'}
                value={employer.nameAr}
                onChange={handleChange('nameAr')}
                error={!!errors.nameAr}
                helperText={errors.nameAr}
                placeholder={intl.formatMessage({ id: 'employers.name-ar-placeholder' }) || 'Enter Arabic name'}
              />
            </Grid>

            {/* Name English */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={intl.formatMessage({ id: 'employers.name-en' }) || 'Name (English)'}
                value={employer.nameEn}
                onChange={handleChange('nameEn')}
                placeholder={intl.formatMessage({ id: 'employers.name-en-placeholder' }) || 'Enter English name'}
              />
            </Grid>

            {/* Active Status */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={<Switch checked={employer.active} onChange={handleChange('active')} color="primary" />}
                label={intl.formatMessage({ id: 'common.active' }) || 'Active'}
              />
            </Grid>
          </Grid>

          {/* Form Actions */}
          <Divider sx={{ my: 3 }} />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate('/employers')} disabled={saving}>
              {intl.formatMessage({ id: 'common.cancel' }) || 'Cancel'}
            </Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving}>
              {saving
                ? intl.formatMessage({ id: 'common.saving' }) || 'Saving...'
                : intl.formatMessage({ id: 'common.save' }) || 'Save'}
            </Button>
          </Stack>
        </Box>
      </MainCard>
    </>
  );
};

export default EmployerCreate;
