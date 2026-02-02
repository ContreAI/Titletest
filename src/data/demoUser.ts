import avatar14 from 'assets/images/avatar/avatar_14.webp';
import { User } from 'modules/auth/typings/auth.types';

export const demoUser: User = {
  id: 'guest',
  email: 'guest@mail.com',
  firstName: 'Guest',
  lastName: 'User',
  role: 'user',
  name: 'Guest User',
  avatar: avatar14,
  designation: 'Merchant Captain',
};

