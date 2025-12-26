import { RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';

// MUI X Date Pickers
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// project imports
import router from 'routes';
import ThemeCustomization from 'themes';

import Locales from 'components/Locales';
import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/third-party/Notistack';
import Metrics from 'metrics';
import Loader from 'components/Loader';

// auth-provider
import { AuthProvider } from 'contexts/AuthContext';

// NOTE: CompanyProvider removed - employers no longer auto-loaded into global context
// Employer data is fetched on-demand in specific pages (EmployerList, EmployerEdit, etc.)

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <>
      <ThemeCustomization>
        <RTLLayout>
          <Locales>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <ScrollTop>
                <AuthProvider>
                  <Notistack>
                    <Suspense fallback={<Loader />}>
                      <RouterProvider router={router} />
                    </Suspense>
                    <Snackbar />
                  </Notistack>
                </AuthProvider>
              </ScrollTop>
            </LocalizationProvider>
          </Locales>
        </RTLLayout>
      </ThemeCustomization>
      <Metrics />
    </>
  );
}
