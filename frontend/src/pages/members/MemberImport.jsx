/**
 * Member Import Page - Bulk Import from Excel (Odoo Compatible)
 *
 * Features:
 * 1. File upload (drag & drop or click)
 * 2. Preview imported data before saving
 * 3. Validation errors display
 * 4. Progress tracking
 * 5. Import history (logs)
 *
 * Backend: MemberImportController
 *
 * ⚠️ Pattern: ModernPageHeader → MainCard
 */

import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI Components
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  AlertTitle,
  Chip,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Collapse,
  Card,
  CardContent,
  Grid
} from '@mui/material';

// MUI Icons
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoIcon from '@mui/icons-material/Info';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DescriptionIcon from '@mui/icons-material/Description';

// Project Components
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';

// Services
import {
  previewImport,
  executeImport,
  getImportTemplate
} from 'services/api/members.service';

// Snackbar
import { openSnackbar } from 'api/snackbar';

// ============================================================================
// CONSTANTS
// ============================================================================

const STEPS = ['رفع الملف', 'مراجعة البيانات', 'تأكيد الاستيراد'];

const ACCEPTED_FILE_TYPES = '.xlsx,.xls';

const STATUS_COLORS = {
  NEW: 'success',
  UPDATE: 'info',
  ERROR: 'error',
  SKIP: 'warning'
};

const STATUS_LABELS = {
  NEW: 'جديد',
  UPDATE: 'تحديث',
  ERROR: 'خطأ',
  SKIP: 'تخطي'
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MemberImport = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);

  // File state
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Preview state
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  // Import state
  const [importResult, setImportResult] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState(null);

  // Template state
  const [templateInfo, setTemplateInfo] = useState(null);
  const [showTemplateInfo, setShowTemplateInfo] = useState(false);

  // ========================================
  // FILE HANDLING
  // ========================================

  const handleFileSelect = useCallback((file) => {
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      openSnackbar({
        message: 'يرجى اختيار ملف Excel (.xlsx أو .xls)',
        variant: 'error'
      });
      return;
    }

    setSelectedFile(file);
    setPreviewData(null);
    setPreviewError(null);
    setImportResult(null);
    setImportError(null);
  }, []);

  const handleFileInputChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer?.files?.[0];
      handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setPreviewData(null);
    setPreviewError(null);
    setActiveStep(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // ========================================
  // PREVIEW HANDLING
  // ========================================

  const handlePreview = useCallback(async () => {
    if (!selectedFile) return;

    setPreviewLoading(true);
    setPreviewError(null);

    try {
      const result = await previewImport(selectedFile);
      setPreviewData(result);
      setActiveStep(1);

      if (result.errorCount > 0) {
        openSnackbar({
          message: `تم العثور على ${result.errorCount} خطأ في البيانات`,
          variant: 'warning'
        });
      } else {
        openSnackbar({
          message: 'تمت معاينة البيانات بنجاح',
          variant: 'success'
        });
      }
    } catch (err) {
      console.error('[MemberImport] Preview failed:', err);
      const errorMessage = err.response?.data?.message || 'فشل في قراءة الملف';
      setPreviewError(errorMessage);
      openSnackbar({
        message: errorMessage,
        variant: 'error'
      });
    } finally {
      setPreviewLoading(false);
    }
  }, [selectedFile]);

  // ========================================
  // IMPORT EXECUTION
  // ========================================

  const handleExecuteImport = useCallback(async () => {
    if (!selectedFile || !previewData?.batchId) return;

    // Confirm before import
    const confirmMessage = `سيتم استيراد ${previewData.validCount || 0} سجل جديد و تحديث ${previewData.updateCount || 0} سجل موجود. هل تريد المتابعة؟`;
    if (!window.confirm(confirmMessage)) return;

    setImportLoading(true);
    setImportError(null);

    try {
      const result = await executeImport(selectedFile, previewData.batchId);
      setImportResult(result);
      setActiveStep(2);

      openSnackbar({
        message: `تم استيراد ${result.createdCount || 0} سجل جديد و تحديث ${result.updatedCount || 0} سجل بنجاح`,
        variant: 'success'
      });
    } catch (err) {
      console.error('[MemberImport] Import failed:', err);
      const errorMessage = err.response?.data?.message || 'فشل في استيراد البيانات';
      setImportError(errorMessage);
      openSnackbar({
        message: errorMessage,
        variant: 'error'
      });
    } finally {
      setImportLoading(false);
    }
  }, [selectedFile, previewData]);

  // ========================================
  // TEMPLATE INFO
  // ========================================

  const loadTemplateInfo = useCallback(async () => {
    try {
      const result = await getImportTemplate();
      setTemplateInfo(result);
    } catch (err) {
      console.error('[MemberImport] Failed to load template:', err);
    }
  }, []);

  const handleToggleTemplateInfo = useCallback(() => {
    if (!templateInfo && !showTemplateInfo) {
      loadTemplateInfo();
    }
    setShowTemplateInfo((prev) => !prev);
  }, [templateInfo, showTemplateInfo, loadTemplateInfo]);

  // ========================================
  // NAVIGATION
  // ========================================

  const handleGoBack = useCallback(() => {
    navigate('/members');
  }, [navigate]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setPreviewData(null);
    setPreviewError(null);
    setImportResult(null);
    setImportError(null);
    setActiveStep(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // ========================================
  // RENDER HELPERS
  // ========================================

  const renderFileUploadArea = () => (
    <Box
      sx={{
        border: '2px dashed',
        borderColor: isDragging ? 'primary.main' : selectedFile ? 'success.main' : 'divider',
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        bgcolor: isDragging ? 'action.hover' : 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover'
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleBrowseClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {selectedFile ? (
        <Stack spacing={2} alignItems="center">
          <DescriptionIcon sx={{ fontSize: 48, color: 'success.main' }} />
          <Typography variant="h6" color="success.main">
            {selectedFile.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {(selectedFile.size / 1024).toFixed(2)} KB
          </Typography>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveFile();
            }}
          >
            إزالة الملف
          </Button>
        </Stack>
      ) : (
        <Stack spacing={2} alignItems="center">
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h6">اسحب الملف هنا أو اضغط للاختيار</Typography>
          <Typography variant="body2" color="text.secondary">
            يدعم ملفات Excel (.xlsx, .xls)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            متوافق مع تصدير Odoo hr.employee.public
          </Typography>
        </Stack>
      )}
    </Box>
  );

  const renderPreviewTable = () => {
    if (!previewData?.rows?.length) return null;

    const displayRows = previewData.rows.slice(0, 10);
    const hasMore = previewData.rows.length > 10;

    return (
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary.main">
                  {previewData.totalRows || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي الصفوف
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main">
                  {previewData.validCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  سجلات جديدة
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="info.main">
                  {previewData.updateCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  سجلات للتحديث
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="error.main">
                  {previewData.errorCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  أخطاء
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Data Table Preview */}
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  #
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>الحالة</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>رقم البطاقة</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>الاسم</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>صاحب العمل</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>رقم البوليصة</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>ملاحظات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayRows.map((row, index) => (
                <TableRow
                  key={row.rowNumber || index}
                  sx={{
                    bgcolor: row.status === 'ERROR' ? 'error.lighter' : 'inherit'
                  }}
                >
                  <TableCell align="center">{row.rowNumber || index + 1}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={STATUS_LABELS[row.status] || row.status}
                      color={STATUS_COLORS[row.status] || 'default'}
                    />
                  </TableCell>
                  <TableCell>{row.cardNumber || '-'}</TableCell>
                  <TableCell>{row.fullName || row.fullNameArabic || row.name || '-'}</TableCell>
                  <TableCell>{row.employerName || '-'}</TableCell>
                  <TableCell>{row.policyNumber || '-'}</TableCell>
                  <TableCell>
                    {row.errors?.length > 0 ? (
                      <Tooltip title={row.errors.join(' | ')}>
                        <Typography variant="body2" color="error" noWrap sx={{ maxWidth: 200 }}>
                          {row.errors[0]}
                        </Typography>
                      </Tooltip>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {hasMore && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            يتم عرض أول 10 صفوف من أصل {previewData.rows.length} صف
          </Typography>
        )}
      </Box>
    );
  };

  const renderImportResult = () => {
    if (!importResult) return null;

    return (
      <Box>
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>تم الاستيراد بنجاح</AlertTitle>
          تم استيراد البيانات من الملف
        </Alert>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                <Typography variant="h4">{importResult.createdCount || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  سجلات جديدة
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <RefreshIcon sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                <Typography variant="h4">{importResult.updatedCount || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  سجلات محدثة
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <ErrorIcon sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
                <Typography variant="h4">{importResult.errorCount || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  أخطاء
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <WarningIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4">{importResult.skippedCount || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  تم تخطيها
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="contained" startIcon={<PeopleAltIcon />} onClick={() => navigate('/members')}>
            عرض الأعضاء
          </Button>
          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={handleReset}>
            استيراد ملف آخر
          </Button>
        </Stack>
      </Box>
    );
  };

  const renderTemplateInfo = () => (
    <Collapse in={showTemplateInfo}>
      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          الأعمدة المطلوبة
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>
            <Typography variant="body2">
              <strong>national_id / identification_id / civil_id</strong> - رقم الهوية (إجباري)
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>name / full_name / full_name_arabic</strong> - الاسم الكامل (إجباري)
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>employer / company</strong> - صاحب العمل (إجباري)
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>policy / policy_number</strong> - رقم البوليصة (إجباري)
            </Typography>
          </li>
        </Box>

        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }} gutterBottom>
          الأعمدة الاختيارية
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>
            <Typography variant="body2">
              <strong>full_name_english</strong> - الاسم بالإنجليزية
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>birth_date / date_of_birth / birthday</strong> - تاريخ الميلاد
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>gender</strong> - الجنس (MALE/FEMALE)
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>phone / mobile_phone</strong> - الهاتف
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>email / work_email</strong> - البريد الإلكتروني
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>job_title / job_id / department / work_location</strong> - معلومات الوظيفة (تُحفظ كسمات)
            </Typography>
          </li>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            أي أعمدة غير معروفة سيتم حفظها تلقائياً كسمات مرنة للعضو
          </Typography>
        </Alert>
      </Paper>
    </Collapse>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <Box>
      {/* Page Header */}
      <ModernPageHeader
        title="استيراد الأعضاء"
        subtitle="استيراد بيانات الأعضاء من ملف Excel متوافق مع Odoo"
        icon={UploadFileIcon}
        breadcrumbs={[
          { label: 'الأعضاء', href: '/members' },
          { label: 'استيراد' }
        ]}
        backButton={{
          onClick: handleGoBack,
          label: 'عودة للأعضاء'
        }}
      />

      <MainCard>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        {activeStep === 0 && (
          <Box>
            {renderFileUploadArea()}

            {/* Template Info Toggle */}
            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Button
                variant="text"
                size="small"
                startIcon={showTemplateInfo ? <ExpandLessIcon /> : <InfoIcon />}
                onClick={handleToggleTemplateInfo}
              >
                {showTemplateInfo ? 'إخفاء دليل الأعمدة' : 'عرض دليل الأعمدة'}
              </Button>
            </Stack>
            {renderTemplateInfo()}

            {/* Preview Error */}
            {previewError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {previewError}
              </Alert>
            )}

            {/* Actions */}
            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
              <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleGoBack}>
                إلغاء
              </Button>
              <Button
                variant="contained"
                startIcon={previewLoading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                onClick={handlePreview}
                disabled={!selectedFile || previewLoading}
              >
                {previewLoading ? 'جاري المعاينة...' : 'معاينة البيانات'}
              </Button>
            </Stack>
          </Box>
        )}

        {activeStep === 1 && previewData && (
          <Box>
            {renderPreviewTable()}

            {/* Import Error */}
            {importError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {importError}
              </Alert>
            )}

            {/* Warning for errors */}
            {previewData.errorCount > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                يوجد {previewData.errorCount} صف يحتوي على أخطاء ولن يتم استيرادها
              </Alert>
            )}

            {/* Actions */}
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => {
                  setActiveStep(0);
                  setPreviewData(null);
                }}
              >
                تغيير الملف
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={importLoading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                onClick={handleExecuteImport}
                disabled={importLoading || previewData.validCount === 0}
              >
                {importLoading ? 'جاري الاستيراد...' : 'تأكيد الاستيراد'}
              </Button>
            </Stack>
          </Box>
        )}

        {activeStep === 2 && renderImportResult()}

        {/* Loading Overlay */}
        {(previewLoading || importLoading) && <LinearProgress sx={{ mt: 2 }} />}
      </MainCard>
    </Box>
  );
};

export default MemberImport;
