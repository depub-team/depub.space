/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgDepubSpinner = (props: SvgProps) => (
  <Svg
    className=""
    style={{
      enableBackground: 'new 0 0 1024 1024',
    }}
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    {...props}
  >
    <Path
      d="M469.8 656.3 174.1 899.9l554.6-95.7 216.4-441.6-340.3 95 85.3 17.2-105.2 86.7"
      style={{
        fill: '#07d6a0',
      }}
    />
    <Path
      d="M358.1 748.3 84 728.8l90.1 171.1zM925.3 402.9l60 34.2-101.8 51.2z"
      style={{
        opacity: 0.5,
        fill: '#07d6a0',
      }}
    />
    <Path
      d="m364.1 258.9 213.8 89.8 3.5 366.6-108.9-44.9V426l-108.4-44.9z"
      style={{
        fill: '#07d6a0',
      }}
    />
    <Path
      d="m472.5 670.4-108.4-44.9V503.3l108.4 44.9zM364.1 503.3l-108.2-44.9V336.2l108.2 44.9zM255.9 336.2l-108.4-44.9V169l108.4 44.9z"
      style={{
        fill: '#07d6a0',
        fillOpacity: 0.7,
      }}
    />
    <Path
      d="m364.1 381.1-108.2-44.9V213.9l108.2 44.9zM472.5 548.2l-108.4-44.9V381.1L472.5 426z"
      style={{
        fill: '#07d6a0',
        fillOpacity: 0.9,
      }}
    />
    <Path
      d="m364.1 625.5-108.2-44.9V458.4l108.2 44.9zM255.9 458.4l-108.4-44.9V291.3l108.4 44.9zM147.5 291.3 39.9 246.4l-1.2-122.3L147.5 169z"
      style={{
        fill: '#07d6a0',
        fillOpacity: 0.5,
      }}
    />
    <Path
      d="m472.5 670.4-108.4-44.9V503.3l108.4 44.9z"
      style={{
        fill: '#07d6a0',
        fillOpacity: 0.7,
      }}
    />
  </Svg>
);

export default SvgDepubSpinner;
/* eslint-enable @typescript-eslint/ban-ts-comment */
