import MainCard from 'components/MainCard';
import RBACGuard from 'components/tba/RBACGuard';
import { Typography, Box } from '@mui/material';

const CompaniesList = () => {
  return (
    <RBACGuard permission="COMPANY_VIEW">
      <MainCard title="Companies">
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Companies Module
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Manage insurance companies and reviewer companies
          </Typography>
        </Box>
      </MainCard>
    </RBACGuard>
  );
};

export default CompaniesList;
