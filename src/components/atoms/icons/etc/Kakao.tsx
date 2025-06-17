import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgKakao = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 22" fill="none" {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.0001 0.734375C5.37225 0.734375 0 4.5391 0 9.23161C0 12.15 2.07788 14.7227 5.24205 16.2529L3.91072 20.711C3.7931 21.1049 4.28457 21.4189 4.66197 21.1906L10.4978 17.66C10.9903 17.7035 11.4908 17.7289 12.0001 17.7289C18.6274 17.7289 24 13.9244 24 9.23161C24 4.5391 18.6274 0.734375 12.0001 0.734375"
      fill="currentColor"
    />
  </Svg>
);
export default SvgKakao;
