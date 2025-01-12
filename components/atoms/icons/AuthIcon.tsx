import Svg, { Path, SvgProps } from 'react-native-svg';

export const AuthIcon = ({ ...props }: SvgProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.6884 12.0004C10.6884 13.0234 9.85938 13.8524 8.83637 13.8524C7.81337 13.8524 6.98438 13.0234 6.98438 12.0004C6.98438 10.9774 7.81337 10.1484 8.83637 10.1484H8.83938C9.86038 10.1494 10.6884 10.9784 10.6884 12.0004Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
      <Path d="M10.6914 12H17.0094V13.852" stroke="black" stroke-width="1.5" stroke-linecap="square" />
      <Path d="M14.1836 13.852V12" stroke="black" stroke-width="1.5" stroke-linecap="square" />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.25 21.25L21.25 2.75L2.75 2.75L2.75 21.25L21.25 21.25Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};
