/**
 * Users & Permissions Management Page - READ ONLY
 * 
 * System overview screen displaying registered users and their roles
 * with a visual permissions matrix.
 * 
 * - No API calls (uses mock data)
 * - No forms or edit actions
 * - Arabic labels only
 * - Enterprise Closed System
 * 
 * Last Updated: 2024-12-21
 */

import { Box, Stack, Typography } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SecurityIcon from '@mui/icons-material/Security';

// project imports
import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import { CardStatusBadge } from 'components/insurance';

// ==============================|| MOCK DATA - USERS ||============================== //

const MOCK_USERS = [
  {
    id: 1,
    name: 'أحمد محمد العمري',
    email: 'admin@waad.com',
    role: 'SUPER_ADMIN',
    roleLabel: 'مدير النظام',
    status: 'ACTIVE',
    affiliation: 'شركة وعد (TPA)'
  },
  {
    id: 2,
    name: 'فاطمة السيد',
    email: 'fatima@waad.com',
    role: 'ADMIN',
    roleLabel: 'مسؤول',
    status: 'ACTIVE',
    affiliation: 'شركة وعد (TPA)'
  },
  {
    id: 3,
    name: 'محمد الشهري',
    email: 'mohammad@employer.com',
    role: 'EMPLOYER',
    roleLabel: 'جهة عمل',
    status: 'ACTIVE',
    affiliation: 'شركة الاتصالات السعودية'
  },
  {
    id: 4,
    name: 'نورة القحطاني',
    email: 'noura@provider.com',
    role: 'PROVIDER',
    roleLabel: 'مقدم خدمة',
    status: 'ACTIVE',
    affiliation: 'مستشفى المملكة'
  },
  {
    id: 5,
    name: 'عبدالله الحربي',
    email: 'abdullah@alwaha.com',
    role: 'TPA_ADMIN',
    roleLabel: 'مسؤول TPA',
    status: 'ACTIVE',
    affiliation: 'شركة وعد TPA'
  },
  {
    id: 6,
    name: 'سارة العتيبي',
    email: 'sara@reviewer.com',
    role: 'REVIEWER',
    roleLabel: 'مراجع طبي',
    status: 'INACTIVE',
    affiliation: 'شركة المراجعة الطبية'
  }
];

// ==============================|| PERMISSIONS MATRIX DATA ||============================== //

const ROLES = [
  { key: 'SUPER_ADMIN', label: 'مدير النظام' },
  { key: 'ADMIN', label: 'مسؤول' },
  { key: 'EMPLOYER', label: 'جهة عمل' },
  { key: 'PROVIDER', label: 'مقدم خدمة' },
  { key: 'TPA_ADMIN', label: 'مسؤول TPA' },
  { key: 'REVIEWER', label: 'مراجع طبي' }
];

const MODULES = [
  { key: 'members', label: 'المؤمَّن عليهم' },
  { key: 'claims', label: 'المطالبات' },
  { key: 'visits', label: 'الزيارات' },
  { key: 'preApprovals', label: 'الموافقات المسبقة' },
  { key: 'medicalServices', label: 'الخدمات الطبية' },
  { key: 'benefitPolicies', label: 'وثائق المنافع' }
];

// Permissions matrix: true = has access, false = no access
const PERMISSIONS_MATRIX = {
  members: {
    SUPER_ADMIN: true,
    ADMIN: true,
    EMPLOYER: true,
    PROVIDER: false,
    TPA_ADMIN: true,
    REVIEWER: true
  },
  claims: {
    SUPER_ADMIN: true,
    ADMIN: true,
    EMPLOYER: true,
    PROVIDER: true,
    TPA_ADMIN: true,
    REVIEWER: true
  },
  visits: {
    SUPER_ADMIN: true,
    ADMIN: true,
    EMPLOYER: true,
    PROVIDER: true,
    TPA_ADMIN: true,
    REVIEWER: true
  },
  preApprovals: {
    SUPER_ADMIN: true,
    ADMIN: true,
    EMPLOYER: true,
    PROVIDER: true,
    TPA_ADMIN: true,
    REVIEWER: true
  },
  medicalServices: {
    SUPER_ADMIN: true,
    ADMIN: true,
    EMPLOYER: false,
    PROVIDER: true,
    TPA_ADMIN: true,
    REVIEWER: true
  },
  policies: {
    SUPER_ADMIN: true,
    ADMIN: true,
    EMPLOYER: true,
    PROVIDER: false,
    TPA_ADMIN: true,
    REVIEWER: true
  }
};

// ==============================|| USERS TABLE COMPONENT ||============================== //

const UsersTable = ({ users }) => {
  // Defensive coding - ensure users is an array
  const safeUsers = Array.isArray(users) ? users : [];

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <PeopleAltIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h5">المستخدمون المسجلون</Typography>
        </Stack>
      }
      content={false}
    >
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="users table">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>الاسم</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>البريد الإلكتروني</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>الدور</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>الحالة</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>جهة الارتباط</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    لا يوجد مستخدمون مسجلون
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              safeUsers.map((user) => (
                <TableRow
                  key={user?.id ?? Math.random()}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  hover
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {user?.name ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" dir="ltr">
                      {user?.email ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user?.roleLabel ?? user?.role ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <CardStatusBadge
                      status={user?.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'}
                      size="small"
                      variant="chip"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user?.affiliation ?? '—'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
};

// ==============================|| PERMISSIONS MATRIX COMPONENT ||============================== //

const PermissionsMatrix = ({ roles, modules, matrix }) => {
  // Defensive coding
  const safeRoles = Array.isArray(roles) ? roles : [];
  const safeModules = Array.isArray(modules) ? modules : [];
  const safeMatrix = matrix ?? {};

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <SecurityIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h5">مصفوفة الصلاحيات</Typography>
        </Stack>
      }
      content={false}
    >
      <TableContainer>
        <Table sx={{ minWidth: 800 }} aria-label="permissions matrix">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>الوحدة</TableCell>
              {safeRoles.map((role) => (
                <TableCell
                  key={role?.key ?? Math.random()}
                  align="center"
                  sx={{ fontWeight: 600, minWidth: 100 }}
                >
                  {role?.label ?? '—'}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {safeModules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={safeRoles.length + 1} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    لا توجد وحدات معرّفة
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              safeModules.map((module) => (
                <TableRow
                  key={module?.key ?? Math.random()}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  hover
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {module?.label ?? '—'}
                    </Typography>
                  </TableCell>
                  {safeRoles.map((role) => {
                    const hasAccess = safeMatrix?.[module?.key]?.[role?.key] ?? false;
                    return (
                      <TableCell
                        key={`${module?.key}-${role?.key}`}
                        align="center"
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: hasAccess ? 'success.main' : 'text.disabled',
                            fontWeight: hasAccess ? 600 : 400
                          }}
                        >
                          {hasAccess ? '✔️' : '—'}
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
};

// ==============================|| MAIN PAGE ||============================== //

const UsersPermissionsPage = () => {
  return (
    <Box>
      {/* Page Header */}
      <ModernPageHeader
        title="إدارة المستخدمين والصلاحيات"
        subtitle="عرض المستخدمين والأدوار المعتمدة في النظام"
        icon={PeopleAltIcon}
        breadcrumbs={[
          { title: 'الرئيسية', url: '/dashboard' },
          { title: 'الإعدادات', url: '/settings' },
          { title: 'المستخدمون والصلاحيات' }
        ]}
      />

      {/* Content */}
      <Stack spacing={3}>
        {/* Users Table */}
        <UsersTable users={MOCK_USERS} />

        {/* Permissions Matrix */}
        <PermissionsMatrix
          roles={ROLES}
          modules={MODULES}
          matrix={PERMISSIONS_MATRIX}
        />
      </Stack>
    </Box>
  );
};

export default UsersPermissionsPage;
