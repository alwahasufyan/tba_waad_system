import { useState, useEffect, useCallback } from 'react';
import { insuranceCompaniesService } from 'services/api';

/**
 * Hook for managing paginated insurance companies list
 * @param {Object} initialParams - Initial query parameters
 * @returns {Object} - {data, loading, error, params, setParams, refresh}
 */
export const useInsuranceCompaniesList = (initialParams = { page: 1, size: 10 }) => {
  const [data, setData] = useState({ items: [], total: 0, page: 1, size: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await insuranceCompaniesService.getAll(params);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch insurance companies');
      console.error('Error fetching insurance companies:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    params,
    setParams,
    refresh: fetchData
  };
};

/**
 * Hook for managing single insurance company details
 * @param {number} id - Insurance company ID
 * @returns {Object} - {insuranceCompany, loading, error, refresh}
 */
export const useInsuranceCompanyDetails = (id) => {
  const [insuranceCompany, setInsuranceCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const result = await insuranceCompaniesService.getById(id);
      setInsuranceCompany(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch insurance company details');
      console.error('Error fetching insurance company:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    insuranceCompany,
    loading,
    error,
    refresh: fetchData
  };
};

/**
 * Hook for creating insurance company
 * @returns {Object} - {create, creating, error}
 */
export const useCreateInsuranceCompany = () => {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const create = async (data) => {
    try {
      setCreating(true);
      setError(null);
      const result = await insuranceCompaniesService.create(data);
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create insurance company';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  return { create, creating, error };
};

/**
 * Hook for updating insurance company
 * @returns {Object} - {update, updating, error}
 */
export const useUpdateInsuranceCompany = () => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const update = async (id, data) => {
    try {
      setUpdating(true);
      setError(null);
      const result = await insuranceCompaniesService.update(id, data);
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update insurance company';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  return { update, updating, error };
};

/**
 * Hook for deleting insurance company
 * @returns {Object} - {remove, deleting, error}
 */
export const useDeleteInsuranceCompany = () => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const remove = async (id) => {
    try {
      setDeleting(true);
      setError(null);
      await insuranceCompaniesService.remove(id);
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete insurance company';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  return { remove, deleting, error };
};
