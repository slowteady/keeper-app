import * as React from 'react';
import Svg, { Mask, Rect, G, Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgMoreImage = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Mask
      id="mask0_295_7759"
      style={{
        maskType: 'alpha'
      }}
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={24}
      height={24}
    >
      <Rect width={24} height={24} fill="#D9D9D9" />
    </Mask>
    <G mask="url(#mask0_295_7759)">
      <Path
        d="M3 21V15H5V17.6L8.1 14.5L9.5 15.9L6.4 19H9V21H3ZM15 21V19H17.6L14.5 15.9L15.9 14.5L19 17.6V15H21V21H15ZM8.1 9.5L5 6.4V9H3V3H9V5H6.4L9.5 8.1L8.1 9.5ZM15.9 9.5L14.5 8.1L17.6 5H15V3H21V9H19V6.4L15.9 9.5ZM12 14C11.45 14 10.9792 13.8042 10.5875 13.4125C10.1958 13.0208 10 12.55 10 12C10 11.45 10.1958 10.9792 10.5875 10.5875C10.9792 10.1958 11.45 10 12 10C12.55 10 13.0208 10.1958 13.4125 10.5875C13.8042 10.9792 14 11.45 14 12C14 12.55 13.8042 13.0208 13.4125 13.4125C13.0208 13.8042 12.55 14 12 14Z"
        fill="currentColor"
      />
    </G>
  </Svg>
);
export default SvgMoreImage;
