import * as React from 'react';
import Svg, { Mask, Rect, G, Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgRightArrow = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 26 26" fill="none" {...props}>
    <Mask
      id="mask0_1_1516"
      style={{
        maskType: 'alpha'
      }}
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={26}
      height={26}
    >
      <Rect x={0.478516} y={0.478271} width={25.0435} height={25.0435} fill="#D9D9D9" />
      <Rect x={0.478516} y={0.478271} width={25.0435} height={25.0435} stroke="white" />
    </Mask>
    <G mask="url(#mask0_1_1516)">
      <Path
        d="M10.8522 23.4338L9 21.5816L17.5826 12.999L9 4.41638L10.8522 2.56421L21.287 12.999L10.8522 23.4338Z"
        fill="currentColor"
      />
    </G>
  </Svg>
);
export default SvgRightArrow;
