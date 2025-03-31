import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgHeart = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M21.2499 9.63726C21.24 7.1014 19.9096 4.7166 17.2866 3.87161C15.4855 3.2904 13.5236 3.61362 12 5.80109C10.4764 3.61362 8.51447 3.2904 6.71339 3.87161C4.09014 4.71669 2.75971 7.10195 2.75008 9.63813C2.72582 14.6819 7.83662 18.5414 11.9987 20.3861L12 20.3855L12.0013 20.3861C16.1636 18.5413 21.2748 14.6814 21.2499 9.63726Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
    />
    <Path
      d="M15.7432 11.2891C14.973 12.6119 13.6033 13.682 12.0196 13.6546C10.4358 13.682 9.0661 12.6119 8.2959 11.2891"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
    />
  </Svg>
);
export default SvgHeart;
