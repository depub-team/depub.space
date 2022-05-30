import { graphqlClient } from '../graphqlClient';
import { Message, PaginatedResponse, User } from '../../interfaces';

import { ROWS_PER_PAGE, GRAPHQL_QUERY_MESSAGES_BY_USER } from '../../constants';

export type GetUserWithMessagesResponse = User & {
  messages: Message[];
};
export interface MessagesByOwnerResponse {
  getUser: GetUserWithMessagesResponse;
}

export const getMessagesByOwner = async (
  owner: string,
  previousId?: string,
  limit = ROWS_PER_PAGE
): Promise<PaginatedResponse<GetUserWithMessagesResponse | null>> => {
  const { data } = await graphqlClient.post<{ data: MessagesByOwnerResponse }>('', {
    variables: {
      dtagOrAddress: owner,
      previousId,
      limit,
    },
    query: GRAPHQL_QUERY_MESSAGES_BY_USER,
  });

  return {
    data: data.data.getUser,
    hasMore: data.data.getUser.messages.length >= limit,
  };
};
