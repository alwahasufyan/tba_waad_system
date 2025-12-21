import { useMemo } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// project imports
import Profile from './Profile';
import Localization from './Localization';
import CompanySwitcher from './CompanySwitcher';
import Notification from './Notification';
import FullScreen from './FullScreen';
import Customization from './Customization';
import MobileSection from './MobileSection';
// MegaMenuSection removed - Phase D0 (No demo pages)

import useConfig from 'hooks/useConfig';
import { MenuOrientation } from 'config';
import DrawerHeader from 'layout/Dashboard/Drawer/DrawerHeader';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const { state } = useConfig();

  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const localization = useMemo(() => <Localization />, []);
  const companySwitcher = useMemo(() => <CompanySwitcher />, []);

  // MegaMenuSection removed - Phase D0

  return (
    <>
      {state.menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}
      <Box sx={{ width: 1, ml: 1 }} />

      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
        {/* MegaMenu removed - No demo pages in production */}
        {!downLG && companySwitcher}
        {!downLG && <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />}
        {localization}
        <Notification />
        {!downLG && <FullScreen />}
        <Customization />
        {!downLG && <Profile />}
        {downLG && <MobileSection />}
      </Stack>
    </>
  );
}
