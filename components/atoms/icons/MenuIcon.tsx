import { Line, Svg, SvgProps } from 'react-native-svg';

export const MenuIcon = ({ ...props }: SvgProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Line x1="3" y1="3.75" x2="21" y2="3.75" stroke="#161717" strokeWidth="1.5" />
      <Line x1="3" y1="11.75" x2="21" y2="11.75" stroke="#161717" strokeWidth="1.5" />
      <Line x1="3" y1="19.75" x2="21" y2="19.75" stroke="#161717" strokeWidth="1.5" />
    </Svg>
  );
};
