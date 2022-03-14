import { DrawerScreenProps } from '@react-navigation/drawer';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './RootStackParamList';

export type MainStackParamList = {
  Home: undefined;
  WorldFeed: undefined;
  User: {
    account: string;
  };
  Channel: {
    name: string;
  };
};

export type HomeScreenProps = CompositeScreenProps<
  DrawerScreenProps<MainStackParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type HomeScreenNavigationProps = HomeScreenProps['navigation'];
export type HomeScreenRouteProps = HomeScreenProps['route'];
