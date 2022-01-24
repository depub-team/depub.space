import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import React, { Children } from 'react';
import { AppRegistry } from 'react-native';
import config from '../../app.json';

// Force Next-generated DOM elements to fill their parent's height
const normalizeNextElements = `
  body, html {
    width: 100%;
    min-height: 100%;
    padding: 0;
    margin: 0;
  }

  html {
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
    height: calc(100% + env(safe-area-inset-top));
  }

  body {
    display: flex;
    overflow-y: auto;
    overscroll-behavior-y: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }

  #__next {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
`;

export default class MyDocument extends Document {
  public static async getInitialProps({ renderPage }: DocumentContext) {
    AppRegistry.registerComponent(config.name, () => Main);

    const { getStyleElement } = AppRegistry.getApplication(config.name);
    const page = await renderPage();
    const styles = [
      // eslint-disable-next-line react/jsx-key, react/no-danger
      <style dangerouslySetInnerHTML={{ __html: normalizeNextElements }} />,
      getStyleElement(),
    ];

    return { ...page, styles: Children.toArray(styles) };
  }

  public render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
