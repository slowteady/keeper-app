import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgMessage = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.5481 18.5224C16.693 20.3777 14.2512 21.276 11.8247 21.2236C8.5295 21.1523 2.75 21.2041 2.75 21.2041C2.75 21.2041 2.80068 15.3569 2.79819 12.0043C2.79644 9.64182 3.69595 7.27981 5.50162 5.47454C9.10096 1.87388 14.9487 1.87388 18.5481 5.47361C22.1539 9.07984 22.1474 14.9227 18.5481 18.5224Z"
      stroke="black"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path d="M8.31553 12.3809H8.21679" stroke="black" strokeWidth={1.5} strokeLinecap="square" />
    <Path d="M12.0499 12.3809H11.9512" stroke="black" strokeWidth={1.5} strokeLinecap="square" />
    <Path d="M15.7843 12.3809H15.6855" stroke="black" strokeWidth={1.5} strokeLinecap="square" />
  </Svg>
);
export default SvgMessage;
