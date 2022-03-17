import { HashTag, List } from '../../interfaces';
import { queryClient } from './queryClient';
import { ROWS_PER_PAGE, GRAPHQL_QUERY_CHANNELS } from '../../constants';

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
  const { data } = await queryClient.post<{ data: ChannelsQueryResponse }>('', {
    variables: {
      previousId: previousId || null, // graphql not accepts undefined
      limit,
    },
    query: GRAPHQL_QUERY_CHANNELS,
  });

  if (data && data.data.getChannels) {
    return data.data.getChannels;
  }

  return {
    list: [],
    hashTags: [],
  };
};
