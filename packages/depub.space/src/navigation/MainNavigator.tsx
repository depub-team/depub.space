import { Feather, Ionicons } from '@expo/vector-icons';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerScreenProps,
} from '@react-navigation/drawer';
import update from 'immutability-helper';
import { Box, HStack, Icon, IconButton, useBreakpointValue, useToken } from 'native-base';
import React, { FC, useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { DrawerActions, findFocusedRoute } from '@react-navigation/native';
import { useAppState, useWallet } from '../hooks';
import type { MainStackParamList } from './MainStackParamList';
import { ChannelScreen, HomeScreen, UserScreen, WorldFeedScreen } from '../screens';
import { Trends } from '../components/organisms/Trends';
import { SideMenu } from '../components/organisms/SideMenu/SideMenu';
import type { SideMenuItemProps } from '../components/organisms/SideMenu/SideMenuItem';

const MainStack = createDrawerNavigator<MainStackParamList>();

export type MainNavigatorProps = DrawerScreenProps<MainStackParamList>;

const defaultMenuItem: SideMenuItemProps = {
  icon: <Feather />,
  iconName: 'globe',
  name: 'World Feed',
  routeParams: {
    screen: 'WorldFeed',
  },
};

export const MainNavigator: FC<MainNavigatorProps> = ({ navigation }) => {
  const dimensions = useWindowDimensions();
  const isWideScreen = dimensions.width >= 768;
  const { disconnect, walletAddress, isLoading: isConnectLoading } = useWallet();
  const { profile, channels } = useAppState();
  const [menuItems, setMenuItems] = useState<SideMenuItemProps[]>([]);
  const fontFamily = useToken('fonts', 'heading');
  const headerTitleLeftMargin = useBreakpointValue({
    base: 0,
    md: 16,
  });
  const navigationState = navigation.getState();
  const focusedRoute = findFocusedRoute(navigationState);

  const handleOnLogout = () => {
    void disconnect();
  };

  const renderDrawerContent = (props: DrawerContentComponentProps) => (
    <SideMenu
      isLoading={isConnectLoading}
      menuItems={menuItems}
      profile={profile}
      walletAddress={walletAddress}
      onLogout={handleOnLogout}
      {...props}
    />
  );

  const renderDrawerMenuButton = () =>
    isWideScreen ? null : (
      <IconButton
        borderRadius="full"
        icon={<Icon as={Ionicons} name="menu" size="md" />}
        onPress={() => {
          navigation.dispatch(DrawerActions.toggleDrawer());
        }}
      />
    );

  useEffect(() => {
    const channelMap = channels.reduce(
      (obj, { name, hashTag }) => ({
        ...obj,
        [name]: (obj[name] || []).concat(hashTag),
      }),
      {} as Record<string, string[]>
    );

    // compose the side menu items
    setMenuItems(items =>
      update(items, {
        $set: Object.keys(channelMap)
          .map<SideMenuItemProps>(key => ({
            name: key,
            items: channelMap[key].map(hashTag => ({
              name: hashTag,
              icon: <Feather />,
              iconName: 'hash',
              mode: 'subitem',
              active:
                focusedRoute?.name === 'Channel' && (focusedRoute?.params as any)?.name === hashTag,
              routeParams: {
                screen: 'Channel',
                params: {
                  name: hashTag,
                },
              },
            })),
          }))
          .concat(defaultMenuItem),
      })
    );
  }, [channels, focusedRoute]);

  return (
    <HStack flex={1} safeArea>
      <Box flex={2}>
        <MainStack.Navigator
          drawerContent={renderDrawerContent}
          screenOptions={{
            drawerType: isWideScreen ? 'permanent' : 'slide',
            drawerStyle: {
              width: 320,
            },
            headerShown: true,
            headerTitleStyle: {
              fontFamily,
            },
          }}
        >
          <MainStack.Group
            screenOptions={{
              headerLeft: renderDrawerMenuButton,
              headerTitleContainerStyle: {
                marginLeft: headerTitleLeftMargin,
              },
            }}
          >
            <MainStack.Screen component={HomeScreen} name="Home" />
            <MainStack.Screen
              component={WorldFeedScreen}
              name="WorldFeed"
              options={{
                title: 'World Feed',
              }}
            />
          </MainStack.Group>

          <MainStack.Group
            screenOptions={{
              headerLeft: renderDrawerMenuButton,
              headerTitleContainerStyle: {
                marginLeft: headerTitleLeftMargin,
              },
            }}
          >
            <MainStack.Screen component={UserScreen} name="User" />
            <MainStack.Screen component={ChannelScreen} name="Channel" />
          </MainStack.Group>
        </MainStack.Navigator>
      </Box>
      <Trends flex={1} />
    </HStack>
  );
};
