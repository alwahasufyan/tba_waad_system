import { useLayoutEffect, useState } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// project imports
import NavItem from './NavItem';
import NavGroup from './NavGroup';

import useConfig from 'hooks/useConfig';
import useAuth from 'hooks/useAuth';
import useRBACSidebar from 'hooks/useRBACSidebar';
import { HORIZONTAL_MAX_ITEM, MenuOrientation } from 'config';
import { useGetMenuMaster } from 'api/menu';

function isFound(arr, str) {
  return arr.items.some((element) => {
    if (element.id === str) {
      return true;
    }
    return false;
  });
}

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

export default function Navigation() {
  const { state } = useConfig();
  const { user } = useAuth();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  // Phase B2: Use dynamic RBAC sidebar
  const { sidebarItems, loading } = useRBACSidebar();

  const [selectedID, setSelectedID] = useState('');
  const [selectedItems, setSelectedItems] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [menuItems, setMenuItems] = useState({ items: [] });

  useLayoutEffect(() => {
    if (!loading && sidebarItems.length > 0) {
      // Convert flat sidebarItems to menu structure
      // For now, we'll create a single group with all items as children
      const menuStructure = {
        items: [
          {
            id: 'main-group',
            type: 'group',
            translationKey: '',
            children: sidebarItems.map(item => ({
              id: item.id,
              translationKey: item.translationKey,
              type: 'item',
              url: item.path,
              icon: item.icon,
              breadcrumbs: false
            }))
          }
        ]
      };
      
      setMenuItems(menuStructure);
    }
  }, [loading, sidebarItems]);

  const isHorizontal = state.menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  // Show loading spinner while fetching feature toggles
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  const lastItem = isHorizontal ? HORIZONTAL_MAX_ITEM : null;
  let lastItemIndex = menuItems.items.length - 1;
  let remItems = [];
  let lastItemId;

  //  first it checks menu item is more than giving HORIZONTAL_MAX_ITEM after that get lastItemid by giving horizontal max
  // item and it sets horizontal menu by giving horizontal max item lastly slice menuItem from array and set into remItems

  if (lastItem && lastItem < menuItems.items.length) {
    lastItemId = menuItems.items[lastItem - 1].id;
    lastItemIndex = lastItem - 1;
    remItems = menuItems.items.slice(lastItem - 1, menuItems.items.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon,
      ...(item.url && {
        url: item.url
      })
    }));
  }

  const navGroups = menuItems.items.slice(0, lastItemIndex + 1).map((item, index) => {
    switch (item.type) {
      case 'group':
        if (item.url && item.id !== lastItemId) {
          return (
            <List key={item.id} sx={{ zIndex: 0, ...(isHorizontal && { mt: 0.5 }) }}>
              {!isHorizontal && index !== 0 && <Divider sx={{ my: 0.5 }} />}
              <NavItem item={item} level={1} isParents setSelectedID={setSelectedID} />
            </List>
          );
        }

        return (
          <NavGroup
            key={item.id}
            setSelectedID={setSelectedID}
            setSelectedItems={setSelectedItems}
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            selectedID={selectedID}
            selectedItems={selectedItems}
            lastItem={lastItem}
            remItems={remItems}
            lastItemId={lastItemId}
            item={item}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return (
    <Box
      sx={{
        pt: drawerOpen ? (isHorizontal ? 0 : 2) : 0,
        ...(!isHorizontal && { '& > ul:first-of-type': { mt: 0 } }),
        display: isHorizontal ? { xs: 'block', lg: 'flex' } : 'block'
      }}
    >
      {navGroups}
    </Box>
  );
}
