import { UserProfile } from './user-profile.interface';

export interface User {
  id: string;
  profile?: UserProfile;
}
