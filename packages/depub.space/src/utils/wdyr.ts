import React from 'react';

/**
 * WDYR (why-did-you-render) helps locate unnecessary re-renders and fix them
 * Applied in development environment, on the frontend only
 *
 * @see https://github.com/welldone-software/why-did-you-render
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');

  console.debug(
    'Applying whyDidYouRender, to help you locate unnecessary re-renders during development. See https://github.com/welldone-software/why-did-you-render'
  );

  whyDidYouRender(React);
}

export default {};
