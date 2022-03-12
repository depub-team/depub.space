import { DrawerScreenProps } from '@react-navigation/drawer';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
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
  const { channels } = useAppState();

  useFocusEffect(
    useCallback(() => {
      const [firstItem] = channels;

      debug('useFocusEffect() -> firstItem: %O', firstItem);

      if (!firstItem) {
        return;
      }

      void (async () => {
        await waitAsync(10);

        navigation.navigate('Channel', {
          name: firstItem.hashTag,
        });
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channels])
  );

  return null;
};
