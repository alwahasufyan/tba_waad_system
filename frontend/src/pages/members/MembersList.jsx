import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  TablePagination,
  InputAdornment,
  Tooltip,
  Paper,
  TableSortLabel,
  Alert
} from '@mui/material';

// Insurance UX Components - Phase B2
import { MemberTypeIndicator, CardStatusBadge } from 'components/insurance';

import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PeopleAlt as PeopleAltIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import MainCard from 'components/MainCard';
import ModernPageHeader from 'components/tba/ModernPageHeader';
import ModernEmptyState from 'components/tba/ModernEmptyState';
import TableSkeleton from 'components/tba/LoadingSkeleton';
import { useMembersList } from 'hooks/useMembers';
import { deleteMember } from 'services/api/members.service';

// Static Arabic labels
const LABELS = {
  members: 'الأعضاء',
  membersDesc: 'إدارة أعضاء التأمين',
  addMember: 'إضافة عضو',
  search: 'البحث في الأعضاء...',
  searchBtn: 'بحث',
  deleteConfirm: 'هل تريد حذف هذا العضو؟',
  deleteError: 'فشل في حذف العضو',
  noFound: 'لم يتم العثور على أعضاء',
  noFoundDesc: 'ابدأ بإضافة أول عضو',
  error: 'خطأ',
  loadError: 'فشل في تحميل الأعضاء',
  rowsPerPage: 'عدد الصفوف في الصفحة:',
  refresh: 'تحديث',
  view: 'عرض',
  edit: 'تعديل',
  delete: 'حذف',
  // Table headers
  id: 'رقم',
  fullName: 'الاسم الكامل',
  memberType: 'نوع العضو',
  civilId: 'رقم الهوية المدنية',
  employer: 'صاحب العمل',
  policyNumber: 'رقم البوليصة',
  phone: 'الهاتف',
  email: 'البريد الإلكتروني',
  cardStatus: 'حالة البطاقة',
  actions: 'الإجراءات'
};

/**
 * Members List Page
 * Displays paginated list of members with search, sort, and CRUD operations
 * Backend: MemberController → MemberViewDto (list endpoint)
 */
const MembersList = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const { data, loading, error, params, setParams, refresh } = useMembersList({
    page: 1,
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'desc'
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setParams((prev) => ({ ...prev, page: 1, search: searchInput.trim() }));
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(property);
    setParams((prev) => ({
      ...prev,
      sortBy: property,
      sortDir: newOrder
    }));
  };

  const handleChangePage = useCallback(
    (_, newPage) => {
      setParams((prev) => ({ ...prev, page: newPage + 1 }));
    },
    [setParams]
  );

  const handleChangeRowsPerPage = useCallback(
    (event) => {
      setParams((prev) => ({
        ...prev,
        page: 1,
        size: parseInt(event.target.value, 10)
      }));
    },
    [setParams]
  );

  const handleDelete = async (id) => {
    if (!window.confirm(LABELS.deleteConfirm)) return;
    try {
      await deleteMember(id);
      refresh();
    } catch (err) {
      console.error('[MembersList] Failed to delete member:', err);
      alert(LABELS.deleteError);
    }
  };

  const handleRefresh = () => {
    setSearchInput('');
    setParams({ page: 1, size: 20, sortBy: 'createdAt', sortDir: 'desc', search: '' });
    refresh();
  };

  // Table columns based on MemberViewDto fields
  const headCells = [
    { id: 'id', label: LABELS.id, sortable: true },
    { id: 'fullNameArabic', label: LABELS.fullName, sortable: true },
    { id: 'memberType', label: LABELS.memberType, sortable: false },
    { id: 'civilId', label: LABELS.civilId, sortable: true },
    { id: 'employerName', label: LABELS.employer, sortable: false },
    { id: 'policyNumber', label: LABELS.policyNumber, sortable: true },
    { id: 'phone', label: LABELS.phone, sortable: false },
    { id: 'email', label: LABELS.email, sortable: false },
    { id: 'cardStatus', label: LABELS.cardStatus, sortable: true },
    { id: 'actions', label: LABELS.actions, sortable: false, align: 'center' }
  ];

  const tableContent = useMemo(() => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={headCells.length}>
            <TableSkeleton />
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={headCells.length}>
            <Alert severity="error" sx={{ my: 2 }}>
              {LABELS.error}: {error.message || LABELS.loadError}
            </Alert>
          </TableCell>
        </TableRow>
      );
    }

    if (!data?.items || data.items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={headCells.length}>
            <ModernEmptyState
              icon={PeopleAltIcon}
              title={LABELS.noFound}
              description={LABELS.noFoundDesc}
              action={
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/members/add')}>
                  {LABELS.addMember}
                </Button>
              }
            />
          </TableCell>
        </TableRow>
      );
    }

    return data.items.map((member) => (
      <TableRow hover key={member?.id ?? Math.random()} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell>
          <Typography variant="body2" fontWeight={500}>
            {member?.id ?? '-'}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={500}>
            {member?.fullNameArabic || member?.fullNameEnglish || '-'}
          </Typography>
          {member?.fullNameEnglish && (
            <Typography variant="caption" color="text.secondary" display="block">
              {member.fullNameEnglish}
            </Typography>
          )}
        </TableCell>
        <TableCell>
          {/* Insurance UX - MemberTypeIndicator */}
          <MemberTypeIndicator
            memberType={member?.memberType ?? 'PRINCIPAL'}
            relationship={member?.relationship}
            size="small"
            variant="chip"
          />
        </TableCell>
        <TableCell>
          <Chip label={member?.civilId || '-'} size="small" variant="outlined" color="primary" />
        </TableCell>
        <TableCell>
          <Typography variant="body2">{member?.employerName || '-'}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{member?.policyNumber || '-'}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{member?.phone || '-'}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            {member?.email || '-'}
          </Typography>
        </TableCell>
        <TableCell>
          {/* Insurance UX - CardStatusBadge (replaces simple active/inactive chip) */}
          <CardStatusBadge
            status={member?.cardStatus ?? (member?.active ? 'ACTIVE' : 'INACTIVE')}
            size="small"
            variant="chip"
          />
        </TableCell>
        <TableCell align="center">
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <Tooltip title={LABELS.view}>
              <IconButton size="small" color="primary" onClick={() => navigate(`/members/${member?.id}`)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={LABELS.edit}>
              <IconButton size="small" color="info" onClick={() => navigate(`/members/edit/${member?.id}`)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={LABELS.delete}>
              <IconButton size="small" color="error" onClick={() => handleDelete(member?.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>
    ));
  }, [data, loading, error, headCells.length, navigate]);

  return (
    <>
      <ModernPageHeader
        title={LABELS.members}
        subtitle={LABELS.membersDesc}
        icon={PeopleAltIcon}
        breadcrumbs={[{ label: LABELS.members, path: '/members' }]}
        actions={
          <Stack direction="row" spacing={2}>
            <Tooltip title={LABELS.refresh}>
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/members/add')}>
              {LABELS.addMember}
            </Button>
          </Stack>
        }
      />

      <MainCard content={false}>
        {/* Toolbar */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              size="small"
              placeholder={LABELS.search}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              sx={{ maxWidth: { sm: 400 } }}
            />
            <Button variant="outlined" onClick={handleSearchSubmit} sx={{ minWidth: 100 }}>
              {LABELS.searchBtn}
            </Button>
          </Stack>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table sx={{ minWidth: 750 }} size="medium">
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell key={headCell.id} align={headCell.align || 'left'} sx={{ fontWeight: 600 }}>
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>{tableContent}</TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {!loading && !error && data?.items && data.items.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[10, 20, 50, 100]}
            component="div"
            count={data.total || 0}
            rowsPerPage={params.size}
            page={params.page - 1}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={LABELS.rowsPerPage}
          />
        )}
      </MainCard>
    </>
  );
};

export default MembersList;
