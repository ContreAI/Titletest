export interface User {
  id: string | number;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
  status?: 'online' | 'offline' | 'away';
}

