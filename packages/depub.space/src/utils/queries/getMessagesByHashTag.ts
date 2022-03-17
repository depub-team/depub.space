import { queryClient } from './queryClient';
import { Message, PaginatedResponse } from '../../interfaces';

import { ROWS_PER_PAGE, GRAPHQL_QUERY_MESSAGES_BY_TAG } from '../../constants';

export interface MessagesByHashTagQueryResponse {
  messagesByHashTag: Message[];
}

export const getMessagesByHashTag = async (
  channel: string,
  previousId?: string,
  limit = ROWS_PER_PAGE
): Promise<PaginatedResponse<Message[]>> => {
  const { data } = await queryClient.post<{ data: MessagesByHashTagQueryResponse }>('', {
    variables: {
      tag: channel,
      previousId,
      limit,
    },
    query: GRAPHQL_QUERY_MESSAGES_BY_TAG,
  });

  if (data && data.data.messagesByHashTag.length) {
    return {
      data: data.data.messagesByHashTag,
      hasMore: data.data.messagesByHashTag.length >= limit,
    };
  }

  return {
    data: [],
    hasMore: false,
  };
};
