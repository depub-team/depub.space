import { FC, useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions, CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { useAppState } from '../hooks';
import { MainStackParamList } from '../navigation/MainStackParamList';
import { RootStackParamList } from '../navigation/RootStackParamList';

export type HomeScreenProps = CompositeScreenProps<
  DrawerScreenProps<MainStackParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type HomeScreenNavigationProps = HomeScreenProps['navigation'];
export type HomeScreenRouteProps = HomeScreenProps['route'];

export const HomeScreen: FC<HomeScreenProps> = ({ navigation }) => {
  const { channels } = useAppState();

  useFocusEffect(
    useCallback(() => {
      if (!channels.length) {
        return;
      }

      const [firstListItem] = channels;

      navigation.dispatch(
        CommonActions.navigate({
          name: 'Channel',
          params: {
            name: firstListItem.hashTag,
          },
        })
      );

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channels])
  );

  return null;
};
