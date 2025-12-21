import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
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
import ModernPageHeader from 'components/tba/ModernPageHeader';
import { useCreateInsuranceCompany } from 'hooks/useInsuranceCompanies';

import { Business as BusinessIcon, ArrowBack } from '@mui/icons-material';

// validation schema
const validationSchema = Yup.object({
  name: Yup.string().required('الاسم مطلوب'),
  code: Yup.string().required('الرمز مطلوب'),
  email: Yup.string().email('البريد الإلكتروني غير صحيح'),
  phone: Yup.string(),
  address: Yup.string(),
  contactPerson: Yup.string(),
  active: Yup.boolean()
});

const InsuranceCompanyCreate = () => {
  const navigate = useNavigate();
  const { create, creating } = useCreateInsuranceCompany();
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (values, { setErrors, setStatus }) => {
    try {
      setSubmitError('');
      await create(values);
      setStatus({ success: true });
      navigate('/insurance-companies');
    } catch (err) {
      setStatus({ success: false });
      setSubmitError(err.message || 'فشل في إنشاء شركة التأمين');
      setErrors({ submit: err.message });
    }
  };

  return (
    <>
      <ModernPageHeader
        title="إضافة شركة تأمين جديدة"
        subtitle="إنشاء سجل شركة تأمين جديدة"
        icon={BusinessIcon}
        breadcrumbs={[
          { label: 'شركات التأمين', path: '/insurance-companies' },
          { label: 'إضافة جديد' }
        ]}
        actions={
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/insurance-companies')}>
            عودة
          </Button>
        }
      />

    <MainCard>

      <Formik
        initialValues={{
          name: '',
          code: '',
          email: '',
          phone: '',
          address: '',
          contactPerson: '',
          active: true
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information Section */}
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  البيانات الأساسية للشركة
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={Boolean(touched.name && errors.name)}>
                  <InputLabel htmlFor="name">اسم الشركة *</InputLabel>
                  <OutlinedInput
                    id="name"
                    name="name"
                    label="اسم الشركة *"
                    value={values.name}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  {touched.name && errors.name && <FormHelperText error>{errors.name}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={Boolean(touched.code && errors.code)}>
                  <InputLabel htmlFor="code">الرمز / الكود *</InputLabel>
                  <OutlinedInput
                    id="code"
                    name="code"
                    label="الرمز / الكود *"
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
                  بيانات التواصل
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={Boolean(touched.phone && errors.phone)}>
                  <InputLabel htmlFor="phone">رقم الهاتف</InputLabel>
                  <OutlinedInput
                    id="phone"
                    name="phone"
                    label="رقم الهاتف"
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
                  حالة الشركة
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
                  label="شركة نشطة"
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
                    disabled={creating}
                  >
                    إلغاء
                  </Button>
                  <Button variant="contained" type="submit" disabled={creating}>
                    {creating ? 'جاري الحفظ...' : 'حفظ'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </MainCard>
    </>
  );
};

export default InsuranceCompanyCreate;
