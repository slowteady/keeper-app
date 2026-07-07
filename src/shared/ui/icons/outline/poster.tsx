import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const SvgPoster = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Rect x={5} y={3} width={14} height={18} rx={2.5} stroke="currentColor" strokeWidth={2} />
    <Circle cx={9.5} cy={9} r={1.4} stroke="currentColor" strokeWidth={1.6} />
    <Path
      d="M6 17.5 9.2 14.1a1 1 0 0 1 1.45 0L13 16.4l1.4-1.5a1 1 0 0 1 1.46 0L18 17.2"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgPoster;
