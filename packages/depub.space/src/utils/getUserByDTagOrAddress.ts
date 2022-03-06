import axios from 'axios';
import { User } from '../interfaces';

import { GRAPHQL_QUERY_GET_USER } from '../constants';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || '';

export interface GetUserResponse {
  getUser: User;
}

export const getUserByDTagOrAddress = async (dtagOrAddress: string) => {
  const { data } = await axios.post<{ data: GetUserResponse }>(
    GRAPHQL_URL,
    {
      variables: {
        dtagOrAddress,
      },
      query: GRAPHQL_QUERY_GET_USER,
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  );

  if (data && data.data.getUser) {
    return data.data.getUser;
  }

  return null;
};
