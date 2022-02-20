export interface ChainLink {
  chainConfig: {
    name: string;
  };
  externalAddress: string;
}

export interface DesmosProfile {
  address: string;
  applicationLinks: [];
  bio: string;
  chainLinks: ChainLink[];
  coverPic: string;
  creationTime: string; // ISO timestamp
  dtag: string;
  nickname: string;
  profilePic: string;
}

export interface DesmosProfileWithId extends DesmosProfile {
  id: string;
}
