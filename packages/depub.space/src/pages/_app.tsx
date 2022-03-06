import 'raf/polyfill';

/* eslint-disable import/first */
import React from 'react';
import { AppProps } from 'next/app';
/* eslint-enable import/first */

// import '../utils/wdyr';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
