import React, { useEffect, useState } from 'react';
import { NativeBaseProvider } from 'native-base';
import { AppProps } from 'next/app';
import { theme } from '@depub/theme';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';
import { AppStateProvider } from '../hooks';

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line func-names
    void (async function () {
      /* eslint-disable global-require, @typescript-eslint/no-var-requires */
      try {
        void (await Promise.all([
          Font.loadAsync({
            Inter: require('../../public/fonts/Inter-Regular.ttf').default,
          }),
          Font.loadAsync({
            Inter_bold: require('../../public/fonts/Inter-Bold.ttf').default,
          }),
        ]));
      } catch (e) {
        // FontObserver timeout after 3000ms, this will fail silently
      }
      /* eslint-enable global-require, @typescript-eslint/no-var-requires */

      setIsLoading(false);
    })();
  }, []);

  return isLoading && process.browser ? (
    <AppLoading />
  ) : (
    <NativeBaseProvider theme={theme}>
      <AppStateProvider>
        <Component {...pageProps} />
      </AppStateProvider>
    </NativeBaseProvider>
  );
}

export default MyApp;
