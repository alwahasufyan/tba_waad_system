import React, { useState, useMemo } from 'react';
import useAuth from 'contexts/useAuth';
import { useEmployersList } from 'hooks/useEmployers';
import useClaimsReport, { DEFAULT_FILTERS } from 'hooks/useClaimsReport';

// MUI Components
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  Chip
} from '@mui/material';

// MUI Icons
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

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
 * Known Limitations:
 * - No date range filtering (client-side only)
 * - No backend aggregation
 * - Large datasets paginated client-side
 */
const ClaimsReport = () => {
  const { user } = useAuth();

  // RBAC: Determine role-based access
  const userRole = user?.role || user?.roles?.[0];
  const isAdminRole = ['SUPER_ADMIN', 'ADMIN'].includes(userRole);
  const isEmployerLocked = ['EMPLOYER_ADMIN', 'REVIEWER'].includes(userRole);
  const canSelectEmployer = isAdminRole;

  // State: Selected employer
  const [selectedEmployerId, setSelectedEmployerId] = useState(
    isEmployerLocked ? user?.employerId : null
  );

  // State: Filters
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // State: Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Effective employer ID for API calls
  const effectiveEmployerId = isEmployerLocked ? user?.employerId : selectedEmployerId;

  // Fetch employers list (for admin selector)
  const { data: employersData, loading: employersLoading } = useEmployersList();
  const employers = useMemo(() => {
    if (!employersData) return [];
    const list = employersData.items ?? employersData.content ?? employersData;
    return Array.isArray(list) ? list : [];
  }, [employersData]);

  // Fetch claims data
  const {
    claims,
    totalCount,
    totalFetched,
    loading,
    error,
    isEmpty,
    refetch
  } = useClaimsReport({
    employerId: effectiveEmployerId,
    filters
  });

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

      {/* Known Limitations Notice */}
      <Alert
        severity="info"
        icon={<InfoIcon />}
        sx={{ mb: 2 }}
      >
        <Typography variant="body2">
          📊 هذا التقرير يعرض البيانات للفترة الكاملة. فلترة التاريخ غير متاحة في هذا الإصدار.
        </Typography>
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
