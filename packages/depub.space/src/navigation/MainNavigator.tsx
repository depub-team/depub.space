import { Feather, Ionicons } from '@expo/vector-icons';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerNavigationOptions,
  DrawerScreenProps,
} from '@react-navigation/drawer';
import update from 'immutability-helper';
import { Box, HStack, Icon, IconButton, useBreakpointValue, useToken } from 'native-base';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { DrawerActions, findFocusedRoute } from '@react-navigation/native';
import { useAppState, useWallet } from '../hooks';
import type { MainStackParamList } from './MainStackParamList';
import { HomeScreen, ChannelScreen, UserScreen, WorldFeedScreen } from '../screens';
import { Trends } from '../components/organisms/Trends';
import { SideMenu } from '../components/organisms/SideMenu/SideMenu';
import type { SideMenuItemProps } from '../components/organisms/SideMenu/SideMenuItem';

const MainStack = createDrawerNavigator<MainStackParamList>();

export type MainNavigatorProps = DrawerScreenProps<MainStackParamList>;

const worldFeedOptions = {
  title: 'World Feed',
};
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
  const [menuItems, setMenuItems] = useState<SideMenuItemProps[]>(() => []);
  const fontFamily = useToken('fonts', 'heading');
  const headerTitleLeftMargin = useBreakpointValue({
    base: 0,
    md: 16,
  });
  const navigationState = navigation.getState();
  const focusedRoute = findFocusedRoute(navigationState);
  const navigatorScreenOptions = useMemo<DrawerNavigationOptions>(
    () => ({
      drawerType: isWideScreen ? 'permanent' : 'slide',
      drawerStyle: {
        width: 320,
      },
      headerShown: true,
      headerTitleStyle: {
        fontFamily,
      },
    }),
    [fontFamily, isWideScreen]
  );

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

  const renderDrawerMenuButton = useCallback(
    () =>
      isWideScreen ? null : (
        <IconButton
          borderRadius="full"
          icon={<Icon as={Ionicons} name="menu" size="md" />}
          onPress={() => {
            navigation.dispatch(DrawerActions.toggleDrawer());
          }}
        />
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isWideScreen]
  );

  const stackScreenOptions = useMemo(
    () => ({
      headerLeft: renderDrawerMenuButton,
      headerTitleContainerStyle: {
        marginLeft: headerTitleLeftMargin,
      },
    }),
    [headerTitleLeftMargin, renderDrawerMenuButton]
  );

  useEffect(() => {
    const channelMap = channels.reduce(
      (obj, { name, hashTag }) => ({
        ...obj,
        [name]: (obj[name] || []).concat(hashTag),
      }),
      {} as Record<string, string[]>
    );
    const isHomeOrChannelScreen = focusedRoute?.name === 'Channel' || focusedRoute?.name === 'Home';
    const isParamMatchesHashTag = (hashTag: string) =>
      (focusedRoute?.params as any)?.name === hashTag;

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
              active: isHomeOrChannelScreen && isParamMatchesHashTag(hashTag),
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
    <HStack flex={1} overflow="hidden" safeArea>
      <Box flex={2}>
        <MainStack.Navigator
          drawerContent={renderDrawerContent}
          screenOptions={navigatorScreenOptions}
        >
          <MainStack.Group screenOptions={stackScreenOptions}>
            <MainStack.Screen component={HomeScreen} name="Home" />
            <MainStack.Screen
              component={WorldFeedScreen}
              name="WorldFeed"
              options={worldFeedOptions}
            />
          </MainStack.Group>

          <MainStack.Group screenOptions={stackScreenOptions}>
            <MainStack.Screen component={UserScreen} name="User" />
            <MainStack.Screen component={ChannelScreen} name="Channel" />
          </MainStack.Group>
        </MainStack.Navigator>
      </Box>
      <Trends flex={1} />
    </HStack>
  );
};
