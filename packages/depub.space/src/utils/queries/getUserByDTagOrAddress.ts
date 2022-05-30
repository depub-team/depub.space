import { graphqlClient } from '../graphqlClient';
import { User } from '../../interfaces';

import { GRAPHQL_QUERY_GET_USER } from '../../constants';

export interface GetUserResponse {
  getUser: User;
}

export const getUserByDTagOrAddress = async (dtagOrAddress: string) => {
  const { data } = await graphqlClient.post<{ data: GetUserResponse }>('', {
    variables: {
      dtagOrAddress,
    },
    query: GRAPHQL_QUERY_GET_USER,
  });

  if (data && data.data.getUser) {
    return data.data.getUser;
  }

  return null;
};
