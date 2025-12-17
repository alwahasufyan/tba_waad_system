import { useEffect, useState, useCallback } from 'react';
import {
  getBenefitPackages,
  getBenefitPackageById,
  getAllBenefitPackages
} from 'services/api/benefit-packages.service';

/**
 * Hook for fetching paginated benefit packages list
 * @param {Object} initialParams - Initial query parameters
 * @returns {Object} { data, loading, error, params, setParams, refresh }
 */
export const useBenefitPackagesList = (initialParams = {}) => {
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
      const response = await getBenefitPackages(params);

      const paginationData = response?.items ? response : response;

      setData({
        items: paginationData.items || [],
        total: paginationData.total || 0,
        page: paginationData.page || params.page,
        size: paginationData.size || params.size
      });
    } catch (err) {
      console.error('[useBenefitPackages] Failed to load packages list:', err);
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
 * Hook for fetching single benefit package details
 * @param {number} id - Package ID
 * @returns {Object} { data, loading, error, refresh }
 */
export const useBenefitPackageDetails = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getBenefitPackageById(id);
      setData(response);
    } catch (err) {
      console.error('[useBenefitPackages] Failed to load package details:', err);
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
 * Hook for fetching all benefit packages (for dropdowns)
 * @returns {Object} { data, loading, error, refresh }
 */
export const useAllBenefitPackages = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllBenefitPackages();
      setData(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('[useBenefitPackages] Failed to load all packages:', err);
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
