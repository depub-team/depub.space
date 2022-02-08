import React, { FC } from 'react';
import Debug from 'debug';
import { FlatList } from 'native-base';
import { RefreshControl } from 'react-native';
import { IFlatListProps } from 'native-base/lib/typescript/components/basic/FlatList';
import { Message } from '../../../interfaces';
import { MessageCard } from '../MessageCard';
import { MAX_WIDTH, ROWS_PER_PAGE, END_REACHED_THRESHOLD } from '../../../contants';

const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
const debug = Debug('web:<MessageList />');

export interface MessageListProps extends Omit<IFlatListProps<Message>, 'data' | 'renderItem'> {
  messages: Message[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  onFetchMessages?: (previousId?: string) => Promise<void>;
}

export const MessageList: FC<MessageListProps> = ({
  onFetchMessages,
  isLoading,
  isLoadingMore,
  messages,
  ...props
}) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const dummyItems = Array.from(new Array(ROWS_PER_PAGE)).map<Message>(() => ({
    id: `dummy-${uid()}`,
    message: '',
    from: '',
    date: new Date(),
  }));
  const showDummyItems = isLoading && refreshing;

  const data = showDummyItems ? dummyItems : [...messages, ...(isLoadingMore ? dummyItems : [])];
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

  return (
    <FlatList<Message>
      data={data}
      keyExtractor={item => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleOnRefresh} />}
      renderItem={ctx => (
        <MessageCard
          isLoading={/^dummy-/.test(ctx.item.id)}
          maxW={MAX_WIDTH}
          message={ctx.item}
          mx="auto"
        />
      )}
      onEndReached={handleOnEndReached}
      onEndReachedThreshold={END_REACHED_THRESHOLD}
      {...props}
    />
  );
};
