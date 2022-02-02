import { Ionicons } from '@expo/vector-icons';
import { Icon, IconButton } from 'native-base';
import React, { ComponentProps, FC } from 'react';

export type ModalCloseButtonProps = ComponentProps<typeof IconButton>;

export const ModalCloseButton: FC<ModalCloseButtonProps> = props => (
  <IconButton
    _hover={{
      bg: 'gray.900:alpha.100',
    }}
    bg="gray.900:alpha.50"
    borderRadius="full"
    icon={<Icon as={Ionicons} borderRadius="full" color="white" name="close" size="sm" />}
    p={1}
    position="absolute"
    right={1}
    top={1}
    variant="unstyled"
    zIndex={1}
    {...props}
  />
);
