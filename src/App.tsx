import { useEffect, useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useConfigFromQuery } from 'hooks/useConfigFromQuery';
import { useThemeMode } from 'hooks/useThemeMode';
import { useSettingsContext } from 'providers/SettingsProvider';
import { useAuthStore } from 'modules/auth/store/auth.store';
import { useSocketStore } from 'services/socket/socket.store';
import { initTenantClaimsSync } from 'modules/tenant';
import { REFRESH } from 'reducers/SettingsReducer';
import SettingPanelToggler from 'components/settings-panel/SettingPanelToggler';
import SettingsPanel from 'components/settings-panel/SettingsPanel';
import AIAssistant from 'components/ai-assistant';

const App = () => {
  const { pathname } = useLocation();
  const { stableMode } = useThemeMode();
  const { configDispatch } = useSettingsContext();
  const initSessionRef = useRef(false);

  useConfigFromQuery();

  // Initialize session from Supabase cookies on app load (only once)
  // Also set up tenant claims sync and socket connection
  useEffect(() => {
    if (!initSessionRef.current) {
      initSessionRef.current = true;

      // Initialize tenant claims sync (subscribes to auth state changes)
      initTenantClaimsSync();

      // Initialize socket with auth subscription (auto-connects when authenticated)
      const cleanupSocket = useSocketStore.getState().initializeSocket();

      // Initialize auth session
      useAuthStore.getState().initSession().catch(err => {
        console.error('[App] Init session error:', err);
      });

      // Return cleanup (though this effect only runs once)
      return cleanupSocket;
    }
  }, []);

  const isShowcase = pathname.startsWith('/showcase');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overscrollBehavior = isShowcase ? 'none' : '';

    return () => {
      document.body.style.overscrollBehavior = '';
    };
  }, [pathname, isShowcase]);

  useLayoutEffect(() => {
    configDispatch({ type: REFRESH });
  }, [stableMode, configDispatch]);

  return (
    <>
      <Outlet />

      {/* AI Assistant Chat */}
      <AIAssistant />

      {!isShowcase && (
        <>
          <SettingsPanel />
          <SettingPanelToggler />
        </>
      )}
    </>
  );
};

export default App;
