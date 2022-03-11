import React, { FC, useState } from 'react';
import { Text, Box, HStack, Icon, Pressable, Collapse, VStack } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import type {
  HomeScreenNavigationProps,
  MainStackParamList,
  RootStackParamList,
} from '../../../navigation';

export type RouteParams<
  ParamList extends MainStackParamList | RootStackParamList,
  Screen extends keyof ParamList
> = {
  screen: Screen;
  params?: ParamList[Screen];
};

export interface SideMenuItemProps {
  icon?: JSX.Element;
  iconName?: string;
  collapsedIconName?: string;
  name?: string;
  routeParams?: RouteParams<any, any>;
  defaultCollapsed?: boolean;
  active?: boolean;
  items?: SideMenuItemProps[];
  onPress?: () => void;
}

export const SideMenuItem: FC<SideMenuItemProps> = ({
  items,
  routeParams,
  defaultCollapsed = false,
  icon,
  iconName,
  collapsedIconName,
  name,
  children,
  active,
  onPress,
}) => {
  const navigation = useNavigation<HomeScreenNavigationProps>();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const defaultIconName = isCollapsed ? 'chevron-right' : 'chevron-down';
  const myIconName =
    (isCollapsed && collapsedIconName ? collapsedIconName : iconName) || defaultIconName;
  const myIcon = icon || <Feather />;

  const handleOnPress = () => {
    if (onPress) {
      onPress();
    } else if (routeParams) {
      navigation.navigate(routeParams.screen, routeParams.params);
    } else if (items) {
      setIsCollapsed(collapsed => !collapsed);
    }
  };

  return (
    <VStack>
      <Pressable
        _dark={{
          _hover: {
            bg: 'rgba(255,255,255,0.1)',
          },
          bg: active ? 'primary.200:alpha.10' : undefined,
        }}
        _light={{
          _hover: {
            bg: 'rgba(0,0,0,0.1)',
          },
          bg: active ? 'primary.600:alpha.10' : undefined,
        }}
        borderRadius="full"
        onPress={handleOnPress}
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
          {myIcon && myIconName ? (
            <Box w={8}>
              <Icon as={myIcon} name={myIconName} size="sm" />
            </Box>
          ) : undefined}

          {children}

          {name ? (
            <Text
              flex={1}
              fontWeight="bold"
              minW={0}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {name}
            </Text>
          ) : undefined}
        </HStack>
      </Pressable>
      {items ? (
        <Collapse isOpen={!isCollapsed}>
          <VStack ml={4} space={2}>
            {items.map(item => (
              <SideMenuItem key={item.name} {...item} />
            ))}
          </VStack>
        </Collapse>
      ) : null}
    </VStack>
  );
};
