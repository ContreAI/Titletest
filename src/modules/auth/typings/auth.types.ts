export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  name?: string;
  avatar?: string | null;
  designation?: string;
  phone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  initSession: () => Promise<void>;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export type AuthStore = AuthState & AuthActions;

