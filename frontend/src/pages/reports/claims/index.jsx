import React, { useState } from 'react';
import useEmployerScope from 'hooks/useEmployerScope';
import useClaimsReport, { DEFAULT_FILTERS } from 'hooks/useClaimsReport';

// MUI Components
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  Chip,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';

// MUI Icons
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Components
import MainCard from 'components/MainCard';
import { ClaimsFilters, ClaimsTable } from 'components/reports/claims';

/**
 * Claims Operational Report
 * 
 * READ-ONLY operational view of claims with client-side filtering.
 * 
 * Architecture: Employer → Member → Claim
 * 
 * RBAC:
 * - SUPER_ADMIN / ADMIN → All employers, employer selector enabled
 * - EMPLOYER_ADMIN / REVIEWER → Own employer only, selector disabled
 * - PROVIDER → No access (blocked by route guard)
 * 
 * Known Limitations (documented in UI):
 * - No date range filtering (client-side only)
 * - No backend aggregation
 * - Large datasets paginated client-side
 * - Filters apply to loaded data only
 */
const ClaimsReport = () => {
  // Use centralized employer scope hook (RBAC enforcement)
  const [selectedEmployerId, setSelectedEmployerId] = useState(null);
  const {
    canSelectEmployer,
    effectiveEmployerId,
    employers,
    isEmployerLocked,
    userEmployerId
  } = useEmployerScope(selectedEmployerId);

  // Initialize selected employer for locked roles
  React.useEffect(() => {
    if (isEmployerLocked && userEmployerId && !selectedEmployerId) {
      setSelectedEmployerId(userEmployerId);
    }
  }, [isEmployerLocked, userEmployerId, selectedEmployerId]);

  // State: Filters
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // State: Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Fetch claims data
  const {
    claims,
    totalCount,
    totalFetched,
    loading,
    error,
    isEmpty,
    pagination,
    refetch
  } = useClaimsReport({
    employerId: effectiveEmployerId,
    filters
  });

  // Check if we have partial data (large dataset warning)
  const hasPartialData = pagination.totalElements > totalFetched;

  // Handlers
  const handleEmployerChange = (employerId) => {
    if (canSelectEmployer) {
      setSelectedEmployerId(employerId);
      setPage(0); // Reset pagination on employer change
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset pagination on filter change
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <MainCard
      title="تقرير المطالبات التشغيلي"
      secondary={
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Record count badge */}
          <Chip
            label={`${totalCount} مطالبة`}
            size="small"
            color="primary"
            variant="outlined"
          />

          {/* Refresh Button */}
          <Tooltip title="تحديث البيانات">
            <IconButton
              onClick={refetch}
              disabled={loading}
              color="primary"
            >
              <RefreshIcon
                sx={{
                  fontSize: 20,
                  animation: loading ? 'spin 1s linear infinite' : 'none'
                }}
              />
            </IconButton>
          </Tooltip>
        </Stack>
      }
    >
      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          icon={<WarningIcon />}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Large Dataset Warning */}
      {hasPartialData && (
        <Alert
          severity="warning"
          icon={<ErrorOutlineIcon />}
          sx={{ mb: 2 }}
        >
          <AlertTitle>تحذير: بيانات جزئية</AlertTitle>
          <Typography variant="body2">
            تم تحميل {totalFetched.toLocaleString('ar-SA')} سجل من أصل {pagination.totalElements.toLocaleString('ar-SA')} سجل.
            الفلاتر تطبق على البيانات المحمّلة فقط. النتائج قد تكون غير شاملة.
          </Typography>
        </Alert>
      )}

      {/* Report Limitations Notice - Enhanced */}
      <Alert
        severity="info"
        icon={<InfoIcon />}
        sx={{ mb: 2 }}
      >
        <AlertTitle>حدود التقرير (الإصدار الحالي)</AlertTitle>
        <List dense disablePadding sx={{ mt: 0.5 }}>
          <ListItem disableGutters sx={{ py: 0 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CheckCircleOutlineIcon fontSize="small" color="info" />
            </ListItemIcon>
            <ListItemText 
              primary="لا توجد فلترة بنطاق التاريخ في هذا الإصدار"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem disableGutters sx={{ py: 0 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CheckCircleOutlineIcon fontSize="small" color="info" />
            </ListItemIcon>
            <ListItemText 
              primary="التجميع والحسابات تتم على جانب العميل (Client-side)"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem disableGutters sx={{ py: 0 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CheckCircleOutlineIcon fontSize="small" color="info" />
            </ListItemIcon>
            <ListItemText 
              primary="الفلاتر تطبق على البيانات المحمّلة فقط"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
        </List>
      </Alert>

      {/* Filters */}
      <ClaimsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        employers={employers}
        canSelectEmployer={canSelectEmployer}
        selectedEmployerId={selectedEmployerId}
        onEmployerChange={handleEmployerChange}
      />

      {/* Data Summary */}
      {!loading && totalFetched > 0 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            إجمالي السجلات: <strong>{totalFetched}</strong>
          </Typography>
          {totalCount !== totalFetched && (
            <Typography variant="body2" color="text.secondary">
              | بعد الفلترة: <strong>{totalCount}</strong>
            </Typography>
          )}
        </Box>
      )}

      {/* Claims Table */}
      <ClaimsTable
        claims={claims}
        loading={loading}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {/* CSS for spinner animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </MainCard>
  );
};

export default ClaimsReport;
