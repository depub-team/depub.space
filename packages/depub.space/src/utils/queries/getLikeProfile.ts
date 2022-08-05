import { graphqlClient } from '../graphqlClient';
import { LikerProfile } from '../../interfaces';

import { GRAPHQL_QUERY_GET_LIKER_PROFILE } from '../../constants';

export interface GetLikerProfileResponse {
  getLikerProfile: LikerProfile;
}

export const getLikerProfile = async (dtagOrAddress: string): Promise<LikerProfile | null> => {
  const { data } = await graphqlClient.post<{ data: GetLikerProfileResponse }>('', {
    variables: {
      dtagOrAddress,
    },
    query: GRAPHQL_QUERY_GET_LIKER_PROFILE,
  });

  if (data && data.data.getLikerProfile) {
    return data.data.getLikerProfile;
  }

  return null;
};
