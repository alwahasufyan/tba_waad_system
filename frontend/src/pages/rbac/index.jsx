import { Button } from '@mui/material';
import { Security, Add } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { ModernPageHeader, ModernEmptyState } from 'components/tba';

/**
 * RBAC (Role-Based Access Control) Page
 * Manage roles, permissions, and access control
 */
const RBACPage = () => {
  return (
    <>
      <ModernPageHeader
        title="إدارة الصلاحيات (RBAC)"
        subtitle="إدارة الأدوار والصلاحيات والتحكم في الوصول"
        icon={Security}
        breadcrumbs={[
          { label: 'إدارة الصلاحيات' }
        ]}
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            disabled
          >
            إضافة دور
          </Button>
        }
      />

      <MainCard>
        <ModernEmptyState
          title="صفحة إدارة الصلاحيات قيد التطوير"
          description="سيتم إضافة إدارة الأدوار والصلاحيات قريباً"
          height={300}
        />
      </MainCard>
    </>
  );
};

export default RBACPage;
