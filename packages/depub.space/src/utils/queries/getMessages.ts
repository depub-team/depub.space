import { queryClient } from './queryClient';
import { Message, PaginatedResponse } from '../../interfaces';
import { ROWS_PER_PAGE, GRAPHQL_QUERY_MESSAGES } from '../../constants';

export interface MessagesQueryResponse {
  messages: Message[];
}

export const getMessages = async (
  previousId?: string,
  limit = ROWS_PER_PAGE
): Promise<PaginatedResponse<Message[]>> => {
  const { data } = await queryClient.post<{ data: MessagesQueryResponse }>(
    '',
    {
      variables: {
        previousId: previousId || null, // graphql not accepts undefined
        limit,
      },
      query: GRAPHQL_QUERY_MESSAGES,
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  );

  if (data && data.data.messages.length) {
    return {
      data: data.data.messages.filter(message => Boolean(message)),
      hasMore: data.data.messages.length >= limit,
    };
  }

  return {
    data: [],
    hasMore: false,
  };
};
