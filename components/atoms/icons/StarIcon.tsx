import Svg, { Path, SvgProps } from 'react-native-svg';

export const StarIcon = ({ ...props }: SvgProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 2.75L14.4983 9.50166L21.25 12L14.4983 14.4983L12 21.25L9.50166 14.4983L2.75 12L9.50166 9.50166L12 2.75Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};
