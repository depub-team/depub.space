import { ChannelList } from './channel-list.interface';
import { ISCNTrend } from './iscn-trend.interface';

export interface GetChannelsResponse {
  hashTags: ISCNTrend[];
  list: ChannelList[];
}
