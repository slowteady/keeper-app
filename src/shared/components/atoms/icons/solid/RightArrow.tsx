import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgRightArrow = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 11 18" fill="none" {...props}>
    <Path d="M1 1L9 9L1 17" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);
export default SvgRightArrow;
