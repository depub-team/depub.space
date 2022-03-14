import React, { FC } from 'react';
import { HStack } from 'native-base';
import { IHStackProps } from 'native-base/lib/typescript/components/primitives/Stack/HStack';

export const MessageCardContainer: FC<IHStackProps> = ({ children, ...props }) => (
  <HStack
    flex={1}
    minHeight="80px"
    p={{ base: 3, md: 4, lg: 6 }}
    space={{ base: 2, md: 4 }}
    w="100%"
    {...props}
  >
    {children}
  </HStack>
);
