import { queryClient } from './queryClient';
import { Message } from '../../interfaces';

import { GRAPHQL_QUERY_GET_MESSAGE } from '../../constants';

export const getMessageById = async (iscnId: string) => {
  const { data } = await queryClient.post<{ data: { getMessage: Message } }>('', {
    variables: {
      iscnId,
    },
    query: GRAPHQL_QUERY_GET_MESSAGE,
  });

  if (data && data.data.getMessage) {
    return data.data.getMessage;
  }

  return null;
};
