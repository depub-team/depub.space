export interface ChainLink {
  chainConfig: {
    name: string;
  };
  externalAddress: string;
}

export interface DesmosProfile {
  likecoinAddress: string;
  applicationLinks: [];
  chainLinks: ChainLink[];
  creationTime: string; // ISO timestamp
  address: string;
  bio: string;
  coverPic: string;
  dtag: string;
  nickname: string;
  profilePic: string;
}
