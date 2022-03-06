import axios from 'axios';
import { Message } from '../interfaces';

import { GRAPHQL_QUERY_GET_MESSAGE } from '../constants';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || '';

export const getMessageById = async (iscnId: string) => {
  const { data } = await axios.post<{ data: { getMessage: Message } }>(
    GRAPHQL_URL,
    {
      variables: {
        iscnId,
      },
      query: GRAPHQL_QUERY_GET_MESSAGE,
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  );

  if (data && data.data.getMessage) {
    return data.data.getMessage;
  }

  return null;
};
