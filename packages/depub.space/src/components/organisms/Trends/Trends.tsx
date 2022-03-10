import React, { FC } from 'react';
import { Text, FlatList, Heading, Hidden, HStack, Box, Badge, Pressable } from 'native-base';
import { IVStackProps } from 'native-base/lib/typescript/components/primitives/Stack/VStack';
import { ListRenderItemInfo, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppState } from '../../../hooks';
import { HashTag } from '../../../interfaces';
import { ListLoading } from '../../atoms';
import type { HomeScreenNavigationProps } from '../../../screens';

const MIN_W = 220;
const MAX_W = 320;
const stickyHeaderIndices = [0];

const ChannelItem: FC<{ name: string; count: number }> = ({ name, count }) => {
  const navgiation = useNavigation<HomeScreenNavigationProps>();

  return (
    <Pressable
      onPress={() => {
        navgiation.navigate('Channel', { name });
      }}
    >
      <HStack flex={1} justifyContent="center" mb={4} px={8} space={4}>
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

const keyExtractor = (item: HashTag) => item.name;

const renderItem = ({ item: { name, count } }: ListRenderItemInfo<HashTag>) => (
  <ChannelItem count={count} name={name} />
);

export const Trends: FC<IVStackProps> = ({ ...props }) => {
  const { hashTags, isLoading } = useAppState();
  const dimension = useWindowDimensions();
  const isLoadingShow = !hashTags.length && isLoading;

  return (
    <Hidden till="lg">
      <Box
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
        {...props}
      >
        <FlatList<HashTag>
          data={hashTags}
          h={dimension.height}
          keyExtractor={keyExtractor}
          ListFooterComponent={isLoadingShow ? <ListLoading /> : null}
          ListHeaderComponent={
            <Heading
              _dark={{
                bg: 'darkBlue.900',
              }}
              _light={{
                bg: 'white',
              }}
              p={8}
              size="md"
            >
              Trending
            </Heading>
          }
          renderItem={renderItem}
          stickyHeaderIndices={stickyHeaderIndices}
        />
      </Box>
    </Hidden>
  );
};
