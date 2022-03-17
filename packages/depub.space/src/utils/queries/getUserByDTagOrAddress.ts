import { queryClient } from './queryClient';
import { User } from '../../interfaces';

import { GRAPHQL_QUERY_GET_USER } from '../../constants';

export interface GetUserResponse {
  getUser: User;
}

export const getUserByDTagOrAddress = async (dtagOrAddress: string) => {
  const { data } = await queryClient.post<{ data: GetUserResponse }>('', {
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
