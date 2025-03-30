import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgRightLineArrow = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 9 8" fill="none" {...props}>
    <Path
      d="M4.65039 7.01074L4.16699 6.53809L6.77734 3.93848H0.246094V3.26172H6.77734L4.16699 0.651367L4.65039 0.178711L8.05566 3.59473L4.65039 7.01074Z"
      fill="currentColor"
    />
  </Svg>
);
export default SvgRightLineArrow;
