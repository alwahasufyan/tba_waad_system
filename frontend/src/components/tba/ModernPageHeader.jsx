import PropTypes from 'prop-types';
import { Box, Typography, Breadcrumbs, Link, Stack, Chip } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Modern Clean Page Header Component
 * Displays page title, breadcrumbs, and action buttons
 */
const ModernPageHeader = ({ 
  title, 
  subtitle, 
  breadcrumbs = [], 
  actions, 
  statusChip,
  icon: Icon 
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs 
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 1.5 }}
        >
          <Link
            component={RouterLink}
            to="/"
            underline="hover"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            الرئيسية
          </Link>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography key={index} color="text.primary">
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={index}
                component={RouterLink}
                to={crumb.path}
                underline="hover"
                color="inherit"
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Title and Actions Row */}
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="flex-start"
        sx={{ mb: 1 }}
      >
        {/* Title Section */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {Icon && (
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: 'primary.lighter',
                color: 'primary.main'
              }}
            >
              <Icon sx={{ fontSize: '1.5rem' }} />
            </Box>
          )}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
              {statusChip && (
                <Chip 
                  label={statusChip.label} 
                  color={statusChip.color || 'primary'}
                  size="small"
                  sx={{ height: 24 }}
                />
              )}
            </Stack>
            {subtitle && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Actions Section */}
        {actions && (
          <Stack direction="row" spacing={1.5}>
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

ModernPageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string
    })
  ),
  actions: PropTypes.node,
  statusChip: PropTypes.shape({
    label: PropTypes.string.isRequired,
    color: PropTypes.oneOf(['default', 'primary', 'secondary', 'error', 'warning', 'info', 'success'])
  }),
  icon: PropTypes.elementType
};

export default ModernPageHeader;
