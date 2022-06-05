export interface RoyaltyInfo {
  payment_address: string;
  share: string;
}

export interface Collection {
  creator: string;
  description: string;
  image: string;
  external_link: string;
  royalty_info: RoyaltyInfo;
  name: string;
  symbol: string;
  contractAddress: string;
  marketplaceInfo?: any;
}

export interface StargazeNFT {
  name: string;
  image: string;
  description: string;
  external_url: string;
  tokenId: string;
  creator: string;
  owner: string;
  tokenUri: string;
  collection: Collection;
  price: string;
  expiresAt: string;
  expiresAtDateTime?: Date;
  edition: any;
}
