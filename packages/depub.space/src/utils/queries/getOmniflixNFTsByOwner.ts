import { GRAPHQL_QUERY_OMNIFLIX_NFT_BY_USER } from '../../constants';
import type { NFTAsset } from '../../interfaces';
import { graphqlClient } from '../graphqlClient';

export interface GetOmniflixNFTsByOwnerResponse {
  getOmniflixNFTsByOwner: NFTAsset[];
}

export const getOmniflixNFTsByOwner = async (owner: string): Promise<NFTAsset[]> => {
  const { data } = await graphqlClient.post<{ data: GetOmniflixNFTsByOwnerResponse }>('', {
    variables: {
      owner,
    },
    query: GRAPHQL_QUERY_OMNIFLIX_NFT_BY_USER,
  });

  if (data && data.data.getOmniflixNFTsByOwner) {
    return data.data.getOmniflixNFTsByOwner;
  }

  return [];
};
