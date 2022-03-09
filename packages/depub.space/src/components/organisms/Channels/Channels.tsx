import React, { FC } from 'react';
import { Text, FlatList, Heading, Hidden, HStack, VStack, Badge, Pressable } from 'native-base';
import { IVStackProps } from 'native-base/lib/typescript/components/primitives/Stack/VStack';
import { ListRenderItemInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppState } from '../../../hooks';
import { Channel } from '../../../interfaces';
import { ListLoading } from '../../atoms';
import type { HomeScreenNavigationProps } from '../../../screens';

const MIN_W = 220;
const MAX_W = 320;

const ChannelItem: FC<{ name: string; count: number }> = ({ name, count }) => {
  const navgiation = useNavigation<HomeScreenNavigationProps>();

  return (
    <Pressable
      onPress={() => {
        navgiation.navigate('Channel', { name });
      }}
    >
      <HStack flex={1} justifyContent="center" mb={4} space={4}>
        <Text flex={1} minW={0} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          #{name}
        </Text>
        <Badge alignSelf="flex-end" colorScheme="primary.500" rounded="full" variant="outline">
          {count}
        </Badge>
      </HStack>
    </Pressable>
  );
};

const keyExtractor = (item: Channel) => item.name;

const renderItem = ({ item: { name, count } }: ListRenderItemInfo<Channel>) => (
  <ChannelItem count={count} name={name} />
);

export const Channels: FC<IVStackProps> = ({ ...props }) => {
  const { channels, isLoading } = useAppState();
  const isLoadingShow = !channels.length && isLoading;

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
          data={channels}
          keyExtractor={keyExtractor}
          ListFooterComponent={isLoadingShow ? <ListLoading /> : null}
          renderItem={renderItem}
        />
      </VStack>
    </Hidden>
  );
};
