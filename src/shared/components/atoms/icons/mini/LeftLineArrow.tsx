import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgLeftLineArrow = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 9 8" fill="none" {...props}>
    <Path
      d="M4.34961 7.01074L4.83301 6.53809L2.22266 3.93848H8.75391V3.26172H2.22266L4.83301 0.651367L4.34961 0.178711L0.944336 3.59473L4.34961 7.01074Z"
      fill="currentColor"
    />
  </Svg>
);
export default SvgLeftLineArrow;
