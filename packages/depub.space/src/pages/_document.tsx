import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import React, { Children } from 'react';
import { AppRegistry } from 'react-native';
import { globals } from '@depub/theme';
import config from '../../app.json';

export default class MyDocument extends Document {
  public static async getInitialProps({ renderPage }: DocumentContext) {
    AppRegistry.registerComponent(config.name, () => Main);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { getStyleElement } = AppRegistry.getApplication(config.name);
    const page = await renderPage();
    const styles = [
      // eslint-disable-next-line react/jsx-key, react/no-danger
      <style dangerouslySetInnerHTML={{ __html: globals }} />,
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
