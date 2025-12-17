import { useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  Stack
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const MembersBulkUploadDialog = ({ open, onClose, onSuccess }) => {
  const intl = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        enqueueSnackbar(intl.formatMessage({ id: 'common.invalid-file-type' }) || 'Please select an Excel file', {
          variant: 'error'
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      enqueueSnackbar(intl.formatMessage({ id: 'common.select-file' }) || 'Please select a file first', {
        variant: 'warning'
      });
      return;
    }

    // Placeholder functionality - show "Coming Soon" message
    enqueueSnackbar(
      intl.formatMessage({ id: 'members.bulk-upload-coming-soon' }) || 'Bulk upload feature coming soon!',
      {
        variant: 'info'
      }
    );

    // Future implementation:
    // setUploading(true);
    // try {
    //   await membersService.uploadMembersExcel(selectedFile);
    //   enqueueSnackbar('Members uploaded successfully', { variant: 'success' });
    //   onSuccess?.();
    //   handleClose();
    // } catch (error) {
    //   enqueueSnackbar(error.message || 'Upload failed', { variant: 'error' });
    // } finally {
    //   setUploading(false);
    // }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">
            {intl.formatMessage({ id: 'members.bulk-upload' }) || 'Bulk Upload Members'}
          </Typography>
          {!uploading && (
            <Button
              size="small"
              onClick={handleClose}
              startIcon={<CloseIcon />}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              {intl.formatMessage({ id: 'common.close' }) || 'Close'}
            </Button>
          )}
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          <Alert severity="info">
            {intl.formatMessage({ id: 'members.bulk-upload-info' }) ||
              'Upload an Excel file (.xlsx or .xls) containing member data. The file should follow the template format.'}
          </Alert>

          <Box
            sx={{
              border: '2px dashed',
              borderColor: selectedFile ? 'primary.main' : 'divider',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              backgroundColor: selectedFile ? 'primary.lighter' : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'primary.lighter'
              }
            }}
            onClick={() => document.getElementById('file-upload-input').click()}
          >
            <input
              id="file-upload-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            <CloudUploadIcon sx={{ fontSize: 48, color: selectedFile ? 'primary.main' : 'text.secondary', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              {selectedFile
                ? selectedFile.name
                : intl.formatMessage({ id: 'common.click-to-upload' }) || 'Click to select Excel file'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {intl.formatMessage({ id: 'common.supported-formats' }) || 'Supported formats: .xlsx, .xls'}
            </Typography>
          </Box>

          {selectedFile && (
            <Alert severity="success">
              <Typography variant="body2">
                {intl.formatMessage({ id: 'common.file-selected' }) || 'File selected'}: <strong>{selectedFile.name}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {intl.formatMessage({ id: 'common.size' }) || 'Size'}: {(selectedFile.size / 1024).toFixed(2)} KB
              </Typography>
            </Alert>
          )}

          {uploading && (
            <Box>
              <Typography variant="body2" gutterBottom>
                {intl.formatMessage({ id: 'common.uploading' }) || 'Uploading...'}
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={uploading} color="inherit">
          {intl.formatMessage({ id: 'common.cancel' }) || 'Cancel'}
        </Button>
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          variant="contained"
          startIcon={<CloudUploadIcon />}
        >
          {uploading
            ? intl.formatMessage({ id: 'common.uploading' }) || 'Uploading...'
            : intl.formatMessage({ id: 'common.upload' }) || 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MembersBulkUploadDialog;
