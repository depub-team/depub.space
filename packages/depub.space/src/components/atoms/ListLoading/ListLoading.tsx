import { HStack, Spinner } from 'native-base';
import type { IHStackProps } from 'native-base/lib/typescript/components/primitives/Stack/HStack';
import React, { FC } from 'react';

export type ListLoadingProps = IHStackProps;

const style = {
  _dark: {
    borderTopColor: 'gray.800',
  },
  _light: {
    borderTopColor: 'gray.200',
  },
  justifyContent: 'center',
  py: 24,
  space: 8,
};

export const ListLoading: FC<ListLoadingProps> = () => (
  <HStack {...style}>
    <Spinner accessibilityLabel="Loading messages" size="lg" />
  </HStack>
);
