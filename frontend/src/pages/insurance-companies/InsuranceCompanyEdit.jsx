import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  Stack,
  Switch,
  Typography
} from '@mui/material';

// third party
import { Formik } from 'formik';
import * as Yup from 'yup';

// project imports
import MainCard from 'components/MainCard';
import { useInsuranceCompanyDetails, useUpdateInsuranceCompany } from 'hooks/useInsuranceCompanies';

// validation schema
const validationSchema = Yup.object({
  name: Yup.string(),
  code: Yup.string(),
  email: Yup.string().email('البريد الإلكتروني غير صحيح'),
  phone: Yup.string(),
  address: Yup.string(),
  contactPerson: Yup.string(),
  active: Yup.boolean()
});

const InsuranceCompanyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { insuranceCompany, loading } = useInsuranceCompanyDetails(id);
  const { update, updating } = useUpdateInsuranceCompany();
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (values, { setErrors, setStatus }) => {
    try {
      setSubmitError('');
      await update(id, values);
      setStatus({ success: true });
      navigate('/insurance-companies');
    } catch (err) {
      setStatus({ success: false });
      setSubmitError(err.message || 'فشل في تحديث شركة التأمين');
      setErrors({ submit: err.message });
    }
  };

  if (loading) {
    return (
      <MainCard>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (!insuranceCompany) {
    return (
      <MainCard>
        <Typography variant="h5" color="error">
          شركة التأمين غير موجودة
        </Typography>
      </MainCard>
    );
  }

  return (
    <MainCard>
      <Typography variant="h4" sx={{ mb: 3 }}>
        تعديل شركة التأمين
      </Typography>

      <Formik
        initialValues={{
          name: insuranceCompany.name || '',
          code: insuranceCompany.code || '',
          email: insuranceCompany.email || '',
          phone: insuranceCompany.phone || '',
          address: insuranceCompany.address || '',
          contactPerson: insuranceCompany.contactPerson || '',
          active: insuranceCompany.active ?? true
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, handleBlur, handleChange, handleSubmit, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information Section */}
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  المعلومات الأساسية
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={Boolean(touched.name && errors.name)}>
                  <InputLabel htmlFor="name">الاسم</InputLabel>
                  <OutlinedInput
                    id="name"
                    name="name"
                    label="الاسم"
                    value={values.name}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  {touched.name && errors.name && <FormHelperText error>{errors.name}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={Boolean(touched.code && errors.code)}>
                  <InputLabel htmlFor="code">الرمز</InputLabel>
                  <OutlinedInput
                    id="code"
                    name="code"
                    label="الرمز"
                    value={values.code}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  {touched.code && errors.code && <FormHelperText error>{errors.code}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Contact Information Section */}
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ mb: 2, mt: 2 }}>
                  معلومات الاتصال
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={Boolean(touched.phone && errors.phone)}>
                  <InputLabel htmlFor="phone">الهاتف</InputLabel>
                  <OutlinedInput
                    id="phone"
                    name="phone"
                    label="الهاتف"
                    value={values.phone}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  {touched.phone && errors.phone && <FormHelperText error>{errors.phone}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={Boolean(touched.email && errors.email)}>
                  <InputLabel htmlFor="email">البريد الإلكتروني</InputLabel>
                  <OutlinedInput
                    id="email"
                    name="email"
                    type="email"
                    label="البريد الإلكتروني"
                    value={values.email}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  {touched.email && errors.email && <FormHelperText error>{errors.email}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={Boolean(touched.contactPerson && errors.contactPerson)}>
                  <InputLabel htmlFor="contactPerson">الشخص المسؤول</InputLabel>
                  <OutlinedInput
                    id="contactPerson"
                    name="contactPerson"
                    label="الشخص المسؤول"
                    value={values.contactPerson}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  {touched.contactPerson && errors.contactPerson && (
                    <FormHelperText error>{errors.contactPerson}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={Boolean(touched.address && errors.address)}>
                  <InputLabel htmlFor="address">العنوان</InputLabel>
                  <OutlinedInput
                    id="address"
                    name="address"
                    label="العنوان"
                    value={values.address}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  {touched.address && errors.address && <FormHelperText error>{errors.address}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Status Section */}
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ mb: 2, mt: 2 }}>
                  الحالة
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      id="active"
                      name="active"
                      checked={values.active}
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label="نشط"
                />
              </Grid>

              {submitError && (
                <Grid item xs={12}>
                  <FormHelperText error>{submitError}</FormHelperText>
                </Grid>
              )}

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate('/insurance-companies')}
                    disabled={updating}
                  >
                    إلغاء
                  </Button>
                  <Button variant="contained" type="submit" disabled={updating}>
                    {updating ? 'جاري الحفظ...' : 'حفظ'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </MainCard>
  );
};

export default InsuranceCompanyEdit;
