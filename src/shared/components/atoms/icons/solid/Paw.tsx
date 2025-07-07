import * as React from 'react';
import Svg, { Path, Ellipse } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgPaw = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 23 22" fill="none" {...props}>
    <Path
      d="M14.8785 13.7568C15.358 16.9615 13.3011 22.8315 9.45542 21.1039C8.75944 20.8674 6.61511 19.5562 3.11995 15.812C-0.375217 12.0678 3.16624 9.58239 7.36242 9.29335C11.5586 9.00431 14.399 10.5521 14.8785 13.7568Z"
      fill="currentColor"
    />
    <Ellipse
      cx={2.41742}
      cy={2.93724}
      rx={2.41742}
      ry={2.93724}
      transform="matrix(0.964984 -0.262311 0.255367 0.966844 3.19336 2.69397)"
      fill="currentColor"
    />
    <Ellipse
      cx={2.90862}
      cy={3.90613}
      rx={2.90862}
      ry={3.90613}
      transform="matrix(0.862885 0.505401 -0.494619 0.86911 13.5215 -0.00012207)"
      fill="currentColor"
    />
    <Ellipse
      cx={2.4477}
      cy={2.9009}
      rx={2.4477}
      ry={2.9009}
      transform="matrix(0.255367 0.966844 -0.964984 0.262311 21.25 8.81995)"
      fill="currentColor"
    />
  </Svg>
);
export default SvgPaw;
