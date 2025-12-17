import { useEffect, useState, useCallback } from 'react';
import { getMembers, getMemberById } from 'services/api/members.service';

/**
 * Hook for fetching paginated members list
 * @param {Object} initialParams - Initial query parameters
 * @returns {Object} { data, loading, error, params, setParams, refresh }
 */
export const useMembersList = (initialParams = {}) => {
  const [params, setParams] = useState({
    page: 1,
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'desc',
    search: '',
    ...initialParams
  });

  const [data, setData] = useState({
    items: [],
    total: 0,
    page: 1,
    size: 20
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMembers(params);
      
      // Handle both direct pagination response or wrapped data
      const paginationData = response?.items ? response : response;
      
      setData({
        items: paginationData.items || [],
        total: paginationData.total || 0,
        page: paginationData.page || params.page,
        size: paginationData.size || params.size
      });
    } catch (err) {
      console.error('[useMembers] Failed to load members list:', err);
      setError(err);
      setData({ items: [], total: 0, page: params.page, size: params.size });
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    error,
    params,
    setParams,
    refresh
  };
};

/**
 * Hook for fetching single member details
 * @param {number} id - Member ID
 * @returns {Object} { data, loading, error, refresh }
 */
export const useMemberDetails = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await getMemberById(id);
      
      // Transform MemberViewDto to form-friendly format
      const memberData = {
        ...response,
        // Ensure dates are in correct format for date pickers
        birthDate: response.birthDate || null,
        joinDate: response.joinDate || null,
        startDate: response.startDate || null,
        endDate: response.endDate || null,
        // Ensure enums are uppercase strings
        gender: response.gender || '',
        maritalStatus: response.maritalStatus || '',
        status: response.status || '',
        cardStatus: response.cardStatus || '',
        // Ensure family members array exists
        familyMembers: response.familyMembers || []
      };
      
      setData(memberData);
    } catch (err) {
      console.error('[useMembers] Failed to load member details:', err);
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    error,
    refresh
  };
};

/**
 * Hook for fetching all members (for dropdowns)
 * @returns {Object} { data, loading, error, refresh }
 */
export const useAllMembers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMembers({ page: 1, size: 1000 });
      setData(Array.isArray(response?.items) ? response.items : []);
    } catch (err) {
      console.error('[useMembers] Failed to load all members:', err);
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    error,
    refresh
  };
};
