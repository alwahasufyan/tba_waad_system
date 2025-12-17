import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch
} from '@mui/material';
import { ArrowBack, Edit as EditIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import {
  usePolicyDetails,
  useBenefitPackages,
  useCreateBenefitPackage,
  useUpdateBenefitPackage,
  useDeleteBenefitPackage
} from 'hooks/usePolicies';

const PolicyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { policy, loading: loadingPolicy } = usePolicyDetails(id);
  const { packages, loading: loadingPackages, refresh: refreshPackages } = useBenefitPackages(id);
  const { create: createPackage, creating: creatingPackage } = useCreateBenefitPackage();
  const { update: updatePackage, updating: updatingPackage } = useUpdateBenefitPackage();
  const { remove: deletePackage, deleting: deletingPackage } = useDeleteBenefitPackage();

  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageFormData, setPackageFormData] = useState({
    name: '',
    code: '',
    maxLimit: '',
    copayPercentage: '',
    coverageDescription: '',
    active: true
  });
  const [packageFormErrors, setPackageFormErrors] = useState({});

  const handleBack = () => {
    navigate('/policies');
  };

  const handleEdit = () => {
    navigate(`/policies/edit/${id}`);
  };

  const handleAddPackage = () => {
    setEditingPackage(null);
    setPackageFormData({
      name: '',
      code: '',
      maxLimit: '',
      copayPercentage: '',
      coverageDescription: '',
      active: true
    });
    setPackageFormErrors({});
    setPackageDialogOpen(true);
  };

  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setPackageFormData({
      name: pkg.name || '',
      code: pkg.code || '',
      maxLimit: pkg.maxLimit || '',
      copayPercentage: pkg.copayPercentage || '',
      coverageDescription: pkg.coverageDescription || '',
      active: pkg.active ?? true
    });
    setPackageFormErrors({});
    setPackageDialogOpen(true);
  };

  const handleDeletePackage = async (packageId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الباقة؟')) {
      try {
        await deletePackage(packageId);
        refreshPackages();
      } catch (error) {
        console.error('Delete package error:', error);
      }
    }
  };

  const handlePackageFormChange = (e) => {
    const { name, value } = e.target;
    setPackageFormData({ ...packageFormData, [name]: value });
    if (packageFormErrors[name]) {
      setPackageFormErrors({ ...packageFormErrors, [name]: null });
    }
  };

  const handlePackageSwitchChange = (e) => {
    setPackageFormData({ ...packageFormData, active: e.target.checked });
  };

  const validatePackageForm = () => {
    const errors = {};

    if (!packageFormData.name?.trim()) {
      errors.name = 'اسم الباقة مطلوب';
    }

    if (!packageFormData.code?.trim()) {
      errors.code = 'كود الباقة مطلوب';
    }

    if (packageFormData.maxLimit && isNaN(Number(packageFormData.maxLimit))) {
      errors.maxLimit = 'الحد الأقصى يجب أن يكون رقماً';
    }

    if (packageFormData.copayPercentage) {
      const copay = Number(packageFormData.copayPercentage);
      if (isNaN(copay) || copay < 0 || copay > 100) {
        errors.copayPercentage = 'نسبة المشاركة يجب أن تكون بين 0 و 100';
      }
    }

    setPackageFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePackageSubmit = async () => {
    if (!validatePackageForm()) {
      return;
    }

    try {
      const payload = {
        name: packageFormData.name.trim(),
        code: packageFormData.code.trim(),
        maxLimit: packageFormData.maxLimit ? Number(packageFormData.maxLimit) : null,
        copayPercentage: packageFormData.copayPercentage ? Number(packageFormData.copayPercentage) : null,
        coverageDescription: packageFormData.coverageDescription?.trim() || null,
        active: packageFormData.active
      };

      if (editingPackage) {
        await updatePackage(editingPackage.id, payload);
      } else {
        await createPackage(id, payload);
      }

      setPackageDialogOpen(false);
      refreshPackages();
    } catch (error) {
      console.error('Package save error:', error);
    }
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
    <>
      <MainCard
        title="تفاصيل السياسة التأمينية"
        secondary={
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<ArrowBack />} onClick={handleBack}>
              رجوع
            </Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit}>
              تعديل
            </Button>
          </Stack>
        }
      >
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              المعلومات الأساسية
            </Typography>
            <Divider />
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                اسم السياسة
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {policy.name}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                كود السياسة
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {policy.code}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                الوصف
              </Typography>
              <Typography variant="body1">{policy.description || '-'}</Typography>
            </Paper>
          </Grid>

          {/* Company Information */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom>
              معلومات شركة التأمين
            </Typography>
            <Divider />
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                اسم الشركة
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {policy.insuranceCompanyName}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                كود الشركة
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {policy.insuranceCompanyCode}
              </Typography>
            </Paper>
          </Grid>

          {/* Date and Status */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                تاريخ البدء
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {new Date(policy.startDate).toLocaleDateString('ar-SA')}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                تاريخ الانتهاء
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {policy.endDate ? new Date(policy.endDate).toLocaleDateString('ar-SA') : '-'}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                الحالة
              </Typography>
              <Chip label={policy.active ? 'نشط' : 'غير نشط'} color={policy.active ? 'success' : 'default'} />
            </Paper>
          </Grid>

          {/* Benefit Packages */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">الباقات الطبية</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddPackage}>
                إضافة باقة
              </Button>
            </Stack>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            {loadingPackages ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>اسم الباقة</TableCell>
                      <TableCell>الكود</TableCell>
                      <TableCell align="right">الحد الأقصى</TableCell>
                      <TableCell align="right">نسبة المشاركة %</TableCell>
                      <TableCell align="center">الحالة</TableCell>
                      <TableCell align="center">الإجراءات</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {packages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography>لا توجد باقات</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      packages.map((pkg) => (
                        <TableRow key={pkg.id}>
                          <TableCell>{pkg.name}</TableCell>
                          <TableCell>{pkg.code}</TableCell>
                          <TableCell align="right">{pkg.maxLimit ? pkg.maxLimit.toLocaleString('ar-SA') : '-'}</TableCell>
                          <TableCell align="right">{pkg.copayPercentage || '-'}</TableCell>
                          <TableCell align="center">
                            <Chip label={pkg.active ? 'نشط' : 'غير نشط'} color={pkg.active ? 'success' : 'default'} size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="info" onClick={() => handleEditPackage(pkg)} title="تعديل">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeletePackage(pkg.id)}
                              disabled={deletingPackage}
                              title="حذف"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
        </Grid>
      </MainCard>

      {/* Package Dialog */}
      <Dialog open={packageDialogOpen} onClose={() => setPackageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPackage ? 'تعديل الباقة' : 'إضافة باقة جديدة'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="اسم الباقة"
                name="name"
                value={packageFormData.name}
                onChange={handlePackageFormChange}
                error={!!packageFormErrors.name}
                helperText={packageFormErrors.name}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="كود الباقة"
                name="code"
                value={packageFormData.code}
                onChange={handlePackageFormChange}
                error={!!packageFormErrors.code}
                helperText={packageFormErrors.code}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="الحد الأقصى"
                name="maxLimit"
                type="number"
                value={packageFormData.maxLimit}
                onChange={handlePackageFormChange}
                error={!!packageFormErrors.maxLimit}
                helperText={packageFormErrors.maxLimit}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="نسبة المشاركة %"
                name="copayPercentage"
                type="number"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                value={packageFormData.copayPercentage}
                onChange={handlePackageFormChange}
                error={!!packageFormErrors.copayPercentage}
                helperText={packageFormErrors.copayPercentage}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="وصف التغطية"
                name="coverageDescription"
                value={packageFormData.coverageDescription}
                onChange={handlePackageFormChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel control={<Switch checked={packageFormData.active} onChange={handlePackageSwitchChange} />} label="نشط" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPackageDialogOpen(false)}>إلغاء</Button>
          <Button onClick={handlePackageSubmit} variant="contained" disabled={creatingPackage || updatingPackage}>
            {creatingPackage || updatingPackage ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PolicyView;
