import Svg, { G, Mask, Path, Rect, SvgProps } from 'react-native-svg';

export const HomeIcon = ({ ...props }: SvgProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <Mask id="mask0_2659_5321" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <Rect width="24" height="24" fill="#D9D9D9" />
      </Mask>
      <G mask="url(#mask0_2659_5321)">
        <Path
          d="M4.25 20.5556V20.8056H4.5H8.25H8.5V20.5556V13.4722H15.5V20.5556V20.8056H15.75H19.5H19.75V20.5556V9.55556V9.42887L19.6478 9.35395L12.1478 3.85395L12 3.74554L11.8522 3.85395L4.35216 9.35395L4.25 9.42887V9.55556V20.5556ZM21.75 8.46002V22.75H13.5V15.6667V15.4167H13.25H10.75H10.5V15.6667V22.75H2.25V8.46002L12 1.31002L21.75 8.46002Z"
          fill="#161717"
          stroke="#F3F4F4"
          strokeWidth="0.5"
        />
      </G>
    </Svg>
  );
};
