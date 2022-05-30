import { getInitialProps } from '@expo/next-adapter/document';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import React, { Children } from 'react';

// Force Next-generated DOM elements to fill their parent's height
const normalizeNextElements = `
  html, body, #__next {
    width: 100%;
    /* To smooth any scrolling behavior */
    -webkit-overflow-scrolling: touch;
    margin: 0px;
    padding: 0px;
    /* Allows content to fill the viewport and go beyond the bottom */
    min-height: 100%;
  }
  #__next {
    flex-shrink: 0;
    flex-basis: auto;
    flex-direction: column;
    flex-grow: 1;
    display: flex;
    flex: 1;
  }
  html {
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
    height: 100%;
  }
  body {
    display: flex;
    overflow-y: auto;
    overscroll-behavior-y: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -ms-overflow-style: scrollbar;
  }
`;

class CustomDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

CustomDocument.getInitialProps = async props => {
  const result = await getInitialProps(props);
  const nextDocumentProps = await Document.getInitialProps(props);
  const styles = [
    // eslint-disable-next-line react/jsx-key, react/no-danger
    <style dangerouslySetInnerHTML={{ __html: normalizeNextElements }} />,
  ];

  return { ...result, ...nextDocumentProps, styles: Children.toArray(styles) };
};

export default CustomDocument;
