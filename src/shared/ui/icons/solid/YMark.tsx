import * as React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgYMark = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx={12} cy={12} r={12} fill="white" />
    <Path
      d="M12 18C8.67234 18.0073 5.99273 15.3131 6.00001 12C5.99273 8.67962 8.67234 5.99273 12 6.00001C15.3131 5.99273 18 8.67962 18 12C18 15.3131 15.3131 18.0073 12 18ZM7.64564 12C7.64564 14.4029 9.58982 16.3471 12 16.3398C14.3956 16.3471 16.3471 14.4029 16.3398 12C16.3471 9.59709 14.3956 7.65292 12 7.6602C9.58982 7.65292 7.64564 9.59709 7.64564 12Z"
      fill="#7E7E7E"
    />
  </Svg>
);
export default SvgYMark;
