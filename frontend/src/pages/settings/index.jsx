/**
 * Settings Page - Enterprise System Configuration
 * 
 * Provides UI visibility controls for system sections.
 * Dashboard is now operational-only (no charts) - dashboard settings section removed.
 * 
 * Last Updated: 2024-12-21
 */

import { Box } from '@mui/material';
import { ScheduleOutlined } from '@ant-design/icons';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import ModernEmptyState from 'components/tba/ModernEmptyState';

/**
 * Settings Page - Simplified for Enterprise Closed System
 * Dashboard no longer contains charts - removed chart visibility settings
 */
const SettingsPage = () => {
  return (
    <Box>
      {/* Page Header */}
      <ModernPageHeader
        title="إعدادات النظام"
        subtitle="التحكم في إعدادات واجهة النظام العامة"
      />

      {/* Future Settings Placeholder */}
      <ModernEmptyState
        icon={ScheduleOutlined}
        title="إعدادات النظام"
        description="سيتم إضافة إعدادات إضافية في مراحل لاحقة. النظام يعمل حالياً بالإعدادات الافتراضية المحسّنة للتشغيل."
        height={400}
      />
    </Box>
  );
};

export default SettingsPage;
