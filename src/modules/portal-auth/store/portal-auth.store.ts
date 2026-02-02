import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PortalSession, PortalSide } from 'modules/portal/types/portal.types';

const SESSION_DURATION_HOURS = 24;

interface PortalAuthState {
  // Map of transactionId:side -> session
  sessions: Record<string, PortalSession>;
  isLoading: boolean;
}

interface PortalAuthActions {
  // Check if a specific portal is authenticated
  isPortalAuthenticated: (transactionId: string, side: PortalSide) => boolean;

  // Get session for a specific portal
  getSession: (transactionId: string, side: PortalSide) => PortalSession | null;

  // Login to a portal
  login: (transactionId: string, side: PortalSide, password: string) => Promise<boolean>;

  // Logout from a specific portal
  logout: (transactionId: string, side: PortalSide) => void;

  // Logout from all portals
  logoutAll: () => void;

  // Set loading state
  setLoading: (isLoading: boolean) => void;

  // Clean up expired sessions
  cleanupExpiredSessions: () => void;
}

type PortalAuthStore = PortalAuthState & PortalAuthActions;

// Generate session key from transactionId and side
const getSessionKey = (transactionId: string, side: PortalSide): string => {
  return `${transactionId}:${side}`;
};

// Check if session is expired
const isSessionExpired = (session: PortalSession): boolean => {
  return new Date(session.expiresAt) < new Date();
};

export const usePortalAuthStore = create<PortalAuthStore>()(
  persist(
    (set, get) => ({
      sessions: {},
      isLoading: false,

      isPortalAuthenticated: (transactionId: string, side: PortalSide) => {
        const key = getSessionKey(transactionId, side);
        const session = get().sessions[key];

        if (!session) return false;
        if (isSessionExpired(session)) {
          // Clean up expired session
          get().logout(transactionId, side);
          return false;
        }

        return true;
      },

      getSession: (transactionId: string, side: PortalSide) => {
        const key = getSessionKey(transactionId, side);
        const session = get().sessions[key];

        if (!session) return null;
        if (isSessionExpired(session)) {
          get().logout(transactionId, side);
          return null;
        }

        return session;
      },

      login: async (transactionId: string, side: PortalSide, password: string) => {
        set({ isLoading: true });

        try {
          // TODO: Replace with actual API call
          // For now, simulate API validation
          // In production: const response = await portalService.validatePassword(transactionId, side, password);

          // Demo mode: accept any password that isn't empty
          const isValid = password.length > 0;

          if (!isValid) {
            set({ isLoading: false });
            return false;
          }

          const now = new Date();
          const expiresAt = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

          const session: PortalSession = {
            transactionId,
            side,
            authenticatedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
          };

          const key = getSessionKey(transactionId, side);

          set((state) => ({
            sessions: {
              ...state.sessions,
              [key]: session,
            },
            isLoading: false,
          }));

          return true;
        } catch (error) {
          console.error('[PortalAuth] Login failed:', error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: (transactionId: string, side: PortalSide) => {
        const key = getSessionKey(transactionId, side);

        set((state) => {
          const { [key]: removed, ...rest } = state.sessions;
          return { sessions: rest };
        });
      },

      logoutAll: () => {
        set({ sessions: {} });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      cleanupExpiredSessions: () => {
        set((state) => {
          const activeSessions: Record<string, PortalSession> = {};

          Object.entries(state.sessions).forEach(([key, session]) => {
            if (!isSessionExpired(session)) {
              activeSessions[key] = session;
            }
          });

          return { sessions: activeSessions };
        });
      },
    }),
    {
      name: 'portal-auth-storage',
      partialize: (state) => ({
        sessions: state.sessions,
      }),
    }
  )
);

// Clean up expired sessions on store initialization
if (typeof window !== 'undefined') {
  setTimeout(() => {
    usePortalAuthStore.getState().cleanupExpiredSessions();
  }, 0);
}
