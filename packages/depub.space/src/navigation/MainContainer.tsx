import React, { FC, useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import {
  View,
  ColorMode,
  StorageManager,
  NativeBaseProvider,
  useColorMode,
  useToken,
} from 'native-base';
import { theme } from '@depub/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AppLoading from 'expo-app-loading';
import {
  DarkTheme,
  DefaultTheme,
  LinkingOptions,
  NavigationContainer,
  ThemeProvider,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppStateProvider, WalletProvider } from '../hooks';
import { AlertProvider } from '../components';
import { RootNavigator } from './RootNavigator';
import { RootStackParamList } from './RootStackParamList';

void SplashScreen.preventAutoHideAsync();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      Main: {
        screens: {
          Home: 'home',
          WorldFeed: '/channels/all',
          User: 'user/:account',
          Channel: 'channels/:name',
        },
      },
      NotFound: '404',
      Post: ':id',
      ConnectWallet: 'connectWallet',
      Image: 'image',
    },
  },
};

const colorModeManager: StorageManager = {
  get: async () => {
    try {
      const val = await AsyncStorage.getItem('@color-mode');

      return val === 'dark' ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  set: async (value: ColorMode) => {
    try {
      if (value) {
        await AsyncStorage.setItem('@color-mode', value);
      }
    } catch (e) {
      // do nothing
    }
  },
};

const NavigationThemeProvider: FC = ({ children }) => {
  const { colorMode } = useColorMode();
  const darkBlue900 = useToken('colors', 'darkBlue.900');
  const isDarkMode = colorMode === 'dark';
  const defaultTheme = isDarkMode ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: theme.colors.primary['500'],
      background: isDarkMode ? darkBlue900 : '#FFF',
      card: isDarkMode ? darkBlue900 : '#FFF',
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={isDarkMode ? 'dark' : 'light'} />
      {children}
    </ThemeProvider>
  );
};

const MainContainer = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line func-names
    void (async function () {
      /* eslint-disable global-require, @typescript-eslint/no-var-requires */
      try {
        void (await Promise.all([
          Font.loadAsync({
            Montserrat: require('../../public/fonts/Montserrat-Regular.ttf').default,
          }),
          Font.loadAsync({
            Montserrat_bold: require('../../public/fonts/Montserrat-Bold.ttf').default,
          }),
          Font.loadAsync({
            Montserrat_medium: require('../../public/fonts/Montserrat-Medium.ttf').default,
          }),
        ]));
      } catch (e) {
        // FontObserver timeout after 3000ms, this will fail silently
      }
      /* eslint-enable global-require, @typescript-eslint/no-var-requires */

      await SplashScreen.hideAsync();

      setIsLoading(false);
    })();
  }, []);

  return isLoading && process.browser ? (
    <AppLoading />
  ) : (
    <SafeAreaProvider>
      <NavigationContainer documentTitle={{ enabled: false }} linking={linking}>
        <NativeBaseProvider colorModeManager={colorModeManager} theme={theme}>
          <NavigationThemeProvider>
            <View
              _dark={{
                bg: 'darkBlue.900',
              }}
              _light={{
                bg: 'white',
              }}
              flex={1}
            >
              <AlertProvider>
                <WalletProvider>
                  <AppStateProvider>
                    <View
                      _web={{
                        maxW: '1440px',
                      }}
                      alignSelf="center"
                      flex={1}
                      w="100%"
                    >
                      <RootNavigator />
                    </View>
                  </AppStateProvider>
                </WalletProvider>
              </AlertProvider>
            </View>
          </NavigationThemeProvider>
        </NativeBaseProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default MainContainer;
