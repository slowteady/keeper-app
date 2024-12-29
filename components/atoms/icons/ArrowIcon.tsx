import Svg, { Path, SvgProps } from 'react-native-svg';

export const ArrowRightIcon = ({ ...props }: SvgProps) => {
  return (
    <Svg width="11" height="10" viewBox="0 0 11 10" fill="none" {...props}>
      <Path
        d="M6.19141 9.01367L5.57617 8.41211L8.89844 5.10352H0.585938V4.24219H8.89844L5.57617 0.919922L6.19141 0.318359L10.5254 4.66602L6.19141 9.01367Z"
        fill="black"
      />
    </Svg>
  );
};

export const ArrowLeftIcon = ({ ...props }: SvgProps) => {
  return (
    <Svg width="11" height="10" viewBox="0 0 11 10" fill="none" {...props}>
      <Path
        d="M4.80859 9.01367L5.42383 8.41211L2.10156 5.10352H10.4141V4.24219H2.10156L5.42383 0.919922L4.80859 0.318359L0.474609 4.66602L4.80859 9.01367Z"
        fill="black"
      />
    </Svg>
  );
};
