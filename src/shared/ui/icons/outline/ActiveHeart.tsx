import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgActiveHeart = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M9.03849 4C10.6385 4 11.3718 5 11.5385 5.5H12.5391C15.3391 3.1 18.0391 4.16667 19.0391 5C22.6391 7.8 21.2057 12.5 20.0391 14.5C17.2391 18.5 13.5391 20.1667 12.0391 20.5C5.03906 17.5 3.53849 14 3.03849 9.5C2.53849 5 7.03849 4 9.03849 4Z"
      fill="black"
    />
    <Path
      d="M21.2499 9.63726C21.24 7.1014 19.9096 4.7166 17.2866 3.87161C15.4855 3.2904 13.5236 3.61362 12 5.80109C10.4764 3.61362 8.51447 3.2904 6.71339 3.87161C4.09014 4.71669 2.75971 7.10195 2.75008 9.63813C2.72582 14.6819 7.83662 18.5414 11.9987 20.3861L12 20.3855L12.0013 20.3861C16.1636 18.5413 21.2748 14.6814 21.2499 9.63726Z"
      stroke="black"
      strokeWidth={1.5}
      strokeLinecap="square"
    />
    <Path
      d="M15.7442 11.2891C14.974 12.6119 13.6043 13.682 12.0205 13.6546C10.4368 13.682 9.06708 12.6119 8.29688 11.2891"
      stroke="#1FE678"
      strokeWidth={1.5}
      strokeLinecap="square"
    />
  </Svg>
);
export default SvgActiveHeart;
