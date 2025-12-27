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
 * Claim status display order (matches state machine)
 */
export const CLAIM_STATUS_ORDER = [
  CLAIM_STATUS.DRAFT,
  CLAIM_STATUS.SUBMITTED,
  CLAIM_STATUS.UNDER_REVIEW,
  CLAIM_STATUS.APPROVED,
  CLAIM_STATUS.REJECTED,
  CLAIM_STATUS.RETURNED_FOR_INFO,
  CLAIM_STATUS.SETTLED
];

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
 * Colors for claim statuses
 */
export const CLAIM_STATUS_COLORS = {
  [CLAIM_STATUS.DRAFT]: 'default',
  [CLAIM_STATUS.SUBMITTED]: 'info',
  [CLAIM_STATUS.UNDER_REVIEW]: 'warning',
  [CLAIM_STATUS.APPROVED]: 'success',
  [CLAIM_STATUS.REJECTED]: 'error',
  [CLAIM_STATUS.RETURNED_FOR_INFO]: 'warning',
  [CLAIM_STATUS.SETTLED]: 'secondary'
};

/**
 * Helper to unwrap API response
 */
const unwrap = (response) => response.data?.data ?? response.data;

/**
 * useEmployerDashboardKPIs Hook
 * 
 * Fetches all KPIs for the Employer Dashboard from existing endpoints.
 * Performs client-side aggregation for status breakdown and amounts.
 * 
 * @param {number|null} employerId - Employer ID for filtering (null = all for admin)
 * @returns {Object} KPI data, loading states, error, and refresh function
 * 
 * Temporal Scope: ALL-TIME aggregates (no date filtering in Phase 1)
 */
export const useEmployerDashboardKPIs = (employerId) => {
  // Individual loading states for progressive UI
  const [membersCount, setMembersCount] = useState({ total: 0, active: 0, loading: true, error: null });
  const [visitsCount, setVisitsCount] = useState({ total: 0, loading: true, error: null });
  const [claimsData, setClaimsData] = useState({
    total: 0,
    byStatus: {},
    approvedAmount: 0,
    rejectedAmount: 0,
    loading: true,
    error: null
  });

  /**
   * Fetch members count with active members breakdown
   */
  const fetchMembersData = useCallback(async () => {
    setMembersCount(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Try primary endpoint first: GET /api/members/count
      const params = employerId ? { employerId } : {};
      let total = 0;
      
      try {
        const countResponse = await axiosClient.get('/members/count', { params });
        total = unwrap(countResponse) ?? 0;
      } catch (countError) {
        // Fallback: GET /api/members?size=1 and read total from pagination
        console.warn('⚠️ /members/count failed, using fallback');
        const listResponse = await axiosClient.get('/members', { params: { ...params, size: 1 } });
        const data = unwrap(listResponse);
        total = data?.total ?? data?.totalElements ?? 0;
      }

      // Fetch all members to count active ones (client-side filter)
      // Note: For large datasets, consider a dedicated /members/count?status=ACTIVE endpoint
      const membersResponse = await axiosClient.get('/members', { 
        params: { ...params, size: 9999 } 
      });
      const membersData = unwrap(membersResponse);
      const members = membersData?.items ?? membersData?.content ?? membersData ?? [];
      
      const activeCount = Array.isArray(members) 
        ? members.filter(m => m.status === 'ACTIVE').length 
        : 0;

      setMembersCount({
        total: total || members.length,
        active: activeCount,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('❌ Failed to fetch members data:', error);
      setMembersCount({
        total: 0,
        active: 0,
        loading: false,
        error: error.message || 'فشل في تحميل بيانات الأعضاء'
      });
    }
  }, [employerId]);

  /**
   * Fetch visits count
   */
  const fetchVisitsData = useCallback(async () => {
    setVisitsCount(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = employerId ? { employerId } : {};
      const response = await axiosClient.get('/visits/count', { params });
      const count = unwrap(response) ?? 0;

      setVisitsCount({
        total: count,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('❌ Failed to fetch visits count:', error);
      setVisitsCount({
        total: 0,
        loading: false,
        error: error.message || 'فشل في تحميل بيانات الزيارات'
      });
    }
  }, [employerId]);

  /**
   * Fetch claims data with status breakdown and amounts
   */
  const fetchClaimsData = useCallback(async () => {
    setClaimsData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = employerId ? { employerId, size: 9999 } : { size: 9999 };
      
      // Fetch all claims for aggregation
      const response = await axiosClient.get('/claims', { params });
      const data = unwrap(response);
      const claims = data?.items ?? data?.content ?? data ?? [];
      
      if (!Array.isArray(claims)) {
        throw new Error('Invalid claims data format');
      }

      // Initialize status counts with ALL statuses = 0
      const byStatus = {};
      CLAIM_STATUS_ORDER.forEach(status => {
        byStatus[status] = 0;
      });

      // Count by status
      claims.forEach(claim => {
        const status = claim.status;
        if (status && byStatus.hasOwnProperty(status)) {
          byStatus[status]++;
        }
      });

      // Calculate approved amount (APPROVED + SETTLED where approvedAmount IS NOT NULL)
      const approvedAmount = claims
        .filter(c => 
          (c.status === CLAIM_STATUS.APPROVED || c.status === CLAIM_STATUS.SETTLED) &&
          c.approvedAmount != null
        )
        .reduce((sum, c) => sum + (parseFloat(c.approvedAmount) || 0), 0);

      // Calculate rejected amount (REJECTED requestedAmount)
      const rejectedAmount = claims
        .filter(c => c.status === CLAIM_STATUS.REJECTED)
        .reduce((sum, c) => sum + (parseFloat(c.requestedAmount) || 0), 0);

      setClaimsData({
        total: claims.length,
        byStatus,
        approvedAmount,
        rejectedAmount,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('❌ Failed to fetch claims data:', error);
      
      // Set default structure even on error
      const byStatus = {};
      CLAIM_STATUS_ORDER.forEach(status => {
        byStatus[status] = 0;
      });

      setClaimsData({
        total: 0,
        byStatus,
        approvedAmount: 0,
        rejectedAmount: 0,
        loading: false,
        error: error.message || 'فشل في تحميل بيانات المطالبات'
      });
    }
  }, [employerId]);

  /**
   * Fetch all data
   */
  const fetchAll = useCallback(() => {
    fetchMembersData();
    fetchVisitsData();
    fetchClaimsData();
  }, [fetchMembersData, fetchVisitsData, fetchClaimsData]);

  /**
   * Initial fetch and refetch on employerId change
   */
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /**
   * Computed: Overall loading state
   */
  const isLoading = membersCount.loading || visitsCount.loading || claimsData.loading;

  /**
   * Computed: Any error occurred
   */
  const hasError = membersCount.error || visitsCount.error || claimsData.error;

  /**
   * Computed: Claims by status array (for display)
   */
  const claimsByStatusArray = useMemo(() => {
    return CLAIM_STATUS_ORDER.map(status => ({
      status,
      label: CLAIM_STATUS_LABELS[status],
      count: claimsData.byStatus[status] ?? 0,
      color: CLAIM_STATUS_COLORS[status]
    }));
  }, [claimsData.byStatus]);

  return {
    // Members KPIs
    totalMembers: membersCount.total,
    activeMembers: membersCount.active,
    membersLoading: membersCount.loading,
    membersError: membersCount.error,

    // Visits KPIs
    totalVisits: visitsCount.total,
    visitsLoading: visitsCount.loading,
    visitsError: visitsCount.error,

    // Claims KPIs
    totalClaims: claimsData.total,
    claimsByStatus: claimsData.byStatus,
    claimsByStatusArray,
    approvedAmount: claimsData.approvedAmount,
    rejectedAmount: claimsData.rejectedAmount,
    claimsLoading: claimsData.loading,
    claimsError: claimsData.error,

    // Overall
    isLoading,
    hasError,
    refresh: fetchAll
  };
};

export default useEmployerDashboardKPIs;
