import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgMessage = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.5481 18.5219C16.693 20.3772 14.2512 21.2755 11.8247 21.2231C8.5295 21.1519 2.75 21.2036 2.75 21.2036C2.75 21.2036 2.80068 15.3564 2.79819 12.0039C2.79644 9.64134 3.69595 7.27932 5.50162 5.47405C9.10096 1.87339 14.9487 1.87339 18.5481 5.47312C22.1539 9.07935 22.1474 14.9222 18.5481 18.5219Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path d="M8.31553 12.3814H8.21679" stroke="currentColor" strokeWidth={1.5} strokeLinecap="square" />
    <Path d="M12.0499 12.3814H11.9512" stroke="currentColor" strokeWidth={1.5} strokeLinecap="square" />
    <Path d="M15.7823 12.3814H15.6836" stroke="currentColor" strokeWidth={1.5} strokeLinecap="square" />
  </Svg>
);
export default SvgMessage;
