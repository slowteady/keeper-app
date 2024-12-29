import { Circle, G, Line, Svg, SvgProps } from 'react-native-svg';

export const SearchIcon = ({ ...props }: SvgProps) => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <G id="icon/search">
        <G id="Group 568">
          <Circle id="Ellipse 114" cx="11.5" cy="11" r="7.75" stroke="#161717" strokeWidth={1.5} />
          <Line id="Line 133" x1="16.5303" y1="16.9697" x2="21.4801" y2="21.9194" stroke="#161717" strokeWidth={1.5} />
        </G>
      </G>
    </Svg>
  );
};
