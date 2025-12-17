import { useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// project imports
import MainCard from 'components/MainCard';
import AnalyticsDataCard from 'components/cards/statistics/AnalyticsDataCard';

// Charts
import ClaimsTrendChart from 'components/charts/ClaimsTrendChart';
import MembersGrowthChart from 'components/charts/MembersGrowthChart';
import ClaimsByStatusChart from 'components/charts/ClaimsByStatusChart';
import VisitsOverTimeChart from 'components/charts/VisitsOverTimeChart';
import MembersByEmployerChart from 'components/charts/MembersByEmployerChart';

// assets
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
import ShopOutlined from '@ant-design/icons/ShopOutlined';

// hooks
import { useQuery } from '@tanstack/react-query';
import axios from 'utils/axios';

// ==============================|| TBA DASHBOARD - MANTIS STYLE ||============================== //

export default function TbaDashboard() {
  // Fetch dashboard stats from backend
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await axios.get('/dashboard/statistics');
      return response.data;
    },
    initialData: {
      totalMembers: 0,
      activeMembers: 0,
      totalClaims: 0,
      pendingClaims: 0,
      totalVisits: 0,
      monthlyVisits: 0,
      totalProviders: 0,
      activeProviders: 0,
      totalEmployers: 0,
      totalPolicies: 0
    }
  });

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* Page Title */}
      <Grid item xs={12}>
        <Typography variant="h5">TBA Management Dashboard</Typography>
      </Grid>

      {/* Row 1: Main KPIs */}
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticsDataCard
          title="Total Members"
          count={stats?.totalMembers || '0'}
          percentage={stats?.membersGrowth || 0}
          isLoss={false}
          extra={`${stats?.activeMembers || 0} Active`}
        >
          <TeamOutlined style={{ fontSize: '2rem', color: '#1890ff' }} />
        </AnalyticsDataCard>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticsDataCard
          title="Total Claims"
          count={stats?.totalClaims || '0'}
          percentage={stats?.claimsGrowth || 0}
          isLoss={false}
          extra={`${stats?.pendingClaims || 0} Pending`}
          color="warning"
        >
          <FileTextOutlined style={{ fontSize: '2rem', color: '#fa8c16' }} />
        </AnalyticsDataCard>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticsDataCard
          title="Total Visits"
          count={stats?.totalVisits || '0'}
          percentage={stats?.visitsGrowth || 0}
          isLoss={false}
          extra={`${stats?.monthlyVisits || 0} This Month`}
          color="success"
        >
          <SafetyOutlined style={{ fontSize: '2rem', color: '#52c41a' }} />
        </AnalyticsDataCard>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticsDataCard
          title="Total Providers"
          count={stats?.totalProviders || '0'}
          percentage={stats?.providersGrowth || 0}
          isLoss={false}
          extra={`${stats?.activeProviders || 0} Active`}
          color="error"
        >
          <ShopOutlined style={{ fontSize: '2rem', color: '#f5222d' }} />
        </AnalyticsDataCard>
      </Grid>

      {/* Row 2: Charts */}
      <Grid item xs={12} lg={8}>
        <MainCard>
          <ClaimsTrendChart height={320} />
        </MainCard>
      </Grid>

      <Grid item xs={12} lg={4}>
        <MainCard>
          <ClaimsByStatusChart height={320} />
        </MainCard>
      </Grid>

      {/* Row 3: More Charts */}
      <Grid item xs={12} md={6} lg={4}>
        <MainCard>
          <MembersGrowthChart height={280} />
        </MainCard>
      </Grid>

      <Grid item xs={12} md={6} lg={4}>
        <MainCard>
          <VisitsOverTimeChart height={280} />
        </MainCard>
      </Grid>

      <Grid item xs={12} md={6} lg={4}>
        <MainCard>
          <MembersByEmployerChart height={280} />
        </MainCard>
      </Grid>

      {/* Row 4: Quick Stats */}
      <Grid item xs={12}>
        <MainCard title="Quick Statistics">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Total Employers
                </Typography>
                <Typography variant="h4">{stats?.totalEmployers || 0}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Total Policies
                </Typography>
                <Typography variant="h4">{stats?.totalPolicies || 0}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Pre-Authorizations
                </Typography>
                <Typography variant="h4">{stats?.totalPreAuths || 0}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Active Contracts
                </Typography>
                <Typography variant="h4">{stats?.activeContracts || 0}</Typography>
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}
