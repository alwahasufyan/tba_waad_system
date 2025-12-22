/**
 * TbaDetailField - Unified Detail Field Component (View Mode)
 * Phase D3 - TbaForm System (Mantis-Native)
 *
 * ⚠️ CONTRACT:
 * - Read-only display of data
 * - Label + Value format
 * - Fallback to "-" for empty values
 * - RTL compatible
 *
 * Usage:
 * <TbaDetailField
 *   label="الاسم (عربي)"
 *   value={service.nameAr}
 * />
 */

import PropTypes from 'prop-types';

// MUI Components
import { Box, Paper, Typography, Chip, Stack } from '@mui/material';

// ============================================================================
// COMPONENT
// ============================================================================

const TbaDetailField = ({
  label,
  value,
  fallback = '-',
  variant = 'outlined', // 'outlined' | 'standard' | 'filled'
  chip = false,
  chipColor = 'default',
  icon: Icon,
  sx = {}
}) => {
  // Format display value
  const displayValue = value !== null && value !== undefined && value !== '' ? value : fallback;

  // Determine if value is empty
  const isEmpty = displayValue === fallback;

  const content = (
    <Box>
      {/* Label */}
      <Typography variant="caption" color="text.secondary" gutterBottom display="block" sx={{ mb: 0.5 }}>
        {label}
      </Typography>

      {/* Value */}
      <Stack direction="row" alignItems="center" spacing={1}>
        {Icon && <Icon fontSize="small" color={isEmpty ? 'disabled' : 'action'} />}

        {chip ? (
          <Chip label={displayValue} color={chipColor} size="small" variant="light" />
        ) : (
          <Typography variant="body1" fontWeight={isEmpty ? 400 : 500} color={isEmpty ? 'text.disabled' : 'text.primary'}>
            {displayValue}
          </Typography>
        )}
      </Stack>
    </Box>
  );

  if (variant === 'standard') {
    return <Box sx={sx}>{content}</Box>;
  }

  if (variant === 'filled') {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 1,
          ...sx
        }}
      >
        {content}
      </Paper>
    );
  }

  // Default: outlined
  return (
    <Paper variant="outlined" sx={{ p: 2, ...sx }}>
      {content}
    </Paper>
  );
};

TbaDetailField.propTypes = {
  /** Field label */
  label: PropTypes.string.isRequired,
  /** Field value */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  /** Fallback for empty values */
  fallback: PropTypes.string,
  /** Visual variant */
  variant: PropTypes.oneOf(['outlined', 'standard', 'filled']),
  /** Display as chip */
  chip: PropTypes.bool,
  /** Chip color (when chip=true) */
  chipColor: PropTypes.string,
  /** Icon component */
  icon: PropTypes.elementType,
  /** Additional styles */
  sx: PropTypes.object
};

export default TbaDetailField;
