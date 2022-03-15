import React, { FC, memo, useCallback } from 'react';
import { Text, HStack, Badge, Pressable } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import type { HomeScreenNavigationProps } from '../../../navigation';

export interface TrendItemProps {
  name: string;
  count: number;
}

const areEqual = (prevProps: TrendItemProps, nextProps: TrendItemProps) => {
  const keys = ['name', 'count'] as Array<keyof TrendItemProps>;

  return keys.every(key => prevProps[key] === nextProps[key]);
};

export const TrendItem: FC<TrendItemProps> = memo(({ name, count }) => {
  const navgiation = useNavigation<HomeScreenNavigationProps>();

  const handleOnPress = useCallback(() => {
    navgiation.navigate('HashTag', { name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return (
    <Pressable onPress={handleOnPress}>
      <HStack
        flex={1}
        justifyContent="center"
        mb={4}
        pt={1}
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
}, areEqual);
