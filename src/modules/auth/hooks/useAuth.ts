import { useAuthStore } from '../store/auth.store';

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, login, logout, setLoading, updateUser } =
    useAuthStore();

  // Provide compatibility with old AuthProvider interface
  const setSession = (user: any, token: string) => {
    login(user, token);
  };

  const signout = () => {
    logout();
  };

  return {
    // New interface
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setLoading,
    updateUser,
    // Old interface for compatibility
    sessionUser: user,
    setSession,
    signout,
  };
};

