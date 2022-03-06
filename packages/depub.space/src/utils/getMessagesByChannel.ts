import axios from 'axios';
import { Message } from '../interfaces';

import { ROWS_PER_PAGE, GRAPHQL_QUERY_MESSAGES_BY_TAG } from '../constants';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || '';

export interface MessagesByChannelQueryResponse {
  messagesByTag: Message[];
}

export const getMessagesByChannel = async (
  channel: string,
  previousId?: string,
  limit = ROWS_PER_PAGE
) => {
  const { data } = await axios.post<{ data: MessagesByChannelQueryResponse }>(
    GRAPHQL_URL,
    {
      variables: {
        tag: channel,
        previousId,
        limit,
      },
      query: GRAPHQL_QUERY_MESSAGES_BY_TAG,
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  );

  if (data && data.data.messagesByTag) {
    return data.data.messagesByTag;
  }

  return [];
};
