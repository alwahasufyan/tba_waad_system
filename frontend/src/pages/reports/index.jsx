import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';

// icons
import {
  Assessment,
  Receipt,
  LocalHospital,
  People,
  BarChart,
  PieChart,
  TrendingUp,
  Construction
} from '@mui/icons-material';

// project imports
import MainCard from 'components/MainCard';
import Breadcrumbs from 'components/@extended/Breadcrumbs';

// ==============================|| REPORTS PAGE ||============================== //

/**
 * Reports Page - صفحة التقارير
 * 
 * Placeholder for TPA reporting module
 * Will include:
 * - Claims reports (تقارير المطالبات)
 * - Provider settlement reports (تقارير تسوية مقدمي الخدمة)
 * - Member statements (كشوف حساب الأعضاء)
 * - Utilization reports (تقارير الاستخدام)
 */

// Report card data
const reportCards = [
  {
    id: 'claims-report',
    title: 'تقارير المطالبات',
    titleEn: 'Claims Reports',
    description: 'تقارير تفصيلية عن المطالبات الطبية وحالاتها',
    icon: Receipt,
    color: '#1976d2',
    status: 'coming-soon'
  },
  {
    id: 'provider-settlement',
    title: 'تقارير تسوية مقدمي الخدمة',
    titleEn: 'Provider Settlement Reports',
    description: 'تقارير التسويات المالية مع مقدمي الخدمة الصحية',
    icon: LocalHospital,
    color: '#2e7d32',
    status: 'coming-soon'
  },
  {
    id: 'member-statements',
    title: 'كشوف حساب الأعضاء',
    titleEn: 'Member Statements',
    description: 'كشوف حساب تفصيلية للمؤمن عليهم',
    icon: People,
    color: '#ed6c02',
    status: 'coming-soon'
  },
  {
    id: 'utilization-reports',
    title: 'تقارير الاستخدام',
    titleEn: 'Utilization Reports',
    description: 'تحليل استخدام الخدمات الطبية والتغطية',
    icon: BarChart,
    color: '#9c27b0',
    status: 'coming-soon'
  },
  {
    id: 'financial-reports',
    title: 'التقارير المالية',
    titleEn: 'Financial Reports',
    description: 'تقارير مالية شاملة عن العمليات',
    icon: TrendingUp,
    color: '#0288d1',
    status: 'coming-soon'
  },
  {
    id: 'analytics',
    title: 'التحليلات والإحصائيات',
    titleEn: 'Analytics & Statistics',
    description: 'رسوم بيانية وإحصائيات تفاعلية',
    icon: PieChart,
    color: '#d32f2f',
    status: 'coming-soon'
  }
];

export default function ReportsPage() {
  return (
    <>
      <Breadcrumbs 
        title 
        card={false}
        heading="التقارير"
      />

      <MainCard 
        title="مركز التقارير"
        secondary={
          <Chip
            label="قيد التطوير"
            color="warning"
            size="small"
            icon={<Construction sx={{ fontSize: 16 }} />}
          />
        }
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            مرحباً بك في مركز التقارير. هذه الصفحة قيد التطوير وستتضمن تقارير شاملة عن جميع عمليات النظام.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome to the Reports Center. This page is under development and will include comprehensive reports for all system operations.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {reportCards.map((report) => {
            const IconComponent = report.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={report.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    opacity: 0.7,
                    cursor: 'not-allowed',
                    '&:hover': {
                      boxShadow: 3
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: `${report.color}15`,
                          mr: 2
                        }}
                      >
                        <IconComponent sx={{ color: report.color, fontSize: 28 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {report.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {report.titleEn}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {report.description}
                    </Typography>
                    <Chip
                      label="قريباً"
                      size="small"
                      color="default"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            📊 التقارير المتاحة حالياً
          </Typography>
          <Typography variant="body2" color="text.secondary">
            يمكنك الوصول إلى بعض التقارير من خلال صفحات المطالبات والزيارات مباشرة. 
            ستتوفر تقارير موحدة ومتقدمة في هذه الصفحة قريباً.
          </Typography>
        </Box>
      </MainCard>
    </>
  );
}
