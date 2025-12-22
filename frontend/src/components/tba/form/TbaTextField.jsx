/**
 * TbaTextField - Unified Text Field Component
 * Phase D3 - TbaForm System (Mantis-Native)
 *
 * ⚠️ CONTRACT:
 * - Wrapper around MUI TextField
 * - Unified styling: size="small", fullWidth
 * - Supports readOnly mode for View pages
 * - RTL compatible
 *
 * Usage:
 * <TbaTextField
 *   label="الاسم (عربي)"
 *   value={form.nameAr}
 *   required
 *   error={errors.nameAr}
 *   onChange={handleChange('nameAr')}
 * />
 */

import PropTypes from 'prop-types';

// MUI Components
import { TextField, InputAdornment } from '@mui/material';

// ============================================================================
// COMPONENT
// ============================================================================

const TbaTextField = ({
  label,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  placeholder,
  type = 'text',
  multiline = false,
  rows = 4,
  startAdornment,
  endAdornment,
  sx = {},
  ...rest
}) => {
  // Build InputProps
  const inputProps = {};

  if (readOnly) {
    inputProps.readOnly = true;
  }

  if (startAdornment) {
    inputProps.startAdornment = <InputAdornment position="start">{startAdornment}</InputAdornment>;
  }

  if (endAdornment) {
    inputProps.endAdornment = <InputAdornment position="end">{endAdornment}</InputAdornment>;
  }

  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      value={value ?? ''}
      onChange={onChange}
      error={!!error}
      helperText={error || helperText}
      required={required}
      disabled={disabled || readOnly}
      placeholder={placeholder}
      type={type}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      InputProps={Object.keys(inputProps).length > 0 ? inputProps : undefined}
      sx={{
        '& .MuiOutlinedInput-root': {
          bgcolor: readOnly ? 'action.hover' : 'background.paper'
        },
        ...sx
      }}
      {...rest}
    />
  );
};

TbaTextField.propTypes = {
  /** Field label */
  label: PropTypes.string.isRequired,
  /** Field value */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Change handler */
  onChange: PropTypes.func,
  /** Error message */
  error: PropTypes.string,
  /** Helper text (shown when no error) */
  helperText: PropTypes.string,
  /** Required field indicator */
  required: PropTypes.bool,
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Read-only mode (for View pages) */
  readOnly: PropTypes.bool,
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Input type */
  type: PropTypes.string,
  /** Enable multiline */
  multiline: PropTypes.bool,
  /** Rows for multiline */
  rows: PropTypes.number,
  /** Start adornment */
  startAdornment: PropTypes.node,
  /** End adornment */
  endAdornment: PropTypes.node,
  /** Additional styles */
  sx: PropTypes.object
};

export default TbaTextField;
