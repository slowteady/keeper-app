import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgLogin = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.6894 12.0004C10.6894 13.0234 9.86035 13.8524 8.83735 13.8524C7.81435 13.8524 6.98535 13.0234 6.98535 12.0004C6.98535 10.9774 7.81435 10.1484 8.83735 10.1484H8.84035C9.86135 10.1494 10.6894 10.9784 10.6894 12.0004Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
    />
    <Path d="M10.6924 12H17.0104V13.852" stroke="currentColor" strokeWidth={1.5} strokeLinecap="square" />
    <Path d="M14.1816 13.852V12" stroke="currentColor" strokeWidth={1.5} strokeLinecap="square" />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21.25 21.25L21.25 2.75L2.75 2.75L2.75 21.25L21.25 21.25Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);
export default SvgLogin;
