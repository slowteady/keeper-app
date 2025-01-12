import Svg, { Path, SvgProps } from 'react-native-svg';

export const LocationIcon = ({ ...props }: SvgProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.4014 9.6006C14.4014 8.27463 13.327 7.2002 12.002 7.2002C10.676 7.2002 9.60156 8.27463 9.60156 9.6006C9.60156 10.9256 10.676 12 12.002 12C13.327 12 14.4014 10.9256 14.4014 9.6006Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9995 22C11.9995 18.3971 4.97717 15.2813 4.80023 9.57381C4.67598 5.56628 8.02293 2 11.9995 2C15.9761 2 19.3222 5.56622 19.1997 9.57381C19.0218 15.3983 11.9995 18.3007 11.9995 22Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};
