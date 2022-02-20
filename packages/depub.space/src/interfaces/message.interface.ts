import { DesmosProfile } from './desmos-profile.interface';

export interface Message {
  id: string;
  from: string;
  date: Date;
  message?: string;
  profile?: DesmosProfile;
  images?: string[];
}
