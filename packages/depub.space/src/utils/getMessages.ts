import axios from 'axios';
import { Message } from '../interfaces';
import { ROWS_PER_PAGE, GRAPHQL_QUERY_MESSAGES } from '../constants';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || '';

export interface MessagesQueryResponse {
  messages: Message[];
}

export const getMessages = async (previousId?: string) => {
  const { data } = await axios.post<{ data: MessagesQueryResponse }>(
    GRAPHQL_URL,
    {
      variables: {
        previousId: previousId || null, // graphql not accepts undefined
        limit: ROWS_PER_PAGE,
      },
      query: GRAPHQL_QUERY_MESSAGES,
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  );

  if (data && data.data.messages) {
    return data.data.messages;
  }

  return [];
};
