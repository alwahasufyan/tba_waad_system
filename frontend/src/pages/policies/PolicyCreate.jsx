import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Stack,
  Alert
} from '@mui/material';
import { Save as SaveIcon, ArrowBack } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import MainCard from 'components/MainCard';
import { useCreatePolicy } from 'hooks/usePolicies';

const PolicyCreate = () => {
  const navigate = useNavigate();
  const { create, creating, error } = useCreatePolicy();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    startDate: null,
    endDate: null,
    active: true
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const handleDateChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: null });
    }
  };

  const handleSwitchChange = (e) => {
    setFormData({ ...formData, active: e.target.checked });
  };

  const validate = () => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = 'الاسم مطلوب';
    }

    if (!formData.code?.trim()) {
      errors.code = 'الكود مطلوب';
    }

    if (!formData.startDate) {
      errors.startDate = 'تاريخ البدء مطلوب';
    }

    if (formData.startDate && formData.endDate && dayjs(formData.endDate).isBefore(dayjs(formData.startDate))) {
      errors.endDate = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء';
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
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description?.trim() || null,
        startDate: formData.startDate ? dayjs(formData.startDate).format('YYYY-MM-DD') : null,
        endDate: formData.endDate ? dayjs(formData.endDate).format('YYYY-MM-DD') : null,
        active: formData.active
      };

      await create(payload);
      navigate('/policies');
    } catch (err) {
      console.error('Create error:', err);
    }
  };

  const handleCancel = () => {
    navigate('/policies');
  };

  return (
    <MainCard title="إضافة سياسة تأمينية جديدة">
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="اسم السياسة"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="كود السياسة"
              name="code"
              value={formData.code}
              onChange={handleChange}
              error={!!formErrors.code}
              helperText={formErrors.code}
              required
            />
          </Grid>

          <Grid item xs={12}>
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

          <Grid item xs={12}>
            <TextField fullWidth label="الوصف" name="description" value={formData.description} onChange={handleChange} multiline rows={4} />
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="تاريخ البدء"
                value={formData.startDate}
                onChange={(value) => handleDateChange('startDate', value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!formErrors.startDate,
                    helperText: formErrors.startDate
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="تاريخ الانتهاء"
                value={formData.endDate}
                onChange={(value) => handleDateChange('endDate', value)}
                minDate={formData.startDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.endDate,
                    helperText: formErrors.endDate
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel control={<Switch checked={formData.active} onChange={handleSwitchChange} />} label="نشط" />
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

export default PolicyCreate;
