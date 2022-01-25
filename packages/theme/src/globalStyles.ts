export const globalStyles = (primaryColor: string) => `
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

  a {
    color: ${primaryColor};
    text-decoration: none;
  }
`;
