/**
 * TbaFormActions - Unified Form Actions Component
 * Phase D3 - TbaForm System (Mantis-Native)
 *
 * ⚠️ CONTRACT:
 * - Save / Cancel buttons
 * - Loading state support
 * - RTL alignment
 * - Sticky footer option
 *
 * Usage:
 * <TbaFormActions
 *   onCancel={handleCancel}
 *   onSubmit={handleSubmit}
 *   submitLabel="حفظ الخدمة"
 *   loading={saving}
 * />
 */

import PropTypes from 'prop-types';

// MUI Components
import { Box, Button, Stack, CircularProgress } from '@mui/material';

// MUI Icons
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

// ============================================================================
// COMPONENT
// ============================================================================

const TbaFormActions = ({
  onSubmit,
  onCancel,
  submitLabel = 'حفظ',
  cancelLabel = 'إلغاء',
  loading = false,
  disabled = false,
  submitIcon: SubmitIcon = SaveIcon,
  cancelIcon: CancelIcon = CloseIcon,
  showCancel = true,
  fullWidth = false,
  sticky = false,
  sx = {}
}) => {
  return (
    <Box
      sx={{
        pt: 3,
        mt: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        ...(sticky && {
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          zIndex: 10,
          pb: 1
        }),
        ...sx
      }}
    >
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        {/* Cancel Button */}
        {showCancel && (
          <Button
            variant="outlined"
            color="inherit"
            onClick={onCancel}
            disabled={loading}
            startIcon={CancelIcon && <CancelIcon />}
            fullWidth={fullWidth}
          >
            {cancelLabel}
          </Button>
        )}

        {/* Submit Button */}
        <Button
          type={onSubmit ? 'button' : 'submit'}
          variant="contained"
          color="primary"
          onClick={onSubmit}
          disabled={loading || disabled}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : SubmitIcon ? <SubmitIcon /> : undefined}
          fullWidth={fullWidth}
        >
          {loading ? 'جاري الحفظ...' : submitLabel}
        </Button>
      </Stack>
    </Box>
  );
};

TbaFormActions.propTypes = {
  /** Submit handler (if not using form submit) */
  onSubmit: PropTypes.func,
  /** Cancel handler */
  onCancel: PropTypes.func,
  /** Submit button label */
  submitLabel: PropTypes.string,
  /** Cancel button label */
  cancelLabel: PropTypes.string,
  /** Loading state */
  loading: PropTypes.bool,
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Submit button icon */
  submitIcon: PropTypes.elementType,
  /** Cancel button icon */
  cancelIcon: PropTypes.elementType,
  /** Show cancel button */
  showCancel: PropTypes.bool,
  /** Full width buttons */
  fullWidth: PropTypes.bool,
  /** Sticky footer mode */
  sticky: PropTypes.bool,
  /** Additional styles */
  sx: PropTypes.object
};

export default TbaFormActions;
