import 'raf/polyfill';

/* eslint-disable import/first */
import React from 'react';
import { AppProps } from 'next/app';
/* eslint-enable import/first */

const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  // eslint-disable-next-line global-require
  require('../utils/wdyr');
}

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
