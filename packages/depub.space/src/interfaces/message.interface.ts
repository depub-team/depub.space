import { UserProfile } from './user-profile.interface';

export interface Message {
  id: string;
  from: string;
  date: Date;
  message?: string;
  profile?: UserProfile;
  images?: string[];
}
