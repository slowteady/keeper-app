import Svg, { Circle, Path, SvgProps } from 'react-native-svg';

export const ProfileIcon = ({ ...props }: SvgProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M11.9999 14.8184C15.2563 14.8101 18.0251 16.3052 19.0428 19.5237C16.9914 20.7743 14.5768 21.2559 11.9999 21.2496C9.42304 21.2559 7.0084 20.7743 4.95703 19.5237C5.97593 16.3017 8.74006 14.8101 11.9999 14.8184Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
      <Circle cx="12.0018" cy="7.16973" r="4.41973" stroke="black" strokeWidth="1.5" strokeLinecap="square" />
    </Svg>
  );
};
