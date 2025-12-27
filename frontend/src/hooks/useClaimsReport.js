import { useState, useEffect, useCallback, useMemo } from 'react';
import axiosClient from 'utils/axios';

/**
 * Claim Status Constants
 * Must match backend ClaimStatus enum exactly
 */
export const CLAIM_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  RETURNED_FOR_INFO: 'RETURNED_FOR_INFO',
  SETTLED: 'SETTLED'
};

/**
 * All claim statuses for filter dropdown
 */
export const ALL_CLAIM_STATUSES = Object.values(CLAIM_STATUS);

/**
 * Arabic labels for claim statuses
 */
export const CLAIM_STATUS_LABELS = {
  [CLAIM_STATUS.DRAFT]: 'مسودة',
  [CLAIM_STATUS.SUBMITTED]: 'مقدمة',
  [CLAIM_STATUS.UNDER_REVIEW]: 'قيد المراجعة',
  [CLAIM_STATUS.APPROVED]: 'موافق عليها',
  [CLAIM_STATUS.REJECTED]: 'مرفوضة',
  [CLAIM_STATUS.RETURNED_FOR_INFO]: 'مُرجعة للاستكمال',
  [CLAIM_STATUS.SETTLED]: 'تمت التسوية'
};

/**
 * Helper to unwrap API response
 */
const unwrap = (response) => response.data?.data ?? response.data;

/**
 * Default filter state
 */
export const DEFAULT_FILTERS = {
  statuses: [],           // Empty = all statuses
  memberSearch: '',       // Text search on member name
  minRequestedAmount: '', // Minimum requested amount
  maxRequestedAmount: '', // Maximum requested amount
  minApprovedAmount: '',  // Minimum approved amount
  maxApprovedAmount: ''   // Maximum approved amount
};

/**
 * useClaimsReport Hook
 * 
 * Fetches claims for operational reporting with client-side filtering.
 * 
 * @param {Object} options
 * @param {number|null} options.employerId - Employer ID for filtering
 * @param {Object} options.filters - Filter criteria
 * @returns {Object} Claims data, loading states, error, and utilities
 * 
 * Architecture: Employer → Member → Claim
 * Data Source: GET /api/claims?employerId={id}
 */
export const useClaimsReport = ({ employerId, filters = DEFAULT_FILTERS } = {}) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 100,
    totalElements: 0,
    totalPages: 0
  });

  /**
   * Fetch claims from API
   */
  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        size: 9999 // Fetch all for client-side filtering
      };
      
      if (employerId) {
        params.employerId = employerId;
      }

      const response = await axiosClient.get('/claims', { params });
      const data = unwrap(response);
      
      // Handle different response formats
      const claimsList = data?.items ?? data?.content ?? data ?? [];
      
      if (!Array.isArray(claimsList)) {
        throw new Error('Invalid claims data format');
      }

      // Map claims to UI-safe model
      const mappedClaims = claimsList.map(claim => ({
        id: claim.id,
        memberName: claim.member?.fullName ?? claim.memberName ?? '—',
        employerName: claim.member?.employerOrganization?.name ?? claim.employerName ?? '—',
        providerName: claim.provider?.name ?? claim.providerName ?? '—',
        status: claim.status,
        requestedAmount: parseFloat(claim.requestedAmount) || 0,
        approvedAmount: claim.approvedAmount != null ? parseFloat(claim.approvedAmount) : null,
        visitDate: claim.visitDate,
        updatedAt: claim.updatedAt,
        // Keep raw for potential drill-down
        _raw: claim
      }));

      setClaims(mappedClaims);
      setPagination({
        page: data?.page ?? 0,
        size: data?.size ?? mappedClaims.length,
        totalElements: data?.total ?? data?.totalElements ?? mappedClaims.length,
        totalPages: data?.totalPages ?? 1
      });

    } catch (err) {
      console.error('❌ Failed to fetch claims:', err);
      setError(err.message || 'فشل في تحميل المطالبات');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [employerId]);

  /**
   * Initial fetch and refetch on employerId change
   */
  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  /**
   * Apply client-side filters
   */
  const filteredClaims = useMemo(() => {
    let result = [...claims];

    // Filter by status (multi-select)
    if (filters.statuses && filters.statuses.length > 0) {
      result = result.filter(claim => filters.statuses.includes(claim.status));
    }

    // Filter by member name (text search)
    if (filters.memberSearch && filters.memberSearch.trim()) {
      const search = filters.memberSearch.trim().toLowerCase();
      result = result.filter(claim => 
        claim.memberName.toLowerCase().includes(search)
      );
    }

    // Filter by requested amount range
    if (filters.minRequestedAmount !== '' && !isNaN(parseFloat(filters.minRequestedAmount))) {
      const min = parseFloat(filters.minRequestedAmount);
      result = result.filter(claim => claim.requestedAmount >= min);
    }
    if (filters.maxRequestedAmount !== '' && !isNaN(parseFloat(filters.maxRequestedAmount))) {
      const max = parseFloat(filters.maxRequestedAmount);
      result = result.filter(claim => claim.requestedAmount <= max);
    }

    // Filter by approved amount range
    if (filters.minApprovedAmount !== '' && !isNaN(parseFloat(filters.minApprovedAmount))) {
      const min = parseFloat(filters.minApprovedAmount);
      result = result.filter(claim => 
        claim.approvedAmount != null && claim.approvedAmount >= min
      );
    }
    if (filters.maxApprovedAmount !== '' && !isNaN(parseFloat(filters.maxApprovedAmount))) {
      const max = parseFloat(filters.maxApprovedAmount);
      result = result.filter(claim => 
        claim.approvedAmount != null && claim.approvedAmount <= max
      );
    }

    return result;
  }, [claims, filters]);

  return {
    // Data
    claims: filteredClaims,
    allClaims: claims,
    totalCount: filteredClaims.length,
    totalFetched: claims.length,
    
    // State
    loading,
    error,
    isEmpty: !loading && filteredClaims.length === 0,
    
    // Pagination info (from API)
    pagination,
    
    // Actions
    refetch: fetchClaims
  };
};

export default useClaimsReport;
