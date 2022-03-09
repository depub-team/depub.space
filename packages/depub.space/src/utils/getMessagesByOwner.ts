import axios from 'axios';
import { Message, PaginatedResponse, User } from '../interfaces';

import { ROWS_PER_PAGE, GRAPHQL_QUERY_MESSAGES_BY_USER } from '../constants';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || '';

export type GetUserResponse = User & {
  messages: Message[];
};
export interface MessagesByOwnerResponse {
  getUser: GetUserResponse;
}

export const getMessagesByOwner = async (
  owner: string,
  previousId?: string,
  limit = ROWS_PER_PAGE
): Promise<PaginatedResponse<GetUserResponse | null>> => {
  const { data } = await axios.post<{ data: MessagesByOwnerResponse }>(
    GRAPHQL_URL,
    {
      variables: {
        dtagOrAddress: owner,
        previousId,
        limit,
      },
      query: GRAPHQL_QUERY_MESSAGES_BY_USER,
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  );

  if (data && data.data.getUser.messages.length) {
    return {
      data: data.data.getUser,
      hasMore: data.data.getUser.messages.length >= limit,
    };
  }

  return {
    data: null,
    hasMore: false,
  };
};
