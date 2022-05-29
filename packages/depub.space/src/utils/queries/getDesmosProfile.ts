import { graphqlClient } from '../graphqlClient';
import { UserProfile } from '../../interfaces';

import { GRAPHQL_QUERY_GET_DESMOS_PROFILE } from '../../constants';

export interface GetDesmosProfileResponse {
  getDesmosProfile: UserProfile;
}

export const getDesmosProfile = async (dtagOrAddress: string) => {
  const { data } = await graphqlClient.post<{ data: GetDesmosProfileResponse }>('', {
    variables: {
      dtagOrAddress,
    },
    query: GRAPHQL_QUERY_GET_DESMOS_PROFILE,
  });

  if (data && data.data.getDesmosProfile) {
    return data.data.getDesmosProfile;
  }

  return null;
};
