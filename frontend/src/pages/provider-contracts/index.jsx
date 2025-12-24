// NOTE: Provider Contracts module is deferred to Phase C
// Business workflow and pricing models not yet finalized
// Last Updated: 2024-12-24

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import { Typography, Box, Button, Stack, Chip, Paper } from '@mui/material';
import {
  Description as ContractIcon,
  Add as AddIcon,
  Upload as ImportIcon,
  Engineering as SettingsIcon,
  Construction as ConstructionIcon
} from '@mui/icons-material';

/**
 * Provider Contracts Module - Not Yet Implemented
 * 
 * This page displays a clear "Module Not Implemented" state
 * Backend API for provider contracts is not ready yet.
 * 
 * Route: /provider-contracts
 */
const ProviderContractsList = () => {
  return (
    <>
      <ModernPageHeader
        title="عقود مقدمي الخدمة"
        subtitle="إدارة عقود التسعير مع مقدمي الخدمات الصحية"
        icon={ContractIcon}
        breadcrumbs={[
          { label: 'الرئيسية', path: '/dashboard' },
          { label: 'عقود مقدمي الخدمة', path: '/provider-contracts' }
        ]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ImportIcon />}
              disabled
            >
              استيراد عقد
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              disabled
            >
              إنشاء عقد جديد
            </Button>
          </Stack>
        }
      />

      <MainCard>
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 6,
            px: 4,
            backgroundColor: 'action.hover',
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'divider'
          }}
        >
          <ConstructionIcon 
            sx={{ 
              fontSize: 64, 
              color: 'warning.main', 
              mb: 2,
              opacity: 0.8
            }} 
          />
          
          <Chip 
            label="قيد التطوير" 
            color="warning" 
            size="small" 
            sx={{ mb: 2 }}
          />
          
          <Typography variant="h5" gutterBottom color="text.primary">
            وحدة عقود مقدمي الخدمة غير متاحة حالياً
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}
          >
            هذه الوحدة قيد التطوير وستكون متاحة في الإصدار القادم.
            ستتيح لك إدارة عقود التسعير مع مقدمي الخدمات الصحية بما في ذلك:
          </Typography>

          <Stack 
            direction="row" 
            spacing={2} 
            justifyContent="center" 
            flexWrap="wrap"
            sx={{ mb: 4 }}
          >
            {[
              'نماذج التسعير المختلفة',
              'اتفاقيات الخصم',
              'فترات سريان العقود',
              'شروط الدفع'
            ].map((feature) => (
              <Chip 
                key={feature}
                label={feature} 
                variant="outlined" 
                size="small"
                sx={{ mb: 1 }}
              />
            ))}
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<SettingsIcon />}
              disabled
            >
              إعدادات التسعير
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              disabled
            >
              إنشاء عقد جديد
            </Button>
          </Stack>
        </Paper>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            للاستفسارات حول هذه الوحدة، يرجى التواصل مع فريق الدعم الفني
          </Typography>
        </Box>
      </MainCard>
    </>
  );
};

export default ProviderContractsList;