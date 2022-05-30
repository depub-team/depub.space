import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import {
  View,
  ColorMode,
  StorageManager,
  NativeBaseProvider,
  useColorMode,
  useToken,
  INativebaseConfig,
} from 'native-base';
import { theme } from '@depub/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { AppStateProvider, WalletProvider } from '../hooks';
import { AlertProvider, Meta } from '../components';
import { RootNavigator } from './RootNavigator';
import { getSystemDarkMode } from '../utils';
import { linking } from './linking';

const nativeBaseConfig: INativebaseConfig = {
  dependencies: {
    'linear-gradient': LinearGradient,
  },
};

const navigationDocumentTitle = { enabled: false };

const colorModeManager: StorageManager = {
  get: async () => {
    try {
      const val = await AsyncStorage.getItem('@color-mode');

      if (!val) {
        const systemDarkMode = getSystemDarkMode();

        return systemDarkMode;
      }

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

export interface NavigationThemeProviderProps {
  children?: ReactNode;
}

const NavigationThemeProvider: FC<NavigationThemeProviderProps> = ({ children }) => {
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
  const [appIsReady, setAppIsReady] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        void SplashScreen.preventAutoHideAsync();

        /* eslint-disable global-require, @typescript-eslint/no-var-requires */
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
        /* eslint-enable global-require, @typescript-eslint/no-var-requires */
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    void prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <>
      <Meta />

      <SafeAreaProvider>
        <NavigationContainer documentTitle={navigationDocumentTitle} linking={linking}>
          <NativeBaseProvider
            colorModeManager={colorModeManager}
            config={nativeBaseConfig}
            theme={theme}
          >
            <View
              _dark={{
                bg: 'darkBlue.900',
              }}
              _light={{
                bg: 'white',
              }}
              flex={1}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onLayout={onLayoutRootView}
            >
              <AlertProvider>
                <WalletProvider>
                  <AppStateProvider>
                    <NavigationThemeProvider>
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
                    </NavigationThemeProvider>
                  </AppStateProvider>
                </WalletProvider>
              </AlertProvider>
            </View>
          </NativeBaseProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </>
  );
};

// (MainContainer as any).whyDidYouRender = true;

export default MainContainer;
