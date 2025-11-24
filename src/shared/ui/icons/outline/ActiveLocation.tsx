import * as React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgActiveLocation = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.5 2.07769C13 1.57775 16.5 3.57774 18 5.57769C19.5 7.57767 18.5 13.5776 16.5 15.0777C14.9 16.2777 12.5 19.5776 11.5 21.0777L10 18.0777L8 16.0777L5 12.5777V8.07769L6.5 5.07769C7.6667 4.24434 10.3 2.47768 11.5 2.07769ZM12 7.07867C10.6193 7.07867 9.5 8.19796 9.5 9.57867C9.50023 10.9592 10.6194 12.0787 12 12.0787C13.3806 12.0787 14.4998 10.9592 14.5 9.57867C14.5 8.19796 13.3807 7.07867 12 7.07867Z"
      fill="black"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.3994 9.59963C14.3994 8.27365 13.325 7.19922 12 7.19922C10.674 7.19922 9.59961 8.27365 9.59961 9.59963C9.59961 10.9246 10.674 11.9991 12 11.9991C13.325 11.9991 14.3994 10.9246 14.3994 9.59963Z"
      stroke="black"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.9995 22C11.9995 18.3971 4.97717 15.2813 4.80023 9.57381C4.67598 5.56628 8.02293 2 11.9995 2C15.9761 2 19.3222 5.56622 19.1997 9.57381C19.0218 15.3983 11.9995 18.3007 11.9995 22Z"
      stroke="black"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Circle cx={12} cy={9} r={2} fill="#1FE678" />
  </Svg>
);
export default SvgActiveLocation;
