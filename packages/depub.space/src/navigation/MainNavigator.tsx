import { Ionicons } from '@expo/vector-icons';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerScreenProps,
} from '@react-navigation/drawer';
import { Box, HStack, Icon, IconButton, useToken } from 'native-base';
import React, { FC } from 'react';
import { useWindowDimensions } from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { Channels, SideMenu } from '../components';
import { useAppState, useWallet } from '../hooks';
import { MainStackParamList } from './MainStackParamList';
import { ChannelScreen, HomeScreen, UserScreen, WorldFeedScreen } from '../screens';

const MainStack = createDrawerNavigator<MainStackParamList>();

type MainNavigatorProps = DrawerScreenProps<MainStackParamList>;

export const MainNavigator: FC<MainNavigatorProps> = ({ navigation }) => {
  const dimensions = useWindowDimensions();
  const isWideScreen = dimensions.width >= 768;
  const { disconnect, walletAddress, isLoading: isConnectLoading } = useWallet();
  const { profile } = useAppState();
  const fontFamily = useToken('fonts', 'body');

  const handleOnLogout = () => {
    void disconnect();
  };

  const renderDrawerContent = (props: DrawerContentComponentProps) => (
    <SideMenu
      isLoading={isConnectLoading}
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
        ml={{ base: 2, md: 4 }}
        onPress={() => {
          navigation.dispatch(DrawerActions.toggleDrawer());
        }}
      />
    );

  return (
    <HStack flex={1} safeArea>
      <Box flex={2}>
        <MainStack.Navigator
          drawerContent={renderDrawerContent}
          screenOptions={{
            drawerType: isWideScreen ? 'permanent' : 'slide',
            drawerStyle: {
              width: 280,
            },
            headerShown: true,
            headerTitleStyle: {
              fontFamily,
              fontWeight: 'bold',
            },
          }}
        >
          <MainStack.Group
            screenOptions={{
              headerLeft: renderDrawerMenuButton,
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
              headerLeft: () => null,
            }}
          >
            <MainStack.Screen component={UserScreen} name="User" />
            <MainStack.Screen component={ChannelScreen} name="Channel" />
          </MainStack.Group>
        </MainStack.Navigator>
      </Box>
      <Channels flex={1} />
    </HStack>
  );
};
