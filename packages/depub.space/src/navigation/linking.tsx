import * as Linking from 'expo-linking';
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './RootStackParamList';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      Main: {
        screens: {
          Home: {
            path: '',
          },
          WorldFeed: 'all',
          Channel: 'hashtag/:name',
          User: {
            path: ':account',
            parse: {
              id: (id: string) => id.replace(/^@/, ''),
            },
          },
        },
      },
      Post: ':id/:revision',
      NotFound: '*',
    },
  },
};
