import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle,Path } from 'react-native-svg';
const SvgCircleX = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 16 16" fill="none" {...props}>
    <Path
      d="M11.131 5.52705L10.4711 4.86719L8.00103 7.33725L5.53096 4.86719L4.87109 5.52705L7.34116 7.99712L4.87109 10.4672L5.53096 11.1271L8.00103 8.65699L10.4711 11.1271L11.131 10.4672L8.66089 7.99712L11.131 5.52705Z"
      fill="#ADB3AF"
    />
    <Circle cx={8} cy={8} r={7.5} stroke="currentColor" />
  </Svg>
);
export default SvgCircleX;
