import React from 'react';
import PropTypes from 'prop-types';
import { Chip } from '@mui/material';
import { CLAIM_STATUS, CLAIM_STATUS_LABELS } from 'hooks/useClaimsReport';

/**
 * Color mapping for claim statuses
 * Matches design spec exactly
 */
const STATUS_COLORS = {
  [CLAIM_STATUS.DRAFT]: { bg: '#9e9e9e', color: '#fff' },           // Gray
  [CLAIM_STATUS.SUBMITTED]: { bg: '#2196f3', color: '#fff' },       // Blue
  [CLAIM_STATUS.UNDER_REVIEW]: { bg: '#ff9800', color: '#fff' },    // Orange
  [CLAIM_STATUS.APPROVED]: { bg: '#4caf50', color: '#fff' },        // Green
  [CLAIM_STATUS.REJECTED]: { bg: '#f44336', color: '#fff' },        // Red
  [CLAIM_STATUS.RETURNED_FOR_INFO]: { bg: '#9c27b0', color: '#fff' }, // Purple
  [CLAIM_STATUS.SETTLED]: { bg: '#009688', color: '#fff' }          // Teal
};

/**
 * ClaimStatusChip Component
 * 
 * Displays claim status as a colored chip with Arabic label
 * 
 * @param {string} status - Claim status enum value
 * @param {string} size - Chip size ('small' | 'medium')
 */
const ClaimStatusChip = ({ status, size = 'small' }) => {
  const colors = STATUS_COLORS[status] || { bg: '#9e9e9e', color: '#fff' };
  const label = CLAIM_STATUS_LABELS[status] || status;

  return (
    <Chip
      label={label}
      size={size}
      sx={{
        backgroundColor: colors.bg,
        color: colors.color,
        fontWeight: 500,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        minWidth: 80
      }}
    />
  );
};

ClaimStatusChip.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['small', 'medium'])
};

export default ClaimStatusChip;
