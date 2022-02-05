import React, { FC, useEffect, useState } from 'react';
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
  onFetchMessages?: () => Promise<void>;
}

export const MessageList: FC<MessageListProps> = ({
  onFetchMessages,
  isLoading,
  messages,
  ...props
}) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [offset, setOffset] = useState(ROWS_PER_PAGE);
  const [messagesWithPaging, setMessagesWithPaging] = useState(messages.slice(0, ROWS_PER_PAGE));
  const dummyItems = Array.from(new Array(ROWS_PER_PAGE)).map<Message>(() => ({
    id: `id-${uid()}`,
    message: '',
    from: '',
    date: new Date(),
  }));

  const handleOnEndReached = ({ distanceFromEnd }: { distanceFromEnd: number }) => {
    debug(
      'handleOnEndReached() -> distanceFromEnd: %d, offset: %d, ROWS_PER_PAGE: %d, messages.length: %d',
      distanceFromEnd,
      offset,
      ROWS_PER_PAGE,
      messages.length
    );

    if (distanceFromEnd < 0 || !messages.length) {
      return;
    }

    const newOffset = Math.min(offset + ROWS_PER_PAGE, messages.length);
    const paginatedMessages = messages.slice(0, newOffset);

    setMessagesWithPaging(paginatedMessages);
    setOffset(newOffset);
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

  // get first batch of messages
  useEffect(() => {
    setMessagesWithPaging(messages.slice(0, ROWS_PER_PAGE));
  }, [messages]);

  return (
    <FlatList<Message>
      data={refreshing || isLoading ? dummyItems : messagesWithPaging}
      keyExtractor={item => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleOnRefresh} />}
      renderItem={ctx => (
        <MessageCard isLoading={isLoading} maxW={MAX_WIDTH} message={ctx.item} mx="auto" />
      )}
      onEndReached={handleOnEndReached}
      onEndReachedThreshold={END_REACHED_THRESHOLD}
      {...props}
    />
  );
};
