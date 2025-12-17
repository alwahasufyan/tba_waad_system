import MainCard from 'components/MainCard';
import RBACGuard from 'components/tba/RBACGuard';
import { Typography, Box } from '@mui/material';

const RolesList = () => {
  return (
    <RBACGuard permission="ROLE_VIEW">
      <MainCard title="Roles & Permissions">
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Roles & Permissions Module
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Configure roles and assign permissions
          </Typography>
        </Box>
      </MainCard>
    </RBACGuard>
  );
};

export default RolesList;
