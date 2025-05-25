import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgLeftArrow = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 18 18" fill="none" {...props}>
    <Path
      d="M12.7266 3.83564V2.47685C12.7266 2.35907 12.5912 2.29403 12.4998 2.3661L4.57561 8.55536C4.50828 8.60772 4.45381 8.67477 4.41633 8.75138C4.37886 8.828 4.35937 8.91216 4.35938 8.99745C4.35937 9.08274 4.37886 9.16691 4.41633 9.24352C4.45381 9.32014 4.50828 9.38718 4.57561 9.43954L12.4998 15.6288C12.593 15.7009 12.7266 15.6358 12.7266 15.5181V14.1593C12.7266 14.0731 12.6862 13.9905 12.6194 13.9378L6.29124 8.99833L12.6194 4.05712C12.6862 4.00439 12.7266 3.92177 12.7266 3.83564V3.83564Z"
      fill="currentColor"
    />
  </Svg>
);
export default SvgLeftArrow;
