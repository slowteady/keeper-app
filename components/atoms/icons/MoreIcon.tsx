import Svg, { Circle, SvgProps } from 'react-native-svg';

const MoreIcon = ({ ...props }: SvgProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx="12" cy="4" r="2" fill="#868B88" />
      <Circle cx="12" cy="12" r="2" fill="#868B88" />
      <Circle cx="12" cy="20" r="2" fill="#868B88" />
    </Svg>
  );
};

export default MoreIcon;
