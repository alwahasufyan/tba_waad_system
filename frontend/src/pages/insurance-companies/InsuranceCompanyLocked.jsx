/**
 * Insurance Company Locked Notice
 * 
 * This page is shown when users try to access insurance company management.
 * The system is single-tenant and the insurance company is fixed.
 */
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Stack, Paper } from '@mui/material';
import { LockOutlined, Home as HomeIcon } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { FIXED_INSURANCE_COMPANY } from 'constants/insuranceCompany';

export default function InsuranceCompanyLocked() {
  const navigate = useNavigate();

  return (
    <MainCard>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          textAlign: 'center',
          p: 4
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '50%',
            bgcolor: 'primary.lighter',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <LockOutlined sx={{ fontSize: 64, color: 'primary.main' }} />
        </Paper>

        <Typography variant="h3" color="text.primary" gutterBottom>
          شركة التأمين ثابتة
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 500 }}>
          هذا النظام مُصمم للعمل مع شركة تأمين واحدة فقط. لا يمكن إضافة أو تعديل أو حذف شركات التأمين.
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            bgcolor: 'grey.50',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          <Stack spacing={1} alignItems="center">
            <Typography variant="subtitle2" color="text.secondary">
              شركة التأمين المُعتمدة:
            </Typography>
            <Typography variant="h4" color="primary.main">
              {FIXED_INSURANCE_COMPANY.name}
            </Typography>
          </Stack>
        </Paper>

        <Button
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/dashboard')}
        >
          العودة للرئيسية
        </Button>
      </Box>
    </MainCard>
  );
}
