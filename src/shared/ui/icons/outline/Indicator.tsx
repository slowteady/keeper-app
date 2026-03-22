import * as React from 'react';
/* SVGR has dropped some elements not supported by react-native-svg: filter */
import type { SvgProps } from 'react-native-svg';
import Svg, { Defs, G, Path } from 'react-native-svg';
const SvgIndicator = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 61 20" fill="none" {...props}>
    <G filter="url(#filter0_d_1554_21157)">
      <Path
        d="M24.5977 16.0586C26.5056 16.0585 27.884 14.4777 28.8262 12.7217C29.3427 11.7603 31.6572 11.7603 32.1738 12.7217C33.116 14.4777 34.4944 16.0585 36.4023 16.0586L45 16.0586C47.2091 16.0586 49 17.8495 49 20.0586L12 20.0586C12 17.8495 13.7909 16.0586 16 16.0586L24.5977 16.0586Z"
        fill="#1FE678"
      />
    </G>
    <Defs></Defs>
  </Svg>
);
export default SvgIndicator;
