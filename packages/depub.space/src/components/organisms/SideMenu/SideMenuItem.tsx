import React, { FC } from 'react';
import { Text, Box, HStack, Icon, Pressable } from 'native-base';

export interface SideMenuItemProps {
  icon: JSX.Element;
  onPress?: () => void;
  iconName: string;
}

export const SideMenuItem: FC<SideMenuItemProps> = ({ icon, iconName, onPress, children }) => (
  <Pressable
    _dark={{
      _hover: {
        bg: 'rgba(255,255,255,0.1)',
      },
    }}
    _light={{
      _hover: {
        bg: 'rgba(0,0,0,0.1)',
      },
    }}
    borderRadius="full"
    onPress={onPress}
  >
    <HStack
      alignItems="center"
      px={{
        base: 3,
        md: 4,
      }}
      py={{
        base: 2,
        md: 3,
      }}
      space={4}
    >
      <Box w={8}>
        <Icon as={icon} name={iconName} />
      </Box>
      {typeof children === 'string' ? <Text fontWeight="bold">{children}</Text> : children}
    </HStack>
  </Pressable>
);
