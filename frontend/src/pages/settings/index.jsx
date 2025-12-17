import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Save, Refresh } from '@mui/icons-material';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import ModernEmptyState from 'components/tba/ModernEmptyState';
import useCompanyUiVisibility from 'hooks/useCompanyUiVisibility';

/**
 * Settings Page - Phase B4
 * Manage UI visibility settings for employer
 */
const SettingsPage = () => {
  const { uiVisibility, setUiVisibility, loadVisibility, saveSettings, loading, saving, error } = useCompanyUiVisibility();
  const [saveSuccess, setSaveSuccess] = useState(false);

  /**
   * Handle toggle change for any visibility setting
   */
  const handleToggle = (section, field) => (event) => {
    setUiVisibility((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: event.target.checked
      }
    }));
    setSaveSuccess(false); // Reset success message when user makes changes
  };

  /**
   * Handle save button click
   */
  const handleSave = async () => {
    const result = await saveSettings();
    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3 seconds
    }
  };

  /**
   * Handle refresh button click
   */
  const handleRefresh = () => {
    setSaveSuccess(false);
    loadVisibility();
  };

  // Show loading state
  if (loading) {
    return (
      <Box>
        <ModernPageHeader title="إعدادات النظام" subtitle="التحكم في ظهور خصائص الواجهة" />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // Show error state
  if (error && !uiVisibility) {
    return (
      <Box>
        <ModernPageHeader title="إعدادات النظام" subtitle="التحكم في ظهور خصائص الواجهة" />
        <ModernEmptyState
          title="خطأ في تحميل الإعدادات"
          description="حدث خطأ أثناء تحميل إعدادات العرض. يرجى المحاولة مرة أخرى."
          height={300}
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <ModernPageHeader
        title="إعدادات النظام"
        subtitle="التحكم في ظهور خصائص الواجهة"
        actions={
          <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh} disabled={saving}>
            إعادة التحميل
          </Button>
        }
      />

      {/* Success Message */}
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          تم حفظ الإعدادات بنجاح
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          حدث خطأ أثناء حفظ الإعدادات. يرجى المحاولة مرة أخرى.
        </Alert>
      )}

      {/* Settings Cards */}
      <Grid container spacing={3}>
        {/* Members Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={<Typography variant="h6">أعضاء التأمين</Typography>}
              subheader="التحكم في ظهور تبويبات صفحة تفاصيل العضو"
            />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={uiVisibility.members?.showFamilyTab || false}
                      onChange={handleToggle('members', 'showFamilyTab')}
                      disabled={saving}
                    />
                  }
                  label="إظهار تبويب العائلة"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={uiVisibility.members?.showDocumentsTab || false}
                      onChange={handleToggle('members', 'showDocumentsTab')}
                      disabled={saving}
                    />
                  }
                  label="إظهار تبويب المستندات"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={uiVisibility.members?.showBenefitsTab || false}
                      onChange={handleToggle('members', 'showBenefitsTab')}
                      disabled={saving}
                    />
                  }
                  label="إظهار تبويب المنافع"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={uiVisibility.members?.showChronicTab || false}
                      onChange={handleToggle('members', 'showChronicTab')}
                      disabled={saving}
                    />
                  }
                  label="إظهار تبويب الأمراض المزمنة"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Claims Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={<Typography variant="h6">المطالبات</Typography>}
              subheader="التحكم في ظهور أقسام صفحة تفاصيل المطالبة"
            />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={uiVisibility.claims?.showFilesSection || false}
                      onChange={handleToggle('claims', 'showFilesSection')}
                      disabled={saving}
                    />
                  }
                  label="إظهار قسم الملفات"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={uiVisibility.claims?.showPaymentsSection || false}
                      onChange={handleToggle('claims', 'showPaymentsSection')}
                      disabled={saving}
                    />
                  }
                  label="إظهار تفاصيل المدفوعات"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={uiVisibility.claims?.showDiagnosisSection || false}
                      onChange={handleToggle('claims', 'showDiagnosisSection')}
                      disabled={saving}
                    />
                  }
                  label="إظهار التشخيص / ICD"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Visits Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={<Typography variant="h6">الزيارات</Typography>}
              subheader="التحكم في ظهور أقسام صفحة تفاصيل الزيارة"
            />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={uiVisibility.visits?.showAttachmentsSection || false}
                      onChange={handleToggle('visits', 'showAttachmentsSection')}
                      disabled={saving}
                    />
                  }
                  label="إظهار المرفقات"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={uiVisibility.visits?.showServiceDetailsSection || false}
                      onChange={handleToggle('visits', 'showServiceDetailsSection')}
                      disabled={saving}
                    />
                  }
                  label="إظهار تفاصيل الخدمة"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Dashboard Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={<Typography variant="h6">لوحة التحكم</Typography>}
              subheader="التحكم في ظهور بطاقات الإحصائيات"
            />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={uiVisibility.dashboard?.showMembersKpi || false}
                      onChange={handleToggle('dashboard', 'showMembersKpi')}
                      disabled={saving}
                    />
                  }
                  label="إظهار بطاقة إجمالي الأعضاء"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={uiVisibility.dashboard?.showClaimsKpi || false}
                      onChange={handleToggle('dashboard', 'showClaimsKpi')}
                      disabled={saving}
                    />
                  }
                  label="إظهار بطاقة إجمالي المطالبات"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={uiVisibility.dashboard?.showVisitsKpi || false}
                      onChange={handleToggle('dashboard', 'showVisitsKpi')}
                      disabled={saving}
                    />
                  }
                  label="إظهار بطاقة إجمالي الزيارات"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Save Button */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsPage;
