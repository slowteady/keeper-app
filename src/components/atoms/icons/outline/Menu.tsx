import * as React from 'react';
import Svg, { Line } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgMenu = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Line x1={3} y1={3.25} x2={21} y2={3.25} stroke="currentColor" strokeWidth={1.5} />
    <Line x1={3} y1={11.25} x2={21} y2={11.25} stroke="currentColor" strokeWidth={1.5} />
    <Line x1={3} y1={19.25} x2={21} y2={19.25} stroke="currentColor" strokeWidth={1.5} />
  </Svg>
);
export default SvgMenu;
