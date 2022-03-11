import React, { FC, useEffect, useRef, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainNavigator } from './MainNavigator';
import { NotFoundScreen } from '../screens/NotFoundScreen';
import { RootStackParamList } from './RootStackParamList';
import { ConnectWalletScreen, ImageScreen, PostScreen, LoadingScreen } from '../screens';
import { useAppState } from '../hooks';

const RootStack = createStackNavigator<RootStackParamList>();

export const RootNavigator: FC = () => {
  const timeRef = useRef(new Date().getTime());
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setisInitialized] = useState(false);
  const { fetchChannels } = useAppState();

  useEffect(() => {
    if (!isInitialized) {
      return () => {}; // do nothing
    }

    const now = new Date().getTime();
    const expectedTime = timeRef.current + 3 * 1000;

    // more than 3sec
    if (now >= expectedTime) {
      setIsLoading(false);

      return () => {};
    }

    // less than 3sec then wait for a certain while
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, expectedTime - now);

    return () => {
      clearTimeout(timeout);
    };
  }, [isInitialized]);

  // get channels
  useEffect(() => {
    void (async () => {
      await fetchChannels();

      setisInitialized(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLoading ? (
    <LoadingScreen />
  ) : (
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
  );
};

(RootNavigator as any).whyDidYouRender = true;
