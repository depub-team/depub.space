import React, { FC, useMemo } from 'react';
import { FlatList, Heading, Hidden, Box } from 'native-base';
import { IVStackProps } from 'native-base/lib/typescript/components/primitives/Stack/VStack';
import { ListRenderItemInfo, useWindowDimensions } from 'react-native';
import type { HashTag } from '../../../interfaces';
import { ListHeaderContainer, ListLoading } from '../../atoms';
import { TrendItem } from './TrendItem';

const MIN_W = 220;
const MAX_W = 320;
const stickyHeaderIndices = [0];

const keyExtractor = (item: HashTag) => item.name;

const renderItem = ({ item: { name, count } }: ListRenderItemInfo<HashTag>) => (
  <TrendItem count={count} name={name} />
);

export interface TrendProps extends IVStackProps {
  hashTags: HashTag[];
}

export const Trends: FC<TrendProps> = ({ hashTags, ...props }) => {
  const dimension = useWindowDimensions();
  const isLoadingShow = !hashTags.length;
  const data = useMemo(() => hashTags.slice(0, 18), [hashTags]);

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
          data={data}
          h={dimension.height}
          keyExtractor={keyExtractor}
          ListFooterComponent={isLoadingShow ? <ListLoading /> : null}
          ListHeaderComponent={
            <ListHeaderContainer>
              <Heading
                p={{
                  base: 3,
                  md: 4,
                  lg: 6,
                }}
                size="md"
              >
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
