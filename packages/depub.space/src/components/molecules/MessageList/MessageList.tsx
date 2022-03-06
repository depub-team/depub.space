import React, { FC, useCallback, useState } from 'react';
import Debug from 'debug';
import { Center, Text, FlatList, HStack, Spinner, Divider } from 'native-base';
import { ListRenderItemInfo, RefreshControl } from 'react-native';
import { IFlatListProps } from 'native-base/lib/typescript/components/basic/FlatList';
import { Message } from '../../../interfaces';
import { MessageCard } from '../MessageCard';
import { END_REACHED_THRESHOLD, ROWS_PER_PAGE } from '../../../constants';

const debug = Debug('web:<MessageList />');

export interface MessageListProps extends Omit<IFlatListProps<Message>, 'data' | 'renderItem'> {
  data: Message[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  onPress?: (message: Message) => void;
  onImagePress?: (image: string, aspectRatio?: number) => void;
  onFetchData?: (previousId?: string) => Promise<void>;
}

const ListEmptyComponent: FC = () => (
  <Center my={8}>
    <Text color="gray.400">No Message</Text>
  </Center>
);

const ListFooterComponent: FC<{ isLoading?: boolean }> = ({ isLoading }) =>
  isLoading ? (
    <HStack
      _dark={{
        borderTopColor: 'gray.800',
      }}
      _light={{
        borderTopColor: 'gray.200',
      }}
      bg="rgba(0,0,0,0.025)"
      justifyContent="center"
      my={24}
      space={8}
    >
      <Spinner accessibilityLabel="Loading messages" size="lg" />
    </HStack>
  ) : null;

export const MessageList: FC<MessageListProps> = ({
  onFetchData,
  isLoading,
  isLoadingMore,
  data,
  onPress,
  onImagePress,
  ...props
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const isLoadingShow = isLoadingMore || (isLoading && refreshing);

  const keyExtractor = useCallback(({ id }: Message) => id, []);

  const renderItem = useCallback(
    (info: ListRenderItemInfo<Message>) => (
      <MessageCard
        isLoading={/^dummy-/.test(info.item.id)}
        message={info.item}
        onImagePress={onImagePress}
        onPress={onPress}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const renderListFooter = useCallback(
    () => <ListFooterComponent isLoading={isLoadingShow} />,
    [isLoadingShow]
  );

  const renderListEmpty = useCallback(
    () => (isLoadingShow ? null : <ListEmptyComponent />),
    [isLoadingShow]
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

  const ItemSeparatorComponent = useCallback(() => <Divider my={4} w="100%" />, []);

  // reference: https://gist.github.com/r0b0t3d/db629f5f4e249c7a5b6a3c211f2b8aa8
  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic" // refereance: https://reactnavigation.org/docs/native-stack-navigator/#headerlargetitle
      data={data}
      initialNumToRender={ROWS_PER_PAGE}
      ItemSeparatorComponent={ItemSeparatorComponent}
      keyExtractor={keyExtractor}
      ListEmptyComponent={renderListEmpty}
      ListFooterComponent={renderListFooter}
      maxToRenderPerBatch={6}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleOnRefresh} />}
      renderItem={renderItem}
      scrollEventThrottle={100}
      windowSize={5}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onEndReached={handleOnEndReached}
      onEndReachedThreshold={END_REACHED_THRESHOLD}
      {...props}
    />
  );
};
