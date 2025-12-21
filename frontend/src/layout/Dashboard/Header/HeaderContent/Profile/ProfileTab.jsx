import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// assets
import UserOutlined from '@ant-design/icons/UserOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //
// Phase D0: Simplified profile menu - only Profile, Settings, Logout

export default function ProfileTab({ handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleListItemClick = (event, index, route = '') => {
    setSelectedIndex(index);

    if (route && route !== '') {
      navigate(route);
    }
  };

  useEffect(() => {
    const pathToIndex = {
      '/profile': 0,
      '/settings': 1
    };

    setSelectedIndex(pathToIndex[location.pathname] ?? undefined);
  }, [location.pathname]);

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      <ListItemButton selected={selectedIndex === 0} onClick={(event) => handleListItemClick(event, 0, '/profile')}>
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>
        <ListItemText primary="الملف الشخصي" />
      </ListItemButton>
      <ListItemButton selected={selectedIndex === 1} onClick={(event) => handleListItemClick(event, 1, '/settings')}>
        <ListItemIcon>
          <SettingOutlined />
        </ListItemIcon>
        <ListItemText primary="الإعدادات" />
      </ListItemButton>
      <ListItemButton selected={selectedIndex === 2} onClick={handleLogout}>
        <ListItemIcon>
          <LogoutOutlined />
        </ListItemIcon>
        <ListItemText primary="تسجيل الخروج" />
      </ListItemButton>
    </List>
  );
}

ProfileTab.propTypes = { handleLogout: PropTypes.func };
