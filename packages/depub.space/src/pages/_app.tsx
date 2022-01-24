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
      void (await Font.loadAsync({
        /* eslint-disable global-require, @typescript-eslint/no-var-requires */
        Inter: require('../../public/fonts/Inter-Regular.ttf').default,
        Inter_bold: require('../../public/fonts/Inter-Bold.ttf').default,
        Inter_medium: require('../../public/fonts/Inter-Medium.ttf').default,
        /* eslint-enable global-require, @typescript-eslint/no-var-requires */
      }));

      setIsLoading(false);
    })();
  }, []);

  return isLoading ? (
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
