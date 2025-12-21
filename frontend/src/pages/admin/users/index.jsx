// NOTE: Admin Users module - Deferred to Phase C
// Super Admin user management not yet finalized
// Last Updated: 2024-12-21

import { Box } from '@mui/material';
import { ScheduleOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import ModernEmptyState from 'components/tba/ModernEmptyState';
import RBACGuard from 'components/tba/RBACGuard';

const UsersList = () => {
  return (
    <RBACGuard permission="USER_VIEW">
      <MainCard title="إدارة المستخدمين">
        <ModernEmptyState
          icon={ScheduleOutlined}
          title="إدارة المستخدمين"
          description="هذه الوحدة مخطط لها ضمن مراحل لاحقة من النظام"
          height={300}
        />
      </MainCard>
    </RBACGuard>
  );
};

export default UsersList;
