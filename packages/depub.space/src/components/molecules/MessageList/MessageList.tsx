import React, { FC, memo, useCallback, useState } from 'react';
import Debug from 'debug';
import { Center, Text, FlatList, HStack, Spinner, Divider } from 'native-base';
import { ListRenderItemInfo, RefreshControl } from 'react-native';
import { IFlatListProps } from 'native-base/lib/typescript/components/basic/FlatList';
import { Message } from '../../../interfaces';
import { MessageCard } from '../MessageCard';
import { MAX_WIDTH, END_REACHED_THRESHOLD, ROWS_PER_PAGE } from '../../../constants';

const debug = Debug('web:<MessageList />');

export interface MessageListProps extends Omit<IFlatListProps<Message>, 'data' | 'renderItem'> {
  messages: Message[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  onShare?: (message: Message) => void;
  onAvatarPress?: (handle: string) => void;
  onImagePress?: (image: string, aspectRatio?: number) => void;
  onFetchMessages?: (previousId?: string) => Promise<void>;
}

const ListEmptyComponent: FC = () => (
  <Center my={4}>
    <Text color="gray.400">No Message</Text>
  </Center>
);

const ListFooterComponent: FC<{ isLoading?: boolean }> = ({ isLoading }) =>
  isLoading ? (
    <HStack justifyContent="center" my={24} space={8}>
      <Spinner accessibilityLabel="Loading messages" size="lg" />
    </HStack>
  ) : null;

export const MessageList: FC<MessageListProps> = memo(
  ({
    onFetchMessages,
    onAvatarPress,
    isLoading,
    isLoadingMore,
    messages,
    onShare,
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
          maxW={MAX_WIDTH}
          message={info.item}
          mx="auto"
          onAvatarPress={onAvatarPress}
          onImagePress={onImagePress}
          onShare={onShare}
        />
      ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    const renderListFooter = () => <ListFooterComponent isLoading={isLoadingShow} />;

    const renderListEmpty = () => (isLoading ? null : <ListEmptyComponent />);

    const handleOnEndReached = async ({ distanceFromEnd }: { distanceFromEnd: number }) => {
      debug(
        'handleOnEndReached() -> distanceFromEnd: %d, messages.length: %d',
        distanceFromEnd,
        messages.length
      );
      if (distanceFromEnd < 0 || !messages.length) {
        return;
      }

      if (messages.length > 0 && onFetchMessages) {
        await onFetchMessages(messages[messages.length - 1].id);
      }
    };

    const handleOnRefresh = async () => {
      setRefreshing(true);

      try {
        if (onFetchMessages) {
          await onFetchMessages();
        }
      } catch (ex) {
        debug('handleOnRefresh() -> error: %O', ex);
      }

      setRefreshing(false);
    };

    const ItemSeparatorComponent = memo(() => (
      <Divider maxW={MAX_WIDTH} mx="auto" my={4} w="100%" />
    ));

    // reference: https://gist.github.com/r0b0t3d/db629f5f4e249c7a5b6a3c211f2b8aa8

    return (
      <FlatList
        contentInsetAdjustmentBehavior="automatic" // refereance: https://reactnavigation.org/docs/native-stack-navigator/#headerlargetitle
        data={messages}
        initialNumToRender={ROWS_PER_PAGE}
        ItemSeparatorComponent={ItemSeparatorComponent}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={renderListFooter}
        maxToRenderPerBatch={6}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void handleOnRefresh();
            }}
          />
        }
        renderItem={renderItem}
        scrollEventThrottle={100}
        windowSize={5}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onEndReached={handleOnEndReached}
        onEndReachedThreshold={END_REACHED_THRESHOLD}
        {...props}
      />
    );
  }
);
