import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, Path } from 'react-native-svg';
const SvgActiveUser = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx={12} cy={7} r={4} fill="black" />
    <Path
      d="M12 14.5C8 14.5 5.33333 17.8333 4.5 19.5C10.5 22.7 16.6667 20.8333 19 19.5C18.2 15.9 14 14.6667 12 14.5Z"
      fill="black"
    />
    <Path
      d="M11.9999 14.8203C15.2563 14.812 18.0251 16.3072 19.0428 19.5257C16.9914 20.7762 14.5768 21.2579 11.9999 21.2516C9.42304 21.2579 7.0084 20.7762 4.95703 19.5257C5.97593 16.3037 8.74006 14.812 11.9999 14.8203Z"
      stroke="black"
      strokeWidth={1.5}
      strokeLinecap="square"
    />
    <Circle cx={11.9998} cy={7.16973} r={4.41973} stroke="black" strokeWidth={1.5} strokeLinecap="square" />
  </Svg>
);
export default SvgActiveUser;
