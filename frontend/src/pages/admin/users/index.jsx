import MainCard from 'components/MainCard';
import RBACGuard from 'components/tba/RBACGuard';
import { Typography, Box } from '@mui/material';

const UsersList = () => {
  return (
    <RBACGuard permission="USER_VIEW">
      <MainCard title="Users">
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Users Management Module
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Manage system users and their access
          </Typography>
        </Box>
      </MainCard>
    </RBACGuard>
  );
};

export default UsersList;
