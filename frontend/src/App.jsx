import { RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';

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
import { CompanyProvider } from 'contexts/CompanyContext';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <>
      <ThemeCustomization>
        <RTLLayout>
          <Locales>
            <ScrollTop>
              <AuthProvider>
                <CompanyProvider>
                  <Notistack>
                    <Suspense fallback={<Loader />}>
                      <RouterProvider router={router} />
                    </Suspense>
                    <Snackbar />
                  </Notistack>
                </CompanyProvider>
              </AuthProvider>
            </ScrollTop>
          </Locales>
        </RTLLayout>
      </ThemeCustomization>
      <Metrics />
    </>
  );
}
