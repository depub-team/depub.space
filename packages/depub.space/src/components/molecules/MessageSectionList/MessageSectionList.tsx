import React, { FC, useCallback, useState } from 'react';
import Debug from 'debug';
import { Link, Text, HStack, SectionList, Box } from 'native-base';
import { ListRenderItemInfo, RefreshControl, SectionListData } from 'react-native';
import { ISectionListProps } from 'native-base/lib/typescript/components/basic/SectionList/types';
import { Message } from '../../../interfaces';
import { MessageCard } from '../MessageCard';
import { END_REACHED_THRESHOLD } from '../../../constants';
import { ListEmpty, ListLoading, ListItemSeparator } from '../../atoms';

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

export const MessageSectionList: FC<MessageSectionListProps> = ({
  onFetchData,
  isLoading,
  isLoadingMore,
  data,
  ...props
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const isLoadingShow = isLoadingMore || (isLoading && refreshing);

  const keyExtractor = useCallback(({ id }: Message) => id, []);

  const renderSectionHeader = useCallback(
    (info: { section: SectionListData<Message> }) => (
      <HStack alignItems="center" bg="primary.600" justifyContent="space-between" px={4} py={2}>
        <Text color="white" fontSize="sm" fontWeight="bold">
          #{info.section.title}
        </Text>
        <Link href={`/channels/${info.section.title}`}>
          <Text color="white" fontSize="xs">
            <Text>+ more</Text>
          </Text>
        </Link>
      </HStack>
    ),
    []
  );

  const renderSectionSeparator = useCallback(
    () => (
      <Box
        _dark={{
          borderTopColor: 'gray.800',
        }}
        _light={{
          borderTopColor: 'gray.200',
        }}
        borderTopWidth={1}
        h={4}
        w="100%"
      />
    ),
    []
  );

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
    <SectionList
      contentInsetAdjustmentBehavior="automatic" // refereance: https://reactnavigation.org/docs/native-stack-navigator/#headerlargetitle
      ItemSeparatorComponent={ListItemSeparator}
      keyExtractor={keyExtractor}
      ListEmptyComponent={!isLoadingShow ? <ListEmpty /> : null}
      ListFooterComponent={isLoadingShow ? <ListLoading /> : null}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleOnRefresh} />}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      sections={data}
      SectionSeparatorComponent={renderSectionSeparator}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onEndReached={handleOnEndReached}
      onEndReachedThreshold={END_REACHED_THRESHOLD}
      {...props}
    />
  );
};
