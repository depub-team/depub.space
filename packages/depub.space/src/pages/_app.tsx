import React from 'react';
import { NativeBaseProvider } from 'native-base';
import { AppProps } from 'next/app';
import { theme } from '@depub/theme';
import { AppStateProvider } from '../hooks';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NativeBaseProvider theme={theme}>
      <AppStateProvider>
        <Component {...pageProps} />
      </AppStateProvider>
    </NativeBaseProvider>
  );
}

export default MyApp;
