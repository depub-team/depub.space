import React, { FC, memo } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainNavigator } from './MainNavigator';
import { NotFoundScreen } from '../screens/NotFoundScreen';
import { RootStackParamList } from './RootStackParamList';
import { ConnectWalletScreen, ImageScreen, PostScreen } from '../screens';

const RootStack = createStackNavigator<RootStackParamList>();

export const RootNavigator: FC = memo(() => (
  <RootStack.Navigator
    screenOptions={{
      headerShown: false,
      headerLeft: () => null,
    }}
  >
    <RootStack.Screen component={MainNavigator} name="Main" />
    <RootStack.Screen component={NotFoundScreen} name="NotFound" />

    <RootStack.Group screenOptions={{ presentation: 'transparentModal', headerShown: false }}>
      <RootStack.Screen component={ConnectWalletScreen} name="ConnectWallet" />
      <RootStack.Screen component={ImageScreen} name="Image" />
      <RootStack.Screen component={PostScreen} name="Post" />
    </RootStack.Group>
  </RootStack.Navigator>
));
