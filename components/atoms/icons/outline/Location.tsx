import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgLocation = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.4004 9.59963C14.4004 8.27365 13.326 7.19922 12.001 7.19922C10.675 7.19922 9.60059 8.27365 9.60059 9.59963C9.60059 10.9246 10.675 11.9991 12.001 11.9991C13.326 11.9991 14.4004 10.9246 14.4004 9.59963Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.9995 22C11.9995 18.3971 4.97717 15.2813 4.80023 9.57381C4.67598 5.56628 8.02293 2 11.9995 2C15.9761 2 19.3222 5.56622 19.1997 9.57381C19.0218 15.3983 11.9995 18.3007 11.9995 22Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);
export default SvgLocation;
