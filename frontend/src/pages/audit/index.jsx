import { Button, Stack } from '@mui/material';
import { Timeline, Refresh, Download } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { ModernPageHeader, ModernEmptyState } from 'components/tba';

/**
 * Audit Log Page
 * View system audit trail and activity logs
 */
const AuditPage = () => {
  return (
    <>
      <ModernPageHeader
        title="سجل التدقيق"
        subtitle="عرض سجل النشاطات والتغييرات في النظام"
        icon={Timeline}
        breadcrumbs={[
          { label: 'سجل التدقيق' }
        ]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              disabled
            >
              تحديث
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              disabled
            >
              تصدير
            </Button>
          </Stack>
        }
      />

      <MainCard>
        <ModernEmptyState
          title="صفحة سجل التدقيق قيد التطوير"
          description="سيتم إضافة سجل النشاطات والتغييرات قريباً"
          height={300}
        />
      </MainCard>
    </>
  );
};

export default AuditPage;
