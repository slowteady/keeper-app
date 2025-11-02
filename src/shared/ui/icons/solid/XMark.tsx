import * as React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgXMark = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx={12} cy={12} r={12} fill="white" />
    <Path
      d="M7.77439 17.5L6.5 16.2204L10.7368 12L6.5 7.75714L7.77439 6.5L12.0112 10.7316L16.248 6.5L17.5 7.75714L13.2744 11.9888L17.5 16.2204L16.2256 17.5L12 13.2684L7.77439 17.5Z"
      fill="#7E7E7E"
    />
  </Svg>
);
export default SvgXMark;
