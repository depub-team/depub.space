import { HashTag, List } from '../../interfaces';
import { queryClient } from './queryClient';
import { GRAPHQL_QUERY_CHANNELS } from '../../constants';

export interface GetChannelsResponse {
  list: List[];
  hashTags: HashTag[];
}

export interface ChannelsQueryResponse {
  getChannels: GetChannelsResponse;
}

export const getChannels = async (countryCode?: string): Promise<GetChannelsResponse> => {
  const { data } = await queryClient.post<{ data: ChannelsQueryResponse }>('', {
    variables: {
      countryCode: countryCode || null, // graphql not accepts undefined
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
