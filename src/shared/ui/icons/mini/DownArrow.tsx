import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgDownArrow = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 10 6" fill="none" {...props}>
    <Path d="M9 0.5L5 4.5L1 0.5" stroke="currentColor" strokeLinecap="round" />
  </Svg>
);
export default SvgDownArrow;
