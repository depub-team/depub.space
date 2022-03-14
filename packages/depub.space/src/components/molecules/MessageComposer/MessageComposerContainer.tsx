import React, { forwardRef } from 'react';
import { VStack } from 'native-base';
import { IVStackProps } from 'native-base/lib/typescript/components/primitives/Stack/VStack';

export interface MessageComposerContainerProps extends IVStackProps {
  isCollapsed: boolean;
}

export const MessageComposerContainer = forwardRef<HTMLDivElement, MessageComposerContainerProps>(
  ({ isCollapsed, children, ...props }, ref) => (
    <VStack
      ref={ref}
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
  )
);
