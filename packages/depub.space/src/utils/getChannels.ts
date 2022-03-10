import axios from 'axios';
import { HashTag, List } from '../interfaces';
import { ROWS_PER_PAGE, GRAPHQL_QUERY_CHANNELS } from '../constants';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || '';

export interface GetChannelsResponse {
  list: List[];
  hashTags: HashTag[];
}

export interface ChannelsQueryResponse {
  getChannels: GetChannelsResponse;
}

export const getChannels = async (
  previousId?: string,
  limit = ROWS_PER_PAGE
): Promise<GetChannelsResponse> => {
  const { data } = await axios.post<{ data: ChannelsQueryResponse }>(
    GRAPHQL_URL,
    {
      variables: {
        previousId: previousId || null, // graphql not accepts undefined
        limit,
      },
      query: GRAPHQL_QUERY_CHANNELS,
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  );

  if (data && data.data.getChannels) {
    return data.data.getChannels;
  }

  return {
    list: [],
    hashTags: [],
  };
};
