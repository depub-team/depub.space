import { Ionicons } from '@expo/vector-icons';
import { IIconButtonProps, Icon, IconButton } from 'native-base';
import React, { forwardRef, memo } from 'react';

const hoverBg = {
  bg: 'gray.900:alpha.100',
};

const CloseButton = (props: IIconButtonProps, ref?: any) => (
  <IconButton
    ref={ref}
    _hover={hoverBg}
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

export default memo(forwardRef(CloseButton));
