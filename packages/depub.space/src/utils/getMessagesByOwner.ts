import axios from 'axios';
import { Message, User } from '../interfaces';

import { ROWS_PER_PAGE, GRAPHQL_QUERY_MESSAGES_BY_USER } from '../constants';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || '';

export interface MessagesByOwnerResponse {
  getUser: User & {
    messages: Message[];
  };
}

export const getMessagesByOwner = async (owner: string, previousId?: string) => {
  const { data } = await axios.post<{ data: MessagesByOwnerResponse }>(
    GRAPHQL_URL,
    {
      variables: {
        dtagOrAddress: owner,
        previousId,
        limit: ROWS_PER_PAGE,
      },
      query: GRAPHQL_QUERY_MESSAGES_BY_USER,
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
