import React, { FC } from 'react';
import { VStack } from 'native-base';
import { IVStackProps } from 'native-base/lib/typescript/components/primitives/Stack/VStack';

const style = {
  borderRadius: 'lg',
  px: {
    base: 4,
    lg: 6,
  },
  py: 4,
};

export const MessageComposerContainer: FC<IVStackProps & { isCollapsed: boolean }> = ({
  isCollapsed,
  children,
  ...props
}) => (
  <VStack space={isCollapsed ? 0 : 4} {...style} {...props}>
    {children}
  </VStack>
);
