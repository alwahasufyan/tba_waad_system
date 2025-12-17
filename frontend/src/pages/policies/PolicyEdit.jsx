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
  FormControlLabel,
  Switch,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon, ArrowBack } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import MainCard from 'components/MainCard';
import { usePolicyDetails, useUpdatePolicy } from 'hooks/usePolicies';
import { insuranceCompaniesService } from 'services/api';

const PolicyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { policy, loading: loadingPolicy } = usePolicyDetails(id);
  const { update, updating, error } = useUpdatePolicy();
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    startDate: null,
    endDate: null,
    insuranceCompanyId: '',
    active: true
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (policy) {
      setFormData({
        name: policy.name || '',
        code: policy.code || '',
        description: policy.description || '',
        startDate: policy.startDate ? dayjs(policy.startDate) : null,
        endDate: policy.endDate ? dayjs(policy.endDate) : null,
        insuranceCompanyId: policy.insuranceCompanyId || '',
        active: policy.active ?? true
      });
    }
  }, [policy]);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const result = await getInsuranceCompanies({ page: 1, size: 1000 });
      setCompanies(result.items || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

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

    if (!formData.insuranceCompanyId) {
      errors.insuranceCompanyId = 'شركة التأمين مطلوبة';
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
        insuranceCompanyId: formData.insuranceCompanyId,
        active: formData.active
      };

      await update(id, payload);
      navigate('/policies');
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleCancel = () => {
    navigate('/policies');
  };

  if (loadingPolicy) {
    return (
      <MainCard>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (!policy) {
    return (
      <MainCard>
        <Alert severity="error">السياسة غير موجودة</Alert>
      </MainCard>
    );
  }

  return (
    <MainCard title="تعديل السياسة التأمينية">
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

export default PolicyEdit;
