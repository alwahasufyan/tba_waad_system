import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import { getEmployerById } from 'services/api/employers.service';

/**
 * Employer View Page (Read-Only)
 * Displays detailed information about an employer
 */
const EmployerView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();

  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEmployer();
  }, [id]);

  const loadEmployer = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployerById(id);
      setEmployer(data);
    } catch (err) {
      console.error('[EmployerView] Failed to load employer:', err);
      setError(err.response?.data?.message || intl.formatMessage({ id: 'employers.load-error' }) || 'Failed to load employer');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <>
        <ModernPageHeader
          title={intl.formatMessage({ id: 'employers.view' }) || 'Employer Details'}
          subtitle={intl.formatMessage({ id: 'employers.view-subtitle' }) || 'View employer information'}
          icon={BusinessIcon}
          breadcrumbs={[
            { label: intl.formatMessage({ id: 'employers.list' }) || 'Employers', path: '/employers' },
            { label: intl.formatMessage({ id: 'employers.view' }) || 'View', path: `/employers/${id}` }
          ]}
        />
        <MainCard>
          <Alert severity="error">{error}</Alert>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/employers')}>
              {intl.formatMessage({ id: 'common.back-to-list' }) || 'Back to List'}
            </Button>
          </Box>
        </MainCard>
      </>
    );
  }

  if (!employer) {
    return null;
  }

  const InfoRow = ({ label, value, fullWidth = false }) => (
    <Grid container spacing={2} sx={{ py: 1.5 }}>
      <Grid item xs={12} sm={fullWidth ? 12 : 4}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={fullWidth ? 12 : 8}>
        <Typography variant="body2">{value || '-'}</Typography>
      </Grid>
    </Grid>
  );

  const SectionCard = ({ title, children }) => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );

  return (
    <>
      <ModernPageHeader
        title={employer.nameAr || employer.nameEn || intl.formatMessage({ id: 'employers.view' }) || 'Employer Details'}
        subtitle={`${intl.formatMessage({ id: 'employers.employer-code' }) || 'Code'}: ${employer.code || 'N/A'}`}
        icon={BusinessIcon}
        breadcrumbs={[
          { label: intl.formatMessage({ id: 'employers.list' }) || 'Employers', path: '/employers' },
          { label: intl.formatMessage({ id: 'employers.view' }) || 'View', path: `/employers/${id}` }
        ]}
        actions={
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/employers')}>
              {intl.formatMessage({ id: 'common.back' }) || 'Back'}
            </Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/employers/edit/${id}`)}>
              {intl.formatMessage({ id: 'common.edit' }) || 'Edit'}
            </Button>
          </Stack>
        }
      />

      <MainCard>
        {/* Status Badge */}
        <Box sx={{ mb: 3 }}>
          <Chip
            icon={employer.active ? <CheckCircleIcon /> : <CancelIcon />}
            label={employer.active ? (intl.formatMessage({ id: 'common.active' }) || 'Active') : (intl.formatMessage({ id: 'common.inactive' }) || 'Inactive')}
            color={employer.active ? 'success' : 'default'}
            size="medium"
          />
        </Box>

        {/* Basic Information Section */}
        <SectionCard title={intl.formatMessage({ id: 'employers.basic-info' }) || 'Basic Information'}>
          <InfoRow
            label={intl.formatMessage({ id: 'employers.employer-code' }) || 'Employer Code'}
            value={employer.code}
          />
          <InfoRow
            label={intl.formatMessage({ id: 'employers.name-ar' }) || 'Name (Arabic)'}
            value={employer.nameAr}
          />
          <InfoRow
            label={intl.formatMessage({ id: 'employers.name-en' }) || 'Name (English)'}
            value={employer.nameEn}
          />
          <InfoRow
            label={intl.formatMessage({ id: 'common.status' }) || 'Status'}
            value={
              <Chip
                icon={employer.active ? <CheckCircleIcon /> : <CancelIcon />}
                label={employer.active ? (intl.formatMessage({ id: 'common.active' }) || 'Active') : (intl.formatMessage({ id: 'common.inactive' }) || 'Inactive')}
                color={employer.active ? 'success' : 'default'}
                size="small"
              />
            }
          />
        </SectionCard>

        {/* Additional Information Section */}
        {(employer.insuranceCompanyId || employer.policyId || employer.createdAt) && (
          <SectionCard title={intl.formatMessage({ id: 'employers.additional-info' }) || 'Additional Information'}>
            {employer.insuranceCompanyId && (
              <InfoRow
                label={intl.formatMessage({ id: 'employers.insurance-company' }) || 'Insurance Company'}
                value={employer.insuranceCompanyName || `ID: ${employer.insuranceCompanyId}`}
              />
            )}
            {employer.policyId && (
              <InfoRow
                label={intl.formatMessage({ id: 'employers.policy' }) || 'Policy'}
                value={employer.policyName || `ID: ${employer.policyId}`}
              />
            )}
            {employer.createdAt && (
              <InfoRow
                label={intl.formatMessage({ id: 'common.created-at' }) || 'Created At'}
                value={new Date(employer.createdAt).toLocaleString()}
              />
            )}
            {employer.updatedAt && (
              <InfoRow
                label={intl.formatMessage({ id: 'common.updated-at' }) || 'Updated At'}
                value={new Date(employer.updatedAt).toLocaleString()}
              />
            )}
          </SectionCard>
        )}

        {/* Statistics Section (if available) */}
        {(employer.totalMembers !== undefined || employer.activePolicies !== undefined) && (
          <SectionCard title={intl.formatMessage({ id: 'employers.statistics' }) || 'Statistics'}>
            <Grid container spacing={3}>
              {employer.totalMembers !== undefined && (
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="primary.main">
                        {employer.totalMembers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {intl.formatMessage({ id: 'employers.total-members' }) || 'Total Members'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {employer.activePolicies !== undefined && (
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="success.main">
                        {employer.activePolicies}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {intl.formatMessage({ id: 'employers.active-policies' }) || 'Active Policies'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {employer.totalClaims !== undefined && (
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="info.main">
                        {employer.totalClaims}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {intl.formatMessage({ id: 'employers.total-claims' }) || 'Total Claims'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </SectionCard>
        )}

        {/* Action Buttons at Bottom */}
        <Divider sx={{ my: 3 }} />
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/employers')}>
            {intl.formatMessage({ id: 'common.back' }) || 'Back'}
          </Button>
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/employers/edit/${id}`)}>
            {intl.formatMessage({ id: 'common.edit' }) || 'Edit'}
          </Button>
        </Stack>
      </MainCard>
    </>
  );
};

export default EmployerView;
