import React, { FC, SVGProps } from 'react';

export type HexShapedSvgProps = SVGProps<SVGSVGElement>;

export const HexShapedSvg: FC<HexShapedSvgProps> = props => (
  <svg {...props}>
    <clipPath clipPathUnits="objectBoundingBox" id="hexShapedPath" transform="scale(0.001953125)">
      <path
        d="M456.1,105.9L285.9,7.7C267.4-3,244.6-3,226.1,7.7L55.9,105.9C37.4,116.6,26,136.4,26,157.8v196.5
		c0,21.4,11.4,41.1,29.9,51.8l170.2,98.2c18.5,10.7,41.3,10.7,59.8,0l170.2-98.2c18.5-10.7,29.9-30.4,29.9-51.8V157.8
		C486,136.4,474.6,116.6,456.1,105.9z"
      />
    </clipPath>
  </svg>
);
