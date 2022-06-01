import { DrawerScreenProps } from '@react-navigation/drawer';
import { CompositeScreenProps, findFocusedRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Debug from 'debug';
import { FC, useCallback } from 'react';
import { useAppState } from '../hooks';
import type { MainStackParamList, RootStackParamList } from '../navigation';
import { waitAsync } from '../utils';

const debug = Debug('web:<HomeScreen />');

export type HomeScreenProps = CompositeScreenProps<
  DrawerScreenProps<MainStackParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen: FC<HomeScreenProps> = ({ navigation }) => {
  const { list } = useAppState();

  useFocusEffect(
    useCallback(() => {
      const [firstItem] = list;
      const focusedRoute = findFocusedRoute(navigation.getState());

      debug('useFocusEffect() -> firstItem: %O', firstItem);

      if (!firstItem || focusedRoute?.name === 'WorldFeed') {
        return;
      }

      void (async () => {
        await waitAsync(1);

        navigation.navigate('WorldFeed');
      })();
    }, [list, navigation])
  );

  return null;
};
