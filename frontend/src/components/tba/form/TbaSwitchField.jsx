/**
 * TbaSwitchField - Unified Switch Field Component
 * Phase D3 - TbaForm System (Mantis-Native)
 *
 * ⚠️ CONTRACT:
 * - Switch with label and helper text
 * - Unified styling
 * - RTL compatible
 * - Mantis theme compliant
 *
 * Usage:
 * <TbaSwitchField
 *   label="تفعيل الخدمة"
 *   helperText="الخدمة نشطة وظاهرة في النظام"
 *   checked={form.active}
 *   onChange={handleChange('active')}
 * />
 */

import PropTypes from 'prop-types';

// MUI Components
import { Box, FormControlLabel, Switch, Typography, Paper, Stack } from '@mui/material';

// ============================================================================
// COMPONENT
// ============================================================================

const TbaSwitchField = ({
  label,
  helperText,
  helperTextOff,
  checked = false,
  onChange,
  disabled = false,
  readOnly = false,
  variant = 'outlined', // 'outlined' | 'standard'
  sx = {}
}) => {
  // Determine helper text based on checked state
  const displayHelperText = checked ? helperText : helperTextOff || helperText;

  const switchControl = (
    <FormControlLabel
      control={<Switch checked={checked} onChange={onChange} disabled={disabled || readOnly} color="primary" />}
      label={
        <Stack spacing={0}>
          <Typography variant="body1" fontWeight={500}>
            {label}
          </Typography>
          {displayHelperText && (
            <Typography variant="caption" color="text.secondary">
              {displayHelperText}
            </Typography>
          )}
        </Stack>
      }
      sx={{ m: 0, alignItems: 'flex-start' }}
    />
  );

  if (variant === 'standard') {
    return <Box sx={sx}>{switchControl}</Box>;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: readOnly ? 'action.hover' : 'background.paper',
        ...sx
      }}
    >
      {switchControl}
    </Paper>
  );
};

TbaSwitchField.propTypes = {
  /** Switch label */
  label: PropTypes.string.isRequired,
  /** Helper text when ON */
  helperText: PropTypes.string,
  /** Helper text when OFF (optional, defaults to helperText) */
  helperTextOff: PropTypes.string,
  /** Checked state */
  checked: PropTypes.bool,
  /** Change handler */
  onChange: PropTypes.func,
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Read-only mode */
  readOnly: PropTypes.bool,
  /** Visual variant */
  variant: PropTypes.oneOf(['outlined', 'standard']),
  /** Additional styles */
  sx: PropTypes.object
};

export default TbaSwitchField;
