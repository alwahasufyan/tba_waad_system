import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  Stack,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Skeleton
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, LocalHospital as LocalHospitalIcon } from '@mui/icons-material';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import visitsService from 'services/api/visits.service';
import { useVisitDetails } from 'hooks/useVisits';
import { useAllMembers } from 'hooks/useMembers';
import { useAllProviders } from 'hooks/useProviders';
import { useAllMedicalServices } from 'hooks/useMedicalServices';

/**
 * Visit Edit Page
 * Form to edit an existing visit
 */
const VisitEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: visit, loading: loadingVisit, error: visitError } = useVisitDetails(id);
  const { data: members, loading: membersLoading } = useAllMembers();
  const { data: providers, loading: providersLoading } = useAllProviders();
  const { data: services, loading: servicesLoading } = useAllMedicalServices();

  const [form, setForm] = useState({
    visitDate: '',
    memberId: '',
    providerId: '',
    serviceIds: [],
    notes: '',
    diagnosis: '',
    active: true
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visit) {
      setForm({
        visitDate: visit.visitDate ? visit.visitDate.split('T')[0] : '',
        memberId: visit.memberId || visit.member?.id || '',
        providerId: visit.providerId || visit.provider?.id || '',
        serviceIds: visit.services?.map((s) => s.id) || visit.serviceIds || [],
        notes: visit.notes || '',
        diagnosis: visit.diagnosis || '',
        active: visit.active !== undefined ? visit.active : true
      });
    }
  }, [visit]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleServicesChange = (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, serviceIds: typeof value === 'string' ? value.split(',') : value }));
    if (errors.serviceIds) {
      setErrors((prev) => ({ ...prev, serviceIds: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.visitDate) newErrors.visitDate = 'تاريخ الزيارة مطلوب';
    if (!form.memberId) newErrors.memberId = 'المؤمَّن عليه مطلوب';
    if (!form.providerId) newErrors.providerId = 'مقدم الخدمة مطلوب';
    if (form.serviceIds.length === 0) newErrors.serviceIds = 'يجب اختيار خدمة واحدة على الأقل';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    try {
      const payload = {
        visitDate: form.visitDate,
        memberId: parseInt(form.memberId, 10),
        providerId: parseInt(form.providerId, 10),
        serviceIds: form.serviceIds.map((sid) => parseInt(sid, 10)),
        notes: form.notes.trim() || null,
        diagnosis: form.diagnosis.trim() || null,
        active: form.active
      };

      await visitsService.update(id, payload);
      navigate('/visits');
    } catch (err) {
      console.error('Failed to update visit:', err);
      setApiError(err.response?.data?.message || err.message || 'فشل تحديث الزيارة');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/visits');
  };

  const breadcrumbs = [{ title: 'الزيارات', path: '/visits' }, { title: 'تعديل زيارة' }];

  if (loadingVisit) {
    return (
      <>
        <ModernPageHeader title="تعديل زيارة" subtitle="تحميل بيانات الزيارة..." icon={<LocalHospitalIcon />} breadcrumbs={breadcrumbs} />
        <MainCard>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} md={6} key={i}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
            ))}
          </Grid>
        </MainCard>
      </>
    );
  }

  if (visitError || !visit) {
    return (
      <>
        <ModernPageHeader title="خطأ" subtitle="فشل تحميل بيانات الزيارة" icon={<LocalHospitalIcon />} breadcrumbs={breadcrumbs} />
        <MainCard>
          <Alert severity="error">
            {visitError?.message || 'لم يتم العثور على الزيارة'}
            <Button onClick={() => navigate('/visits')} sx={{ mt: 2 }}>
              العودة إلى القائمة
            </Button>
          </Alert>
        </MainCard>
      </>
    );
  }

  return (
    <>
      <ModernPageHeader title="تعديل زيارة" subtitle="تعديل بيانات الزيارة" icon={<LocalHospitalIcon />} breadcrumbs={breadcrumbs} />

      <MainCard>
        {apiError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setApiError(null)}>
            {apiError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                معلومات الزيارة
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="date"
                label="تاريخ الزيارة"
                value={form.visitDate}
                onChange={handleChange('visitDate')}
                error={!!errors.visitDate}
                helperText={errors.visitDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.memberId}>
                <InputLabel>المؤمَّن عليه</InputLabel>
                <Select value={form.memberId} onChange={handleChange('memberId')} label="المؤمَّن عليه" disabled={membersLoading}>
                  <MenuItem value="">-- اختر المؤمَّن عليه --</MenuItem>
                  {members?.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.fullName || member.nameAr || member.nameEn || `مؤمن ${member.id}`}
                    </MenuItem>
                  ))}
                </Select>
                {errors.memberId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.memberId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.providerId}>
                <InputLabel>مقدم الخدمة</InputLabel>
                <Select value={form.providerId} onChange={handleChange('providerId')} label="مقدم الخدمة" disabled={providersLoading}>
                  <MenuItem value="">-- اختر مقدم الخدمة --</MenuItem>
                  {providers?.map((provider) => (
                    <MenuItem key={provider.id} value={provider.id}>
                      {provider.nameAr || provider.nameEn}
                    </MenuItem>
                  ))}
                </Select>
                {errors.providerId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.providerId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.serviceIds}>
                <InputLabel>الخدمات المقدمة</InputLabel>
                <Select
                  multiple
                  value={form.serviceIds}
                  onChange={handleServicesChange}
                  input={<OutlinedInput label="الخدمات المقدمة" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((serviceId) => {
                        const service = services?.find((s) => s.id === parseInt(serviceId, 10));
                        return <Chip key={serviceId} label={service?.nameAr || service?.nameEn || serviceId} size="small" />;
                      })}
                    </Box>
                  )}
                  disabled={servicesLoading}
                >
                  <MenuItem value="" disabled>
                    -- اختر الخدمات --
                  </MenuItem>
                  {services?.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.nameAr || service.nameEn} ({service.code})
                    </MenuItem>
                  ))}
                </Select>
                {errors.serviceIds && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.serviceIds}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="الملاحظات" value={form.notes} onChange={handleChange('notes')} />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="التشخيص" value={form.diagnosis} onChange={handleChange('diagnosis')} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                الحالة
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={form.active} onChange={handleChange('active')} />}
                label={form.active ? 'نشط' : 'غير نشط'}
              />
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel} disabled={loading}>
                  إلغاء
                </Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>
                  {loading ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </MainCard>
    </>
  );
};

export default VisitEdit;
