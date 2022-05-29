import { UserProfile } from './user-profile.interface';

export interface ChainLink {
  chainConfig: {
    name: string;
  };
  externalAddress: string;
}
export interface DesmosProfile extends UserProfile {
  applicationLinks: [];
  chainLinks: ChainLink[];
  coverPic: string;
  creationTime: string; // ISO timestamp
}
