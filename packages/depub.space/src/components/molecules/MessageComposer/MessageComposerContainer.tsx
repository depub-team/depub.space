import React, { FC } from 'react';
import { VStack } from 'native-base';
import { IVStackProps } from 'native-base/lib/typescript/components/primitives/Stack/VStack';

export const MessageComposerContainer: FC<IVStackProps & { isCollapsed: boolean }> = ({
  isCollapsed,
  children,
  ...props
}) => (
  <VStack
    borderRadius="lg"
    px={{
      base: 4,
      lg: 6,
    }}
    py={4}
    space={isCollapsed ? 0 : 4}
    {...props}
  >
    {children}
  </VStack>
);
