import Svg, { Path, SvgProps } from 'react-native-svg';

const CheckIcon = ({ ...props }: SvgProps) => {
  return (
    <Svg width="17" height="20" viewBox="0 0 17 20" fill="none" {...props}>
      <Path
        d="M1.62109 10.7695L2.98828 9.40234L6.48438 12.8203L13.8672 5.47656L15.2539 6.84375L6.48438 15.5938L1.62109 10.7695Z"
        fill="currentColor"
      />
    </Svg>
  );
};

export default CheckIcon;
