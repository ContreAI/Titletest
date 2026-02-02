import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { configureApiClient } from '@contreai/api-client';
import BreakpointsProvider from 'providers/BreakpointsProvider';
import NotistackProvider from 'providers/NotistackProvider';
import SettingsPanelProvider from 'providers/SettingsPanelProvider';
import SettingsProvider from 'providers/SettingsProvider';
import ThemeProvider from 'providers/ThemeProvider';
import ErrorBoundary from 'components/errors/ErrorBoundary';
import router from 'routes/router';
import SWRConfiguration from 'services/configuration/SWRConfiguration';
import axiosInstance from 'services/axios/axiosInstance';
import './locales/i18n';

// Configure the API client to use the app's axios instance
// This enables cookie-based auth, response unwrapping, and 401 handling
configureApiClient(axiosInstance);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <SWRConfiguration>
        <SettingsProvider>
          <ThemeProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <NotistackProvider>
                <BreakpointsProvider>
                  {/* <CssBaseline enableColorScheme /> */}
                  <SettingsPanelProvider>
                    <RouterProvider router={router} />
                  </SettingsPanelProvider>
                </BreakpointsProvider>
              </NotistackProvider>
            </LocalizationProvider>
          </ThemeProvider>
        </SettingsProvider>
      </SWRConfiguration>
    </ErrorBoundary>
  </React.StrictMode>,
);
