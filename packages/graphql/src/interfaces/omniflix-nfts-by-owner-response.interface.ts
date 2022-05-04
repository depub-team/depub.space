export interface OmniflixNFTsByOwnerCloudflareCdn {
  filename: string;
  id: string;
  status: string;
  updated_at: Date;
  uploaded_at: Date;
  variants: string[];
}

export interface OmniflixNFTsByOwnerDenomId {
  _id: string;
  verified: boolean;
  IP_infringement: boolean;
  status: string;
  created_at: Date;
  updated_at: Date;
  id: string;
  symbol: string;
  name: string;
  creator: string;
  preview_uri: string;
  description: string;
  schema: string;
  __v: number;
  media_type: string;
  cloudflare_cdn: OmniflixNFTsByOwnerCloudflareCdn;
}

export interface OmniflixNFTsByOwnerCloudflareCdn2 {
  filename: string;
  id: string;
  status: string;
  updated_at: Date;
  uploaded_at: Date;
  variants: string[];
}

export interface OmniflixNFTsByOwnerPrice {
  denom: string;
  amount: number;
}

export interface OmniflixNFTsByOwnerList2 {
  _id: string;
  split_shares: any[];
  status: string;
  created_at: Date;
  updated_at: Date;
  id: string;
  nft_id: string;
  denom_id: string;
  price: OmniflixNFTsByOwnerPrice;
  owner: string;
  __v: number;
}

export interface OmniflixNFTsByOwnerList {
  _id: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  id: string;
  denom_id: OmniflixNFTsByOwnerDenomId;
  name: string;
  transferable: boolean;
  extensible: boolean;
  owner: string;
  creator: string;
  media_uri: string;
  data: string;
  description: string;
  nsfw: boolean;
  royalty_share: number;
  preview_uri: string;
  __v: number;
  media_type: string;
  cloudflare_cdn: OmniflixNFTsByOwnerCloudflareCdn2;
  list: OmniflixNFTsByOwnerList2;
}

export interface OmniflixNFTsByOwnerResult {
  list: OmniflixNFTsByOwnerList[];
  count: number;
}

export interface OmniflixNFTsByOwnerResponse {
  success: boolean;
  result: OmniflixNFTsByOwnerResult;
}
