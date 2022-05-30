import { GRAPHQL_QUERY_STARGAZE_NFT_BY_USER } from '../../constants';
import type { NFTAsset } from '../../interfaces';
import { graphqlClient } from '../graphqlClient';

export interface GetStargazeNFTsByOwnerResponse {
  getStargazeNFTsByOwner: NFTAsset[];
}

export const getStargazeNFTsByOwner = async (owner: string): Promise<NFTAsset[]> => {
  const { data } = await graphqlClient.post<{ data: GetStargazeNFTsByOwnerResponse }>('', {
    variables: {
      owner,
    },
    query: GRAPHQL_QUERY_STARGAZE_NFT_BY_USER,
  });

  if (data && data.data.getStargazeNFTsByOwner) {
    return data.data.getStargazeNFTsByOwner;
  }

  return [];
};
