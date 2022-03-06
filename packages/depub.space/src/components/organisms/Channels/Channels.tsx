import React, { FC, useCallback } from 'react';
import { Text, FlatList, Heading, Hidden, HStack, VStack, Badge, Link } from 'native-base';
import { IVStackProps } from 'native-base/lib/typescript/components/primitives/Stack/VStack';
import { ListRenderItemInfo } from 'react-native';
import { useAppState } from '../../../hooks';
import { Channel } from '../../../interfaces';

const MIN_W = 220;
const MAX_W = 360;

const ChannelItem: FC<{ name: string; count: number }> = ({ name, count }) => (
  <Link href={`/channels/${name}`}>
    <HStack flex={1} justifyContent="center" mb={4} space={4}>
      <Text flex={1} minW={0} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
        #{name}
      </Text>
      <Badge alignSelf="flex-end" rounded="full" variant="outline">
        {count}
      </Badge>
    </HStack>
  </Link>
);

export const Channels: FC<IVStackProps> = ({ ...props }) => {
  const { channels } = useAppState();
  const keyExtractor = useCallback((item: Channel) => item.name, []);

  const renderItem = useCallback(
    ({ item: { name, count } }: ListRenderItemInfo<Channel>) => (
      <ChannelItem count={count} name={name} />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Hidden till="lg">
      <VStack
        _dark={{
          borderLeftColor: '#272729',
        }}
        _light={{
          borderLeftColor: '#d8d8d8',
        }}
        borderLeftWidth={1}
        flex={1}
        maxW={MAX_W}
        minW={MIN_W}
        p={8}
        space={8}
        {...props}
      >
        <Heading size="md">Trends for you</Heading>
        <FlatList<Channel>
          data={channels.slice(0, 10)}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
        />
      </VStack>
    </Hidden>
  );
};
