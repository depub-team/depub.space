import * as Linking from 'expo-linking';
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './RootStackParamList';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      Main: {
        screens: {
          Home: 'home',
          WorldFeed: 'all',
          User: 'user/:account',
          Channel: 'hashtag/:name',
        },
      },
      NotFound: '*',
      Post: 'post/:id/:revision',
    },
  },
};
