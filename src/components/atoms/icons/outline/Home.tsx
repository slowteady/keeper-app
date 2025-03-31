import type { SvgProps } from 'react-native-svg';
import Svg, { G, Mask, Path, Rect } from 'react-native-svg';
const SvgHome = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 25 24" fill="none" {...props}>
    <Mask
      id="mask0_549_8738"
      style={{
        maskType: 'alpha'
      }}
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={25}
      height={24}
    >
      <Rect x={0.75} width={24} height={24} fill="#D9D9D9" />
    </Mask>
    <G mask="url(#mask0_549_8738)">
      <Path
        d="M5 20.5556V20.8056H5.25H9H9.25V20.5556V13.4722H16.25V20.5556V20.8056H16.5H20.25H20.5V20.5556V9.55556V9.42887L20.3978 9.35395L12.8978 3.85395L12.75 3.74554L12.6022 3.85395L5.10216 9.35395L5 9.42887V9.55556V20.5556ZM22.5 8.46002V22.75H14.25V15.6667V15.4167H14H11.5H11.25V15.6667V22.75H3V8.46002L12.75 1.31002L22.5 8.46002Z"
        fill="currentColor"
        stroke="#F3F4F4"
        strokeWidth={0.5}
      />
    </G>
  </Svg>
);
export default SvgHome;
