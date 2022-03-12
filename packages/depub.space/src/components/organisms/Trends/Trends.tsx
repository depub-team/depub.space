import React, { FC } from 'react';
import { Text, FlatList, Heading, Hidden, HStack, Box, Badge, Pressable } from 'native-base';
import { IVStackProps } from 'native-base/lib/typescript/components/primitives/Stack/VStack';
import { ListRenderItemInfo, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppState } from '../../../hooks';
import { HashTag } from '../../../interfaces';
import { ListHeaderContainer, ListLoading } from '../../atoms';
import type { HomeScreenNavigationProps } from '../../../navigation';

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
      <HStack
        flex={1}
        justifyContent="center"
        mb={4}
        px={{
          base: 3,
          md: 4,
          lg: 6,
        }}
        space={4}
      >
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
          data={hashTags.slice(0, 18)}
          h={dimension.height}
          keyExtractor={keyExtractor}
          ListFooterComponent={isLoadingShow ? <ListLoading /> : null}
          ListHeaderComponent={
            <ListHeaderContainer>
              <Heading p={{ base: 3, md: 4, lg: 6 }} size="md">
                Trending
              </Heading>
            </ListHeaderContainer>
          }
          renderItem={renderItem}
          stickyHeaderIndices={stickyHeaderIndices}
        />
      </Box>
    </Hidden>
  );
};
