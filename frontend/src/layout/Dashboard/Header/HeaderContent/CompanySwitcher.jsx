import { useState, useEffect } from 'react';
import { Box, FormControl, Select, MenuItem, Typography, Chip, Avatar } from '@mui/material';
import { BankOutlined, LockOutlined } from '@ant-design/icons';
import { useEmployerContext, useRoles } from 'api/rbac';
import axios from 'utils/axios';

// ==============================|| EMPLOYER SWITCHER ||============================== //

export default function CompanySwitcher() {
  const roles = useRoles();
  const { employerId, canSwitch, setEmployerId } = useEmployerContext();
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch employers if switcher should be shown
    if (!canSwitch) {
      return;
    }

    // Fetch employers for eligible users
    const fetchEmployers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/employers', {
          params: { page: 0, size: 100 }
        });
        const employersList = response.data.data?.items || response.data.items || response.data || [];
        setEmployers(employersList);
      } catch (error) {
        console.error('Error fetching employers:', error);
        setEmployers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSwitch]);

  // Don't show for users who can't switch (EMPLOYER role is locked to their company)
  if (!canSwitch) {
    return null;
  }

  const handleEmployerChange = (event) => {
    const selectedId = event.target.value;
    setEmployerId(selectedId); // RBAC store handles everything (localStorage, axios headers, etc.)
  };

  const getEmployerInitials = (name) => {
    if (!name) return 'E';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <Box sx={{ minWidth: 200, display: 'flex', alignItems: 'center', gap: 1 }}>
        <BankOutlined style={{ fontSize: 20 }} />
        <Typography variant="body2">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minWidth: 200 }}>
      <FormControl fullWidth size="small">
        <Select
          value={employerId || ''}
          onChange={handleEmployerChange}
          displayEmpty
          disabled={!canSwitch}
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }
          }}
          renderValue={(selected) => {
            if (!selected) {
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BankOutlined />
                  <Typography variant="body2">Select Employer</Typography>
                </Box>
              );
            }
            const employer = employers.find((e) => e.id === selected);
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {!canSwitch && <LockOutlined style={{ fontSize: 16, color: 'text.secondary' }} />}
                <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'primary.main' }}>{getEmployerInitials(employer?.name)}</Avatar>
                <Typography variant="body2">{employer?.name || 'Unknown'}</Typography>
              </Box>
            );
          }}
        >
          {employers.length === 0 ? (
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                No employers available
              </Typography>
            </MenuItem>
          ) : (
            employers.map((employer) => (
              <MenuItem key={employer.id} value={employer.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.light' }}>
                    {getEmployerInitials(employer.name)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {employer.name}
                    </Typography>
                    {employer.code && (
                      <Typography variant="caption" color="text.secondary">
                        {employer.code}
                      </Typography>
                    )}
                  </Box>
                  {employer.id === employerId && <Chip label="Active" size="small" color="primary" />}
                </Box>
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>
    </Box>
  );
}
