/**
 * RBAC User Edit Page - Phase D3 Step 3
 * 2-Step Stepper: User Info → Roles Assignment
 *
 * ⚠️ Key Features:
 * 1. Step 1: Basic info (fullName, email, phone) - username readonly
 * 2. Step 2: Assign roles (multi-select)
 * 3. Password change optional (only if filled)
 * 4. SUPER_ADMIN only access
 * 5. Arabic UI
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// MUI Components
import {
  Box,
  Grid,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Checkbox,
  Paper,
  Stack,
  Chip,
  Collapse
} from '@mui/material';

// MUI Icons
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyIcon from '@mui/icons-material/Key';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import TbaFormSection from 'components/tba/form/TbaFormSection';
import CircularLoader from 'components/CircularLoader';

// Contexts
import { useTableRefresh } from 'contexts/TableRefreshContext';

// Services
import { usersService, rolesService } from 'services/rbac';

// Snackbar
import { openSnackbar } from 'api/snackbar';

// ============================================================================
// CONSTANTS
// ============================================================================

const STEPS = ['معلومات المستخدم', 'تعيين الأدوار'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get role color based on role name
 */
const getRoleColor = (roleName) => {
  const roleColors = {
    SUPER_ADMIN: 'error',
    ADMIN: 'warning',
    MANAGER: 'info',
    EMPLOYER: 'primary',
    REVIEWER: 'secondary',
    MEMBER: 'default'
  };
  return roleColors[roleName] || 'primary';
};

/**
 * Validate Step 1 fields (Edit mode - password optional)
 */
const validateStep1 = (form, changePassword) => {
  const errors = {};

  if (!form.fullName?.trim()) {
    errors.fullName = 'الاسم الكامل مطلوب';
  }

  if (!form.email?.trim()) {
    errors.email = 'البريد الإلكتروني مطلوب';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'البريد الإلكتروني غير صالح';
  }

  // Password validation only if changing password
  if (changePassword) {
    if (!form.newPassword) {
      errors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (form.newPassword.length < 6) {
      errors.newPassword = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (form.newPassword !== form.confirmPassword) {
      errors.confirmPassword = 'كلمة المرور غير متطابقة';
    }
  }

  return errors;
};

// ============================================================================
// STEP 1 COMPONENT - User Info (Edit Mode)
// ============================================================================

const Step1UserInfoEdit = ({ form, setForm, errors, setErrors, changePassword, setChangePassword }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  return (
    <TbaFormSection title="معلومات المستخدم الأساسية" icon={PersonIcon}>
      <Grid container spacing={2.5}>
        {/* Username (readonly) */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="اسم المستخدم"
            value={form.username}
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              )
            }}
            helperText="لا يمكن تغيير اسم المستخدم"
          />
        </Grid>

        {/* Full Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="الاسم الكامل"
            value={form.fullName}
            onChange={handleChange('fullName')}
            error={!!errors.fullName}
            helperText={errors.fullName}
            required
          />
        </Grid>

        {/* Email */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="البريد الإلكتروني"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            error={!!errors.email}
            helperText={errors.email}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              )
            }}
          />
        </Grid>

        {/* Phone */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="رقم الهاتف"
            value={form.phone}
            onChange={handleChange('phone')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="action" />
                </InputAdornment>
              )
            }}
          />
        </Grid>

        {/* Active Status */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch checked={form.active} onChange={handleChange('active')} color="primary" />
            }
            label="المستخدم نشط"
          />
        </Grid>

        {/* Change Password Section */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                  color="warning"
                />
              }
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <KeyIcon color="warning" fontSize="small" />
                  <Typography>تغيير كلمة المرور</Typography>
                </Stack>
              }
            />

            <Collapse in={changePassword}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* New Password */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="كلمة المرور الجديدة"
                    type={showPassword ? 'text' : 'password'}
                    value={form.newPassword || ''}
                    onChange={handleChange('newPassword')}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword}
                    required={changePassword}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                {/* Confirm Password */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="تأكيد كلمة المرور الجديدة"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword || ''}
                    onChange={handleChange('confirmPassword')}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    required={changePassword}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>
            </Collapse>
          </Paper>
        </Grid>
      </Grid>
    </TbaFormSection>
  );
};

// ============================================================================
// STEP 2 COMPONENT - Roles Assignment
// ============================================================================

const Step2Roles = ({ selectedRoles, setSelectedRoles, allRoles, loading }) => {
  const handleToggleRole = (roleId) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId);
      }
      return [...prev, roleId];
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TbaFormSection title="تعيين الأدوار للمستخدم" subtitle="اختر دوراً واحداً أو أكثر" icon={AdminPanelSettingsIcon}>
      <Alert severity="info" sx={{ mb: 2 }}>
        الأدوار تحدد صلاحيات المستخدم في النظام. يمكنك تعيين أكثر من دور للمستخدم.
      </Alert>

      <Grid container spacing={2}>
        {allRoles.map((role) => {
          const isSelected = selectedRoles.includes(role?.id);
          const roleName = role?.name || '';
          const isProtected = roleName === 'SUPER_ADMIN';

          return (
            <Grid item xs={12} sm={6} md={4} key={role?.id}>
              <Paper
                onClick={() => !isProtected && handleToggleRole(role?.id)}
                elevation={isSelected ? 3 : 0}
                sx={{
                  p: 2,
                  cursor: isProtected ? 'not-allowed' : 'pointer',
                  border: '2px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                  opacity: isProtected ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: isProtected ? 'divider' : 'primary.light',
                    bgcolor: isProtected ? 'background.paper' : isSelected ? 'primary.lighter' : 'grey.50'
                  }
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Checkbox
                    checked={isSelected}
                    disabled={isProtected}
                    onChange={() => handleToggleRole(role?.id)}
                    sx={{ p: 0, mt: 0.25 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle2" fontWeight="medium">
                        {role?.nameAr || role?.name || '-'}
                      </Typography>
                      <Chip
                        label={roleName}
                        size="small"
                        color={getRoleColor(roleName)}
                        variant="light"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {role?.description || `${role?.permissions?.length || 0} صلاحية`}
                    </Typography>
                  </Box>
                  {isSelected && <CheckCircleIcon color="primary" fontSize="small" />}
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {allRoles.length === 0 && (
        <Alert severity="warning">لا توجد أدوار متاحة في النظام</Alert>
      )}

      {/* Selected roles summary */}
      {selectedRoles.length > 0 && (
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            الأدوار المختارة ({selectedRoles.length}):
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {selectedRoles.map((roleId) => {
              const role = allRoles.find((r) => r?.id === roleId);
              return (
                <Chip
                  key={roleId}
                  label={role?.nameAr || role?.name || roleId}
                  color={getRoleColor(role?.name)}
                  size="small"
                  onDelete={() => handleToggleRole(roleId)}
                />
              );
            })}
          </Stack>
        </Box>
      )}
    </TbaFormSection>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { triggerRefresh } = useTableRefresh();

  // State
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    active: true,
    newPassword: '',
    confirmPassword: ''
  });
  const [originalRoleIds, setOriginalRoleIds] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [submitError, setSubmitError] = useState(null);
  const [changePassword, setChangePassword] = useState(false);

  // Load user and roles on mount
  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setRolesLoading(true);

      const [userRes, rolesRes] = await Promise.all([
        usersService.getUserById(id),
        rolesService.getAllRoles()
      ]);

      const user = userRes?.data?.data || userRes?.data;
      const roles = rolesRes?.data?.data || rolesRes?.data || [];

      if (user) {
        setForm({
          username: user.username || '',
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          active: user.active !== false && user.enabled !== false,
          newPassword: '',
          confirmPassword: ''
        });

        // Set current roles
        const currentRoleIds = (user.roles || []).map((r) => r?.id);
        setOriginalRoleIds(currentRoleIds);
        setSelectedRoles(currentRoleIds);
      }

      setAllRoles(Array.isArray(roles) ? roles : []);
    } catch (err) {
      console.error('[UserEdit] Load error:', err);
      setSubmitError(err?.response?.data?.message || 'فشل تحميل بيانات المستخدم');
    } finally {
      setLoading(false);
      setRolesLoading(false);
    }
  };

  // ========================================
  // STEP NAVIGATION
  // ========================================

  const handleNext = () => {
    if (activeStep === 0) {
      const step1Errors = validateStep1(form, changePassword);
      if (Object.keys(step1Errors).length > 0) {
        setErrors(step1Errors);
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // ========================================
  // SUBMIT HANDLER
  // ========================================

  const handleSubmit = useCallback(async () => {
    try {
      setSaving(true);
      setSubmitError(null);

      // Prepare update payload
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || null,
        active: form.active
      };

      // Add password if changing
      if (changePassword && form.newPassword) {
        payload.password = form.newPassword;
      }

      // Update user info
      await usersService.updateUser(id, payload);

      // Handle role changes
      const rolesToAdd = selectedRoles.filter((r) => !originalRoleIds.includes(r));
      const rolesToRemove = originalRoleIds.filter((r) => !selectedRoles.includes(r));

      if (rolesToAdd.length > 0) {
        await usersService.assignRoles(id, rolesToAdd);
      }
      if (rolesToRemove.length > 0) {
        await usersService.removeRoles(id, rolesToRemove);
      }

      // Success
      openSnackbar({
        open: true,
        message: 'تم تحديث المستخدم بنجاح',
        variant: 'alert',
        alert: { color: 'success' }
      });

      // Refresh list and navigate
      triggerRefresh();
      navigate('/rbac/users');
    } catch (err) {
      console.error('[UserEdit] Submit error:', err);
      const errorMessage = err?.response?.data?.message || 'فشل تحديث المستخدم. يرجى المحاولة لاحقاً';
      setSubmitError(errorMessage);

      openSnackbar({
        open: true,
        message: errorMessage,
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setSaving(false);
    }
  }, [form, selectedRoles, originalRoleIds, changePassword, id, triggerRefresh, navigate]);

  // ========================================
  // LOADING STATE
  // ========================================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularLoader />
      </Box>
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <Box>
      {/* Page Header */}
      <ModernPageHeader
        title={`تعديل المستخدم: ${form.username}`}
        subtitle="تعديل بيانات المستخدم وأدواره"
        icon={EditIcon}
        breadcrumbs={[
          { label: 'الرئيسية', path: '/' },
          { label: 'الصلاحيات', path: '/rbac' },
          { label: 'المستخدمين', path: '/rbac/users' },
          { label: 'تعديل' }
        ]}
        actions={
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/rbac/users')}>
            العودة للقائمة
          </Button>
        }
      />

      {/* Stepper */}
      <MainCard sx={{ mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label, index) => (
            <Step key={label} completed={activeStep > index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </MainCard>

      {/* Error Alert */}
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      {/* Step Content */}
      <MainCard>
        {activeStep === 0 && (
          <Step1UserInfoEdit
            form={form}
            setForm={setForm}
            errors={errors}
            setErrors={setErrors}
            changePassword={changePassword}
            setChangePassword={setChangePassword}
          />
        )}

        {activeStep === 1 && (
          <Step2Roles
            selectedRoles={selectedRoles}
            setSelectedRoles={setSelectedRoles}
            allRoles={allRoles}
            loading={rolesLoading}
          />
        )}

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0 || saving}
            startIcon={<ArrowForwardIcon />}
          >
            السابق
          </Button>

          {activeStep === STEPS.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            >
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext} endIcon={<ArrowBackIcon />}>
              التالي
            </Button>
          )}
        </Box>
      </MainCard>
    </Box>
  );
};

export default UserEdit;
