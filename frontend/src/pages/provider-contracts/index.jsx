import MainCard from 'components/MainCard';
import RBACGuard from 'components/tba/RBACGuard';
import { Typography, Box } from '@mui/material';

const ProviderContractsList = () => {
  return (
    <RBACGuard permission="PROVIDER_VIEW">
      <MainCard title="Provider Contracts">
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Provider Contracts Module - Coming Soon
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Manage pricing models and provider contracts
          </Typography>
        </Box>
      </MainCard>
    </RBACGuard>
  );
};

export default ProviderContractsList;