import { useState, useEffect, useCallback } from 'react';

// TODO: Create insurancePolicies.service.js in services/api folder
// Temporarily using placeholder functions to allow build to succeed
const getInsurancePolicies = async () => [];
const getInsurancePolicyById = async () => null;
const createInsurancePolicy = async () => null;
const updateInsurancePolicy = async () => null;
const deleteInsurancePolicy = async () => null;
const getBenefitPackages = async () => [];
const createBenefitPackage = async () => null;
const updateBenefitPackage = async () => null;
const deleteBenefitPackage = async () => null;

/**
 * Hook for managing paginated insurance policies list
 * @param {Object} initialParams - Initial query parameters
 * @returns {Object} - {data, loading, error, params, setParams, refresh}
 */
export const usePoliciesList = (initialParams = { page: 1, size: 10 }) => {
  const [data, setData] = useState({ items: [], total: 0, page: 1, size: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getInsurancePolicies(params);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch insurance policies');
      console.error('Error fetching insurance policies:', err);
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
 * Hook for managing single insurance policy details
 * @param {number} id - Insurance policy ID
 * @returns {Object} - {policy, loading, error, refresh}
 */
export const usePolicyDetails = (id) => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const result = await getInsurancePolicyById(id);
      setPolicy(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch insurance policy details');
      console.error('Error fetching insurance policy:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    policy,
    loading,
    error,
    refresh: fetchData
  };
};

/**
 * Hook for creating insurance policy
 * @returns {Object} - {create, creating, error}
 */
export const useCreatePolicy = () => {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const create = async (data) => {
    try {
      setCreating(true);
      setError(null);
      const result = await createInsurancePolicy(data);
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create insurance policy';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  return { create, creating, error };
};

/**
 * Hook for updating insurance policy
 * @returns {Object} - {update, updating, error}
 */
export const useUpdatePolicy = () => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const update = async (id, data) => {
    try {
      setUpdating(true);
      setError(null);
      const result = await updateInsurancePolicy(id, data);
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update insurance policy';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  return { update, updating, error };
};

/**
 * Hook for deleting insurance policy
 * @returns {Object} - {remove, deleting, error}
 */
export const useDeletePolicy = () => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const remove = async (id) => {
    try {
      setDeleting(true);
      setError(null);
      await deleteInsurancePolicy(id);
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete insurance policy';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  return { remove, deleting, error };
};

/**
 * Hook for managing benefit packages for a policy
 * @param {number} policyId - Policy ID
 * @returns {Object} - {packages, loading, error, refresh}
 */
export const useBenefitPackages = (policyId) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!policyId) return;
    try {
      setLoading(true);
      setError(null);
      const result = await getBenefitPackages(policyId);
      setPackages(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch benefit packages');
      console.error('Error fetching benefit packages:', err);
    } finally {
      setLoading(false);
    }
  }, [policyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    packages,
    loading,
    error,
    refresh: fetchData
  };
};

/**
 * Hook for creating benefit package
 * @returns {Object} - {create, creating, error}
 */
export const useCreateBenefitPackage = () => {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const create = async (policyId, data) => {
    try {
      setCreating(true);
      setError(null);
      const result = await createBenefitPackage(policyId, data);
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create benefit package';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  return { create, creating, error };
};

/**
 * Hook for updating benefit package
 * @returns {Object} - {update, updating, error}
 */
export const useUpdateBenefitPackage = () => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const update = async (id, data) => {
    try {
      setUpdating(true);
      setError(null);
      const result = await updateBenefitPackage(id, data);
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update benefit package';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  return { update, updating, error };
};

/**
 * Hook for deleting benefit package
 * @returns {Object} - {remove, deleting, error}
 */
export const useDeleteBenefitPackage = () => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const remove = async (id) => {
    try {
      setDeleting(true);
      setError(null);
      await deleteBenefitPackage(id);
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete benefit package';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  return { remove, deleting, error };
};
