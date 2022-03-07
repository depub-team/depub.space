import React, { FC, useCallback, useState } from 'react';
import Debug from 'debug';
import { Link, Center, Text, HStack, Spinner, Divider, SectionList } from 'native-base';
import { ListRenderItemInfo, RefreshControl, SectionListData } from 'react-native';
import { ISectionListProps } from 'native-base/lib/typescript/components/basic/SectionList/types';
import { Message } from '../../../interfaces';
import { MessageCard } from '../MessageCard';
import { END_REACHED_THRESHOLD, ROWS_PER_PAGE } from '../../../constants';

const debug = Debug('web:<MessageSectionList />');

export interface MessageSectionListProps
  extends Omit<ISectionListProps<Message>, 'sections' | 'renderItem'> {
  data: SectionListData<Message>[];
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

export const MessageSectionList: FC<MessageSectionListProps> = ({
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

  const renderSectionHeader = useCallback(
    (info: { section: SectionListData<Message> }) => (
      <HStack
        alignItems="center"
        bg="primary.500"
        justifyContent="space-between"
        mb={4}
        px={4}
        py={2}
      >
        <Text color="white" fontSize="sm" fontWeight="bold">
          #{info.section.title}
        </Text>
        <Text color="darkBlue.900" fontSize="xs">
          <Link href={`/channels/${info.section.title}`}>
            <Text>more</Text>
          </Link>
        </Text>
      </HStack>
    ),
    []
  );

  const renderItem = useCallback(
    (info: ListRenderItemInfo<Message>) => (
      <MessageCard message={info.item} onImagePress={onImagePress} onPress={onPress} />
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
    <SectionList
      contentInsetAdjustmentBehavior="automatic" // refereance: https://reactnavigation.org/docs/native-stack-navigator/#headerlargetitle
      initialNumToRender={ROWS_PER_PAGE}
      ItemSeparatorComponent={ItemSeparatorComponent}
      keyExtractor={keyExtractor}
      ListEmptyComponent={renderListEmpty}
      ListFooterComponent={renderListFooter}
      maxToRenderPerBatch={6}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleOnRefresh} />}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      scrollEventThrottle={100}
      sections={data}
      windowSize={5}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onEndReached={handleOnEndReached}
      onEndReachedThreshold={END_REACHED_THRESHOLD}
      {...props}
    />
  );
};
