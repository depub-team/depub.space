import axios from 'axios';
import { Message, PaginatedResponse } from '../interfaces';
import { ROWS_PER_PAGE, GRAPHQL_QUERY_MESSAGES } from '../constants';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || '';

export interface MessagesQueryResponse {
  messages: Message[];
}

export const getMessages = async (
  previousId?: string,
  limit = ROWS_PER_PAGE
): Promise<PaginatedResponse<Message[]>> => {
  const { data } = await axios.post<{ data: MessagesQueryResponse }>(
    GRAPHQL_URL,
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
      data: data.data.messages,
      hasMore: data.data.messages.length >= limit,
    };
  }

  return {
    data: [],
    hasMore: false,
  };
};
