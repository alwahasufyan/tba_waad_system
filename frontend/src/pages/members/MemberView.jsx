import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  PeopleAlt as PeopleAltIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  LocalHospital as LocalHospitalIcon,
  CalendarMonth as CalendarMonthIcon,
  FamilyRestroom as FamilyRestroomIcon
} from '@mui/icons-material';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import { getMemberById } from 'services/api/members.service';

/**
 * Member View Page (Read-Only)
 * Backend: MemberController.get → MemberViewDto
 */
const MemberView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMember();
  }, [id]);

  const loadMember = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMemberById(id);
      setMember(data);
    } catch (err) {
      console.error('[MemberView] Failed to load member:', err);
      setError(err.response?.data?.message || 'Failed to load member');
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
          title="Member Details"
          subtitle="View member information"
          icon={PeopleAltIcon}
          breadcrumbs={[
            { label: 'Members', path: '/members' },
            { label: 'View Member', path: `/members/view/${id}` }
          ]}
        />
        <MainCard>
          <Alert severity="error">{error}</Alert>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/members')}>
              Back to List
            </Button>
          </Box>
        </MainCard>
      </>
    );
  }

  if (!member) {
    return null;
  }

  const InfoRow = ({ label, value }) => (
    <Grid container spacing={2} sx={{ py: 1 }}>
      <Grid item xs={12} sm={4}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={8}>
        <Typography variant="body2">{value || '-'}</Typography>
      </Grid>
    </Grid>
  );

  const SectionCard = ({ title, icon, children }) => (
    <MainCard
      title={
        <Stack direction="row" spacing={1} alignItems="center">
          {icon}
          <Typography variant="h5">{title}</Typography>
        </Stack>
      }
    >
      {children}
    </MainCard>
  );

  return (
    <>
      <ModernPageHeader
        title={member.fullNameArabic || member.fullNameEnglish || 'Member Details'}
        subtitle={`Civil ID: ${member.civilId || 'N/A'}`}
        icon={PeopleAltIcon}
        breadcrumbs={[
          { label: 'Members', path: '/members' },
          { label: 'View Member', path: `/members/view/${id}` }
        ]}
        actions={
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/members')}>
              Back to List
            </Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/members/edit/${id}`)}>
              Edit Member
            </Button>
          </Stack>
        }
      />

      <Stack spacing={3}>
        {/* Personal Information */}
        <SectionCard title="Personal Information" icon={<PersonIcon color="primary" />}>
          <InfoRow label="Full Name (Arabic)" value={member.fullNameArabic} />
          <InfoRow label="Full Name (English)" value={member.fullNameEnglish} />
          <Divider />
          <InfoRow label="Civil ID" value={member.civilId} />
          <InfoRow label="Card Number" value={member.cardNumber} />
          <Divider />
          <InfoRow label="Birth Date" value={member.birthDate} />
          <InfoRow label="Gender" value={member.gender} />
          <InfoRow label="Marital Status" value={member.maritalStatus} />
          <InfoRow label="Nationality" value={member.nationality} />
          <Divider />
          <Grid container spacing={2} sx={{ py: 1 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Status
              </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Chip label={member.active ? 'Active' : 'Inactive'} color={member.active ? 'success' : 'error'} size="small" />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Contact Information */}
        <SectionCard title="Contact Information" icon={<PhoneIcon color="primary" />}>
          <InfoRow label="Phone" value={member.phone} />
          <InfoRow label="Email" value={member.email} />
          <InfoRow label="Address" value={member.address} />
        </SectionCard>

        {/* Employment Information */}
        <SectionCard title="Employment Information" icon={<WorkIcon color="primary" />}>
          <InfoRow label="Employer" value={member.employerName} />
          <InfoRow label="Employee Number" value={member.employeeNumber} />
          <InfoRow label="Join Date" value={member.joinDate} />
          <InfoRow label="Occupation" value={member.occupation} />
        </SectionCard>

        {/* Insurance Information */}
        <SectionCard title="Insurance Information" icon={<LocalHospitalIcon color="primary" />}>
          <InfoRow label="Policy Number" value={member.policyNumber} />
          <InfoRow label="Insurance Company" value={member.insuranceCompanyName} />
          <InfoRow label="Benefit Package ID" value={member.benefitPackageId} />
        </SectionCard>

        {/* Membership Period & Status */}
        <SectionCard title="Membership Period & Status" icon={<CalendarMonthIcon color="primary" />}>
          <InfoRow label="Member Status" value={member.status} />
          <InfoRow label="Card Status" value={member.cardStatus} />
          <Divider />
          <InfoRow label="Start Date" value={member.startDate} />
          <InfoRow label="End Date" value={member.endDate} />
          <Divider />
          <InfoRow label="Blocked Reason" value={member.blockedReason} />
          <InfoRow label="Eligibility Status" value={member.eligibilityStatus ? 'Eligible' : 'Not Eligible'} />
          <Divider />
          <InfoRow label="QR Code" value={member.qrCodeValue} />
          <InfoRow label="Photo URL" value={member.photoUrl} />
          <InfoRow label="Notes" value={member.notes} />
        </SectionCard>

        {/* Family Members */}
        {member.familyMembers && member.familyMembers.length > 0 && (
          <SectionCard title={`Family Members (${member.familyMembersCount || member.familyMembers.length})`} icon={<FamilyRestroomIcon color="primary" />}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Full Name (AR)</TableCell>
                    <TableCell>Full Name (EN)</TableCell>
                    <TableCell>Civil ID</TableCell>
                    <TableCell>Birth Date</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Relationship</TableCell>
                    <TableCell>Card Number</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {member.familyMembers.map((fm, index) => (
                    <TableRow key={fm.id || index}>
                      <TableCell>{fm.fullNameArabic}</TableCell>
                      <TableCell>{fm.fullNameEnglish || '-'}</TableCell>
                      <TableCell>{fm.civilId}</TableCell>
                      <TableCell>{fm.birthDate}</TableCell>
                      <TableCell>{fm.gender}</TableCell>
                      <TableCell>{fm.relationship}</TableCell>
                      <TableCell>{fm.cardNumber || '-'}</TableCell>
                      <TableCell>
                        <Chip label={fm.active ? 'Active' : 'Inactive'} size="small" color={fm.active ? 'success' : 'default'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </SectionCard>
        )}

        {/* Audit Information */}
        <SectionCard title="Audit Information" icon={<CalendarMonthIcon color="primary" />}>
          <InfoRow label="Created By" value={member.createdBy} />
          <InfoRow label="Created At" value={member.createdAt ? new Date(member.createdAt).toLocaleString() : '-'} />
          <InfoRow label="Updated By" value={member.updatedBy} />
          <InfoRow label="Updated At" value={member.updatedAt ? new Date(member.updatedAt).toLocaleString() : '-'} />
        </SectionCard>
      </Stack>
    </>
  );
};

export default MemberView;
