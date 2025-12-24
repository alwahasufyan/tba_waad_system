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

// Insurance UX Components - Phase B2
import { MemberTypeIndicator, CardStatusBadge, CoverageGauge } from 'components/insurance';

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
          title="بيانات المؤمَّن عليه"
          subtitle="عرض معلومات المؤمَّن عليه"
          icon={PeopleAltIcon}
          breadcrumbs={[
            { label: 'المؤمَّن عليهم', path: '/members' },
            { label: 'عرض البيانات', path: `/members/view/${id}` }
          ]}
        />
        <MainCard>
          <Alert severity="error">{error}</Alert>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/members')}>
              العودة للقائمة
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
        title={member.fullNameArabic || member.fullNameEnglish || 'بيانات المؤمَّن عليه'}
        subtitle={`الرقم المدني: ${member.civilId || 'غير متوفر'}`}
        icon={PeopleAltIcon}
        breadcrumbs={[
          { label: 'المؤمَّن عليهم', path: '/members' },
          { label: 'عرض البيانات', path: `/members/view/${id}` }
        ]}
        actions={
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/members')}>
              العودة للقائمة
            </Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/members/edit/${id}`)}>
              تعديل البيانات
            </Button>
          </Stack>
        }
      />

      <Stack spacing={3}>
        {/* Personal Information */}
        <SectionCard title="البيانات الشخصية" icon={<PersonIcon color="primary" />}>
          <InfoRow label="الاسم بالعربية" value={member?.fullNameArabic} />
          <InfoRow label="الاسم بالإنجليزية" value={member?.fullNameEnglish} />
          <Divider />
          <InfoRow label="الرقم المدني" value={member?.civilId} />
          <InfoRow label="رقم البطاقة" value={member?.cardNumber} />
          <Divider />
          <InfoRow label="تاريخ الميلاد" value={member?.birthDate} />
          <InfoRow label="الجنس" value={member?.gender} />
          <InfoRow label="الحالة الاجتماعية" value={member?.maritalStatus} />
          <InfoRow label="الجنسية" value={member?.nationality} />
          <Divider />
          {/* Insurance UX - MemberTypeIndicator */}
          <Grid container spacing={2} sx={{ py: 1 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                نوع العضوية
              </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
              <MemberTypeIndicator
                memberType={member?.memberType ?? 'PRINCIPAL'}
                relationship={member?.relationship}
                size="small"
                variant="detailed"
              />
            </Grid>
          </Grid>
          {/* Insurance UX - CardStatusBadge */}
          <Grid container spacing={2} sx={{ py: 1 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                حالة البطاقة
              </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
              <CardStatusBadge
                status={member?.cardStatus ?? (member?.active ? 'ACTIVE' : 'INACTIVE')}
                size="small"
                variant="detailed"
              />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Contact Information */}
        <SectionCard title="بيانات التواصل" icon={<PhoneIcon color="primary" />}>
          <InfoRow label="الهاتف" value={member?.phone} />
          <InfoRow label="البريد الإلكتروني" value={member?.email} />
          <InfoRow label="العنوان" value={member?.address} />
        </SectionCard>

        {/* Employment Information */}
        <SectionCard title="بيانات العمل" icon={<WorkIcon color="primary" />}>
          <InfoRow label="جهة العمل" value={member?.employerName} />
          <InfoRow label="الرقم الوظيفي" value={member?.employeeNumber} />
          <InfoRow label="تاريخ الالتحاق" value={member?.joinDate} />
          <InfoRow label="المهنة" value={member?.occupation} />
        </SectionCard>

        {/* Insurance Information */}
        <SectionCard title="بيانات التأمين" icon={<LocalHospitalIcon color="primary" />}>
          <InfoRow label="رقم البوليصة" value={member?.policyNumber} />
          <InfoRow label="شركة التأمين" value={member?.insuranceCompanyName} />
          <InfoRow label="باقة المنافع" value={member?.benefitPackageId} />
        </SectionCard>

        {/* Benefit Policy Information */}
        <SectionCard title="وثيقة المنافع" icon={<LocalHospitalIcon color="primary" />}>
          {member?.benefitPolicyId ? (
            <>
              <InfoRow label="اسم الوثيقة" value={member?.benefitPolicyName} />
              <InfoRow label="رمز الوثيقة" value={member?.benefitPolicyCode} />
              <Grid container spacing={2} sx={{ py: 1 }}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    حالة الوثيقة
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Chip
                    size="small"
                    label={
                      member?.benefitPolicyStatus === 'ACTIVE' ? 'نشطة' :
                      member?.benefitPolicyStatus === 'DRAFT' ? 'مسودة' :
                      member?.benefitPolicyStatus === 'SUSPENDED' ? 'معلقة' :
                      member?.benefitPolicyStatus === 'EXPIRED' ? 'منتهية' :
                      member?.benefitPolicyStatus === 'CANCELLED' ? 'ملغاة' :
                      member?.benefitPolicyStatus || 'غير محدد'
                    }
                    color={
                      member?.benefitPolicyStatus === 'ACTIVE' ? 'success' :
                      member?.benefitPolicyStatus === 'DRAFT' ? 'default' :
                      member?.benefitPolicyStatus === 'SUSPENDED' ? 'warning' :
                      member?.benefitPolicyStatus === 'EXPIRED' ? 'error' :
                      member?.benefitPolicyStatus === 'CANCELLED' ? 'error' :
                      'default'
                    }
                  />
                </Grid>
              </Grid>
              <Divider sx={{ my: 1 }} />
              <InfoRow label="تاريخ بداية الوثيقة" value={member?.benefitPolicyStartDate} />
              <InfoRow label="تاريخ انتهاء الوثيقة" value={member?.benefitPolicyEndDate} />
              {/* Warning for expired or suspended policies */}
              {(member?.benefitPolicyStatus === 'EXPIRED' || member?.benefitPolicyStatus === 'SUSPENDED') && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {member?.benefitPolicyStatus === 'EXPIRED' 
                    ? 'وثيقة المنافع المرتبطة بهذا العضو منتهية الصلاحية'
                    : 'وثيقة المنافع المرتبطة بهذا العضو معلقة مؤقتاً'
                  }
                </Alert>
              )}
            </>
          ) : (
            <Alert severity="info">
              لم يتم تعيين وثيقة منافع لهذا العضو
            </Alert>
          )}
        </SectionCard>

        {/* Membership Period & Status */}
        <SectionCard title="فترة التغطية والحالة" icon={<CalendarMonthIcon color="primary" />}>
          <InfoRow label="حالة العضوية" value={member?.status} />
          <InfoRow label="حالة البطاقة" value={member?.cardStatus} />
          <Divider />
          {/* Insurance UX - CoverageGauge */}
          {(member?.startDate || member?.endDate) && (
            <Grid container spacing={2} sx={{ py: 2 }}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  فترة التغطية
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <CoverageGauge
                  startDate={member?.startDate}
                  endDate={member?.endDate}
                  showWarning={true}
                  warningDays={30}
                  criticalDays={7}
                  size="medium"
                  variant="linear"
                  language="ar"
                />
              </Grid>
            </Grid>
          )}
          <InfoRow label="تاريخ بداية التغطية" value={member?.startDate} />
          <InfoRow label="تاريخ انتهاء التغطية" value={member?.endDate} />
          <Divider />
          <InfoRow label="سبب الإيقاف" value={member?.blockedReason} />
          <InfoRow label="حالة الأهلية" value={member?.eligibilityStatus ? 'مؤهل' : 'غير مؤهل'} />
          <Divider />
          <InfoRow label="رمز QR" value={member?.qrCodeValue} />
          <InfoRow label="رابط الصورة" value={member?.photoUrl} />
          <InfoRow label="ملاحظات" value={member?.notes} />
        </SectionCard>

        {/* Family Members */}
        {Array.isArray(member?.familyMembers) && member.familyMembers.length > 0 && (
          <SectionCard title={`التابعين (${member?.familyMembersCount || member.familyMembers.length})`} icon={<FamilyRestroomIcon color="primary" />}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>الاسم بالعربية</TableCell>
                    <TableCell>الاسم بالإنجليزية</TableCell>
                    <TableCell>صلة القرابة</TableCell>
                    <TableCell>الرقم المدني</TableCell>
                    <TableCell>تاريخ الميلاد</TableCell>
                    <TableCell>الجنس</TableCell>
                    <TableCell>رقم البطاقة</TableCell>
                    <TableCell>حالة البطاقة</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {member.familyMembers.map((fm, index) => (
                    <TableRow key={fm?.id ?? index}>
                      <TableCell>{fm?.fullNameArabic ?? '-'}</TableCell>
                      <TableCell>{fm?.fullNameEnglish || '-'}</TableCell>
                      <TableCell>
                        {/* Insurance UX - MemberTypeIndicator for family */}
                        <MemberTypeIndicator
                          memberType="DEPENDENT"
                          relationship={fm?.relationship}
                          size="small"
                          variant="chip"
                        />
                      </TableCell>
                      <TableCell>{fm?.civilId ?? '-'}</TableCell>
                      <TableCell>{fm?.birthDate ?? '-'}</TableCell>
                      <TableCell>{fm?.gender ?? '-'}</TableCell>
                      <TableCell>{fm?.cardNumber || '-'}</TableCell>
                      <TableCell>
                        {/* Insurance UX - CardStatusBadge for family */}
                        <CardStatusBadge
                          status={fm?.cardStatus ?? (fm?.active ? 'ACTIVE' : 'INACTIVE')}
                          size="small"
                          variant="chip"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </SectionCard>
        )}

        {/* Custom Attributes */}
        {Array.isArray(member?.attributes) && member.attributes.length > 0 && (
          <SectionCard title={`السمات المخصصة (${member.attributes.length})`} icon={<PersonIcon color="primary" />}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>رمز السمة</TableCell>
                    <TableCell>القيمة</TableCell>
                    <TableCell>المصدر</TableCell>
                    <TableCell>تاريخ الإنشاء</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {member.attributes.map((attr, index) => (
                    <TableRow key={attr?.id ?? index}>
                      <TableCell>{attr?.code ?? '-'}</TableCell>
                      <TableCell>{attr?.value ?? '-'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={attr?.source === 'IMPORT' ? 'استيراد' : attr?.source === 'ODOO' ? 'Odoo' : 'يدوي'}
                          color={attr?.source === 'IMPORT' || attr?.source === 'ODOO' ? 'info' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{attr?.createdAt ? new Date(attr.createdAt).toLocaleDateString('ar-LY') : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </SectionCard>
        )}

        {/* Audit Information */}
        <SectionCard title="معلومات النظام" icon={<CalendarMonthIcon color="primary" />}>
          <InfoRow label="أُنشئ بواسطة" value={member?.createdBy} />
          <InfoRow label="تاريخ الإنشاء" value={member?.createdAt ? new Date(member.createdAt).toLocaleString('ar-LY') : '-'} />
          <InfoRow label="آخر تعديل بواسطة" value={member?.updatedBy} />
          <InfoRow label="تاريخ آخر تعديل" value={member?.updatedAt ? new Date(member.updatedAt).toLocaleString('ar-LY') : '-'} />
        </SectionCard>
      </Stack>
    </>
  );
};

export default MemberView;
