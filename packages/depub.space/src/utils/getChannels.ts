import axios from 'axios';
import { Channel } from '../interfaces';
import { ROWS_PER_PAGE, GRAPHQL_QUERY_CHANNELS } from '../constants';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || '';

export interface ChannelsQueryResponse {
  getHashTags: Channel[];
}

export const getChannels = async (previousId?: string) => {
  const { data } = await axios.post<{ data: ChannelsQueryResponse }>(
    GRAPHQL_URL,
    {
      variables: {
        previousId: previousId || null, // graphql not accepts undefined
        limit: ROWS_PER_PAGE,
      },
      query: GRAPHQL_QUERY_CHANNELS,
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  );

  if (data && data.data.getHashTags) {
    return data.data.getHashTags;
  }

  return [];
};
