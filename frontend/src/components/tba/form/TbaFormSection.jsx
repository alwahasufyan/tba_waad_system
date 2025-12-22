/**
 * TbaFormSection - Unified Form Section Component
 * Phase D3 - TbaForm System (Mantis-Native)
 *
 * ⚠️ CONTRACT:
 * - Presentation only - no business logic
 * - RTL compatible
 * - Mantis theme compliant
 *
 * Usage:
 * <TbaFormSection title="المعلومات الأساسية" icon={InfoOutlinedIcon}>
 *   <Grid container spacing={2}>
 *     {children}
 *   </Grid>
 * </TbaFormSection>
 */

import PropTypes from 'prop-types';

// MUI Components
import { Box, Paper, Typography, Stack, Divider } from '@mui/material';

// ============================================================================
// COMPONENT
// ============================================================================

const TbaFormSection = ({ title, subtitle, icon: Icon, children, noPaper = false, sx = {} }) => {
  const content = (
    <Box sx={{ p: noPaper ? 0 : 2.5, ...sx }}>
      {/* Section Header */}
      {title && (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          {Icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 1,
                bgcolor: 'primary.lighter',
                color: 'primary.main'
              }}
            >
              <Icon fontSize="small" />
            </Box>
          )}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      )}

      {/* Divider after header */}
      {title && <Divider sx={{ mb: 2.5 }} />}

      {/* Section Content */}
      {children}
    </Box>
  );

  if (noPaper) {
    return content;
  }

  return (
    <Paper variant="outlined" sx={{ mb: 3, overflow: 'hidden' }}>
      {content}
    </Paper>
  );
};

TbaFormSection.propTypes = {
  /** Section title */
  title: PropTypes.string,
  /** Section subtitle */
  subtitle: PropTypes.string,
  /** Icon component (not JSX) */
  icon: PropTypes.elementType,
  /** Section content */
  children: PropTypes.node,
  /** Disable Paper wrapper */
  noPaper: PropTypes.bool,
  /** Additional styles */
  sx: PropTypes.object
};

export default TbaFormSection;
