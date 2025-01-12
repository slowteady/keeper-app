import Svg, { G, Mask, Path, Rect, SvgProps } from 'react-native-svg';

export const CloseIcon = ({ ...props }: SvgProps) => {
  return (
    <Svg width="30" height="30" viewBox="0 0 30 30" fill="none" {...props}>
      <Mask id="mask0_2659_5327" maskUnits="userSpaceOnUse" x="0" y="0" width="30" height="30">
        <Rect width="30" height="30" fill="#D9D9D9" />
      </Mask>
      <G mask="url(#mask0_2659_5327)">
        <Path
          d="M15.0721 16.3877L15.0014 16.317L14.9307 16.3877L8.51413 22.8042C8.33142 22.9869 8.11373 23.0771 7.85547 23.0771C7.59744 23.0771 7.37985 22.987 7.19712 22.8042C7.01439 22.6215 6.92422 22.4039 6.92422 22.1459C6.92422 21.8876 7.0144 21.6699 7.19712 21.4872L13.6137 15.0707L13.6844 14.9999L13.6137 14.9292L7.19712 8.51267C7.0144 8.32995 6.92422 8.11226 6.92422 7.854C6.92422 7.59598 7.01439 7.37838 7.19712 7.19565C7.37985 7.01292 7.59744 6.92275 7.85547 6.92275C8.11373 6.92275 8.33142 7.01294 8.51413 7.19565L14.9307 13.6122L15.0014 13.6829L15.0721 13.6122L21.4887 7.19565C21.6714 7.01294 21.8891 6.92275 22.1473 6.92275C22.4054 6.92275 22.623 7.01292 22.8057 7.19565C22.9884 7.37838 23.0786 7.59598 23.0786 7.854C23.0786 8.11226 22.9884 8.32995 22.8057 8.51267L16.3891 14.9292L16.3184 14.9999L16.3891 15.0707L22.8057 21.4872C22.9884 21.6699 23.0786 21.8876 23.0786 22.1459C23.0786 22.4039 22.9884 22.6215 22.8057 22.8042C22.623 22.987 22.4054 23.0771 22.1473 23.0771C21.8891 23.0771 21.6714 22.9869 21.4887 22.8042L15.0721 16.3877Z"
          fill="#161717"
          stroke="#F3F4F4"
          strokeWidth="0.2"
        />
      </G>
    </Svg>
  );
};
