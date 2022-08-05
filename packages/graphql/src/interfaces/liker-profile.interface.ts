export interface LikerProfile {
  __typename: 'LikerProfile';
  user: string;
  displayName: string;
  avatar: string;
  cosmosWallet: string;
  likeWallet: string;
  civicLikerSince: number;
  isSubscribedCivicLiker: boolean;
}
