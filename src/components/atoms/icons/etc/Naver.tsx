import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgNaver = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 20 18" fill="none" {...props}>
    <G clipPath="url(#clip0_344_7972)">
      <Path
        d="M13.5614 9.633L6.14609 4.76837e-07H0V18H6.43861V8.3655L13.8539 18H20V4.76837e-07H13.5614V9.633Z"
        fill="white"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_344_7972">
        <Rect width={20} height={18} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgNaver;
