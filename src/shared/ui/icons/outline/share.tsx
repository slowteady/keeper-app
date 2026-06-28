import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { ClipPath, Defs, G, Mask, Path, Rect } from 'react-native-svg';
const SvgShare = ({ color, ...props }: SvgProps) => {
  const fill = (color as string) ?? '#D3D9D5';
  return (
    <Svg width={24} height={24} viewBox="0 0 22 22" fill="none" {...props}>
      <Mask
        id="mask0_1912_11384"
        style={{
          maskType: 'alpha'
        }}
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={22}
        height={22}
      >
        <Rect y={22} width={22} height={22} transform="rotate(-90 0 22)" fill="#D9D9D9" />
      </Mask>
      <G mask="url(#mask0_1912_11384)" />
      <G clipPath="url(#clip0_1912_11384)">
        <Path
          d="M17.75 18.5L4.25 18.5C4.05109 18.5 3.86032 18.421 3.71967 18.2803C3.57902 18.1397 3.5 17.9489 3.5 17.75L3.5 14L2 14L2 17.75C2 18.3467 2.23705 18.919 2.65901 19.341C3.08097 19.7629 3.65326 20 4.25 20L17.75 20C18.3467 20 18.919 19.7629 19.341 19.341C19.7629 18.919 20 18.3467 20 17.75V14L18.5 14V17.75C18.5 17.9489 18.421 18.1397 18.2803 18.2803C18.1397 18.421 17.9489 18.5 17.75 18.5Z"
          fill={fill}
        />
        <Path
          d="M9.40825 2.65775L5.96875 6.09725L7.02925 7.15775L10.2273 3.95975L10.249 16.25L11.749 16.25L11.7273 3.91775L14.9688 7.15925L16.0293 6.09875L12.5898 2.65925C12.168 2.23724 11.5959 2.00001 10.9993 1.99973C10.4027 1.99945 9.83039 2.23614 9.40825 2.65775Z"
          fill={fill}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1912_11384">
          <Rect width={18} height={18} fill="white" transform="translate(2 20) rotate(-90)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
export default SvgShare;
