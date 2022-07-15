/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgLikeClap = (props: SvgProps) => (
  <Svg
    className=""
    viewBox="0 0 186 186"
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    {...props}
  >
    <Path
      d="M82.7 64.6c-2.4 0-4.4-2-4.4-4.4 0-1.3.5-2.5 1.5-3.3 12.5-11 18-20 19-21.8 3.7-6.4 9.6-9.7 15.7-8.9 2.4.3 4.1 2.6 3.8 5s-2.5 4.1-4.9 3.8c-3.6-.5-6 3-6.9 4.5-1.1 1.9-7.3 12.1-20.8 24-.8.8-1.9 1.1-3 1.1M8.4 139.5c-2.4 0-4.4-2-4.4-4.4 0-1.3.6-2.6 1.6-3.4 4.4-3.6 13.2-9.3 16.2-10.9 2.2-1.1 4.8-.1 5.9 2.1 1 2.2.2 4.7-1.9 5.8-2.3 1.1-10.6 6.5-14.5 9.7-.8.7-1.8 1.1-2.9 1.1"
      fill="currentColor"
    />
    <Path
      d="M119.4 97.6c1.8 1.6 3.8.9 5.7-.8 12.8-12.2 26.3-31.3 30.8-41.3 1-2.1 2.9-3.3 5-2.5 2.5 1 2.4 5.2.2 9.8-5.9 12.2-14.1 25.6-30.3 42.3-1.6 1.6-1.3 3.7.1 5s3.7 1.2 5.9-1c8.4-8.6 14.1-15.2 18.9-22.1 1.2-1.8 2.8-2.5 4.2-2.2 2.1.4 2.5 2.5 1.8 4.9-1.1 4-12.2 18.6-16.6 23.5-12 13.4-24 20.7-47.1 32.7-8.1 4.2-14.1 8.2-17.7 14.4-3.3 5.6-4.3 7.4-4.7 8.1-1.3 2.7-.3 6.2 2.5 7.5 2.7 1.3 6 .2 7.3-2.6 0-.1.1-.2.1-.3s-.2.1 4.2-7.3c2.1-3.5 6.6-8.8 13.6-12 23.1-10.5 32.5-18.9 46-32.3 6.1-6.1 14.6-19.2 16.9-23.1 6.4-10.9 3.1-20.2-2.8-21.8-.4-.1-.6-.5-.5-.9 0-.1 0-.1.1-.2 4.5-7.7 6.6-13.1 7.4-17.2 1.1-5.6-.4-12.5-8.2-14.1-.4-.1-.6-.5-.6-.9.5-1.8 1-4 1.3-5.5 1.6-7.3-3-13.9-8.5-15.1-3.9-.8-7.4.1-10.4 2.2-.4.3-1 .2-1.3-.2-1.2-1.3-3.1-2.6-5.8-2.7-4.8-.1-9.6 1.4-13.1 8.8-2.5 5.3-6.2 12.5-17.1 24.5-10.1 11.5-24.1 22.4-32.8 28.1-1.5 1-3.7.8-3.4-1.3.4-3.2 3.9-25 4.5-31.4 1-10.4-4.6-15.2-10.9-16-5.2-.7-13 .8-17.3 12.6-2.5 6.9-7.8 18.2-12.2 36.5-3.1 12.8-3.6 27.8-.8 45 .2 1 0 2.1-.6 3-3.4 5.6-8.5 13.1-11.2 19.5-1.1 2.6-.2 5.7 2.3 7.1 2.6 1.4 5.9.5 7.4-2.2.1-.1.1-.2.2-.3 1.7-3.5 5.1-10.1 6.4-12.9 2.3-4.8 3.9-7.9 4.5-9.9.6-1.8.9-3.9-.1-8.7-1.8-8-2.4-23.1.9-36.4 4.3-17.6 11.7-37.3 13-40.6s3.2-4.3 5-4.1c1.9.2 5.4 1.1 4.4 7.7-1.8 11.9-4.4 27-5.3 32.1-.4 2.5-.9 8.3 3.7 11 3.6 2.1 7.5.9 11.9-2 9.8-6.6 26.8-19.9 37.4-31.9 11.2-12.5 14.7-20 17.6-26.8 1.3-3.1 4.7-3.1 5.9-2.7 1.2.3 2.6 2 1.6 5.3-2.5 8.2-12.7 27.1-32.3 44.8-2.2 2-1.9 4.4-.8 5.6s3.1 2 5.4 0c17.7-15.1 27.7-33 32.3-42.7 2.3-4.8 3.1-7.7 3.9-9.9 1-2.8 3.1-3.8 4.6-3.5 2.1.5 3.6 2.7 2.9 6.3-.6 3.1-2.4 8.3-4.8 13.4-5.7 12-17.6 28.1-30.5 41.9-1.5 2-1.8 4.2-.1 5.8M39.6 37.8c.7-.6.4-1.4.2-2-1-3-6.4-15.7-7.8-18.3-.7-1.3-1.6-1.5-2.6-1.1-1.3.5-2.9 1.7-5.3 3.8s-3.8 3.5-4.4 4.7c-.5.9-.4 1.8.7 2.7 2.3 1.7 14.2 8.8 17.1 10.1.7.3 1.4.7 2.1.1zM34.9 46.1c-.2-.9-1-1.1-1.6-1.2-3.1-.8-16.7-2.7-19.7-2.8-1.5-.1-2.1.6-2.3 1.6-.2 1.3-.1 3.3.5 6.5s1 5.1 1.7 6.3c.5.9 1.3 1.3 2.7.8 2.7-1.1 14.9-7.6 17.5-9.4.7-.5 1.4-.9 1.2-1.8zM137.5 150.1c-.9.1-1.2.8-1.4 1.4-1.1 3-4.5 16.4-4.9 19.2-.2 1.4.4 2.1 1.4 2.4 1.3.4 3.3.4 6.5.2s5.1-.5 6.4-1.1c.9-.4 1.5-1.2 1.1-2.6-.8-2.8-6-15.6-7.5-18.4-.3-.5-.7-1.2-1.6-1.1zM145.2 143.9c-.4.8.1 1.4.5 1.9 2 2.5 11.6 12.3 13.9 14.2 1.1.9 2 .8 2.8.1 1-.9 2.1-2.6 3.5-5.4 1.5-2.9 2.2-4.7 2.4-6 .1-1-.3-1.9-1.7-2.3-2.8-.8-16.4-3-19.6-3.2-.5-.1-1.4-.2-1.8.7z"
      fill="currentColor"
    />
  </Svg>
);

export default SvgLikeClap;
/* eslint-enable @typescript-eslint/ban-ts-comment */