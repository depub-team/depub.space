import React, { FC, useEffect, useRef, useState } from 'react';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import Debug from 'debug';
import { MainNavigator } from './MainNavigator';
import { NotFoundScreen } from '../screens/NotFoundScreen';
import { RootStackParamList } from './RootStackParamList';
import { PostScreen, LoadingScreen } from '../screens';
import { useAppState } from '../hooks';
import { getChannels, getCountryCode } from '../utils';

const debug = Debug('web:<RootNavigator />');
const RootStack = createStackNavigator<RootStackParamList>();

const modalScreenOptions: StackNavigationOptions = {
  presentation: 'transparentModal',
  headerShown: false,
};

const navigatorScreenOptions: StackNavigationOptions = {
  headerShown: false,
  headerLeft: () => null,
};

export const RootNavigator: FC = () => {
  const timeRef = useRef(new Date().getTime());
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setisInitialized] = useState(false);
  const { setHashTags, setList } = useAppState();

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
      if (isInitialized) {
        return;
      }

      const countryCode = await getCountryCode();
      const channels = await getChannels(countryCode);

      debug('countryCode: %s', countryCode);

      if (channels) {
        const { hashTags, list } = channels;

        setHashTags(hashTags);
        setList(list);
      }

      setisInitialized(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <RootStack.Navigator screenOptions={navigatorScreenOptions}>
      <RootStack.Screen component={MainNavigator} name="Main" />
      <RootStack.Screen component={NotFoundScreen} name="NotFound" />

      <RootStack.Group screenOptions={modalScreenOptions}>
        <RootStack.Screen component={PostScreen} name="Post" />
      </RootStack.Group>
    </RootStack.Navigator>
  );
};

// (RootNavigator as any).whyDidYouRender = true;
