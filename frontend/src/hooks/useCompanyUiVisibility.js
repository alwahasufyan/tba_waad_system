import { useEffect, useState, useCallback } from 'react';
import axios from 'utils/axios';
import useAuth from 'hooks/useAuth';

const DEFAULT_EMPLOYER_ID = 1; // TODO: adjust when real WAAD employerId is known

const defaultUiVisibility = {
  members: {
    showFamilyTab: true,
    showDocumentsTab: true,
    showBenefitsTab: true,
    showChronicTab: true
  },
  claims: {
    showFilesSection: true,
    showPaymentsSection: true,
    showDiagnosisSection: true
  },
  visits: {
    showAttachmentsSection: true,
    showServiceDetailsSection: true
  },
  dashboard: {
    showMembersKpi: true,
    showClaimsKpi: true,
    showVisitsKpi: true
  }
};

/**
 * useCompanyUiVisibility Hook - Phase B4
 * 
 * Manages UI visibility settings for an employer.
 * Loads from backend API and provides methods to update settings.
 * 
 * @returns {Object} Hook state and methods
 * @property {Object} uiVisibility - Current visibility settings
 * @property {Function} setUiVisibility - Update visibility settings locally
 * @property {Function} loadVisibility - Reload settings from backend
 * @property {Function} saveSettings - Save settings to backend
 * @property {boolean} loading - Loading state
 * @property {boolean} saving - Saving state
 * @property {Object} error - Error object if any
 */
const useCompanyUiVisibility = () => {
  const { user } = useAuth();
  const [uiVisibility, setUiVisibility] = useState(defaultUiVisibility);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Determine employer ID from user or use default
  const employerId = user?.employerId || DEFAULT_EMPLOYER_ID;

  /**
   * Load visibility settings from backend
   */
  const loadVisibility = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/company-settings/employer/${employerId}/ui`);
      setUiVisibility({
        ...defaultUiVisibility,
        ...response.data
      });
    } catch (err) {
      console.error('Error loading UI visibility settings:', err);
      setError(err);
      setUiVisibility(defaultUiVisibility);
    } finally {
      setLoading(false);
    }
  }, [employerId]);

  /**
   * Save visibility settings to backend
   */
  const saveSettings = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await axios.put(
        `/company-settings/employer/${employerId}/ui`,
        uiVisibility
      );
      setUiVisibility(response.data || defaultUiVisibility);
      return { success: true };
    } catch (err) {
      console.error('Error saving UI visibility settings:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setSaving(false);
    }
  }, [employerId, uiVisibility]);

  /**
   * Load visibility settings on mount and when employer changes
   */
  useEffect(() => {
    if (employerId) {
      loadVisibility();
    }
  }, [employerId, loadVisibility]);

  return {
    uiVisibility,
    setUiVisibility,
    loadVisibility,
    saveSettings,
    loading,
    saving,
    error
  };
};

export default useCompanyUiVisibility;
