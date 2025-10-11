import * as React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgSearch = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx={11.5} cy={10.5} r={7.75} stroke="currentColor" strokeWidth={1.5} />
    <Line x1={16.5303} y1={16.4697} x2={21.4801} y2={21.4194} stroke="currentColor" strokeWidth={1.5} />
  </Svg>
);
export default SvgSearch;
