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
import { HomeScreen, HashTagScreen, UserScreen, WorldFeedScreen } from '../screens';
import { Trends } from '../components/organisms/Trends';
import { SideMenu } from '../components/organisms/SideMenu/SideMenu';
import type { RouteParams, SideMenuItemProps } from '../components/organisms/SideMenu/SideMenuItem';

const MainStack = createDrawerNavigator<MainStackParamList>();

export type MainNavigatorProps = DrawerScreenProps<MainStackParamList>;

const worldFeedOptions = {
  title: 'World Feed',
};

const emptySideMenuItems: SideMenuItemProps[] = [];

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
  const [activeRoute, setActiveRoute] = useState<RouteParams<any, any> | null>(null);
  const { showWalletModal, disconnect, walletAddress, isLoading: isConnectLoading } = useWallet();
  const { hashTags, profile, list } = useAppState();
  const [menuItems, setMenuItems] = useState<SideMenuItemProps[]>(emptySideMenuItems);
  const fontFamily = useToken('fonts', 'heading');
  const headerTitleLeftMargin = useBreakpointValue({
    base: 0,
    md: 16,
    lg: 24,
  });
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

  const renderDrawerContent = useCallback(
    (props: DrawerContentComponentProps) => (
      <SideMenu
        isLoading={isConnectLoading}
        menuItems={menuItems}
        profile={profile}
        walletAddress={walletAddress}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onLogout={disconnect}
        // eslint-disable-next-line react/jsx-sort-props
        onConnectWallet={showWalletModal}
        {...props}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isConnectLoading, menuItems, profile, showWalletModal, walletAddress]
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

  const stackScreenOptions = useMemo<DrawerNavigationOptions>(
    () => ({
      headerLeft: renderDrawerMenuButton,
      headerTitleContainerStyle: {
        marginLeft: headerTitleLeftMargin,
        flex: 1,
      },
      headerTitleStyle: {
        minWidth: 0,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      },
    }),
    [headerTitleLeftMargin, renderDrawerMenuButton]
  );

  useEffect(() => {
    const hashTagMap = list.reduce(
      (obj, { name, hashTag }) => ({
        ...obj,
        [name]: (obj[name] || []).concat(hashTag),
      }),
      {} as Record<string, string[]>
    );

    // compose the side menu items
    setMenuItems(items =>
      update(items, {
        $set: [
          {
            ...defaultMenuItem,
            isActive: activeRoute?.screen === 'WorldFeed',
          },
          ...Object.keys(hashTagMap).map<SideMenuItemProps>(key => ({
            name: key,
            items: hashTagMap[key].map(hashTag => {
              const isScreenMatches = activeRoute?.screen === 'HashTag';
              const isParamMatches = activeRoute?.params?.name === hashTag;
              const isActive = isScreenMatches && isParamMatches;

              return {
                name: hashTag,
                icon: <Feather />,
                iconName: 'hash',
                isActive,
                routeParams: {
                  screen: 'HashTag',
                  params: {
                    name: hashTag,
                  },
                },
              };
            }),
          })),
        ],
      })
    );
  }, [list, activeRoute]);

  // update active menu item
  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      const focusedRoute = findFocusedRoute(navigation.getState());

      if (!focusedRoute) {
        return;
      }

      setActiveRoute({
        screen: focusedRoute.name,
        params: focusedRoute.params,
      });
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

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
            <MainStack.Screen component={HashTagScreen} name="HashTag" />
          </MainStack.Group>
        </MainStack.Navigator>
      </Box>
      <Trends flex={1} hashTags={hashTags} />
    </HStack>
  );
};

// (MainNavigator as any).whyDidYouRender = true;
