import React, { FC, useCallback, useState } from 'react';
import Debug from 'debug';
import { FlatList } from 'native-base';
import { ListRenderItemInfo, RefreshControl } from 'react-native';
import { IFlatListProps } from 'native-base/lib/typescript/components/basic/FlatList';
import { Message } from '../../../interfaces';
import { MessageCard } from '../MessageCard';
import { END_REACHED_THRESHOLD } from '../../../constants';
import { ListLoading, ListEmpty, ListItemSeparator } from '../../atoms';

const debug = Debug('web:<MessageList />');

export interface MessageListProps extends Omit<IFlatListProps<Message>, 'data' | 'renderItem'> {
  data: Message[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  onFetchData?: (previousId?: string) => Promise<void>;
}

export const MessageList: FC<MessageListProps> = ({
  onFetchData,
  isLoading,
  isLoadingMore,
  data,
  ...props
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const isLoadingShow = isLoadingMore || (isLoading && refreshing);

  const keyExtractor = useCallback(({ id }: Message) => id, []);

  const renderItem = useCallback(
    (info: ListRenderItemInfo<Message>) => <MessageCard message={info.item} />,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleOnEndReached = useCallback(
    async ({ distanceFromEnd }: { distanceFromEnd: number }) => {
      debug(
        'handleOnEndReached() -> distanceFromEnd: %d, data.length: %d',
        distanceFromEnd,
        data.length
      );
      if (distanceFromEnd < 0 || !data.length || isLoading || isLoadingMore) {
        return;
      }

      if (data.length > 0 && onFetchData) {
        await onFetchData(data[data.length - 1].id);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, isLoading, isLoadingMore]
  );

  const handleOnRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      if (onFetchData) {
        await onFetchData();
      }
    } catch (ex) {
      debug('handleOnRefresh() -> error: %O', ex);
    }

    setRefreshing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reference: https://gist.github.com/r0b0t3d/db629f5f4e249c7a5b6a3c211f2b8aa8
  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic" // refereance: https://reactnavigation.org/docs/native-stack-navigator/#headerlargetitle
      data={data}
      ItemSeparatorComponent={ListItemSeparator}
      keyExtractor={keyExtractor}
      ListEmptyComponent={!isLoadingShow ? <ListEmpty /> : null}
      ListFooterComponent={isLoadingShow ? <ListLoading /> : null}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleOnRefresh} />}
      renderItem={renderItem}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onEndReached={handleOnEndReached}
      onEndReachedThreshold={END_REACHED_THRESHOLD}
      {...props}
    />
  );
};
