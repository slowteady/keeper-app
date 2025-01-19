import { forwardRef } from 'react';
import Animated, { AnimatedProps } from 'react-native-reanimated';
import Svg, { Path, SvgProps } from 'react-native-svg';

export const HeartIcon = ({ ...props }: SvgProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M21.2499 9.63531C21.24 7.09945 19.9096 4.71464 17.2866 3.86966C15.4855 3.28845 13.5236 3.61167 12 5.79914C10.4764 3.61167 8.51447 3.28845 6.71339 3.86966C4.09014 4.71474 2.75971 7.09999 2.75008 9.63618C2.72582 14.6799 7.83662 18.5394 11.9987 20.3842L12 20.3836L12.0013 20.3842C16.1636 18.5393 21.2748 14.6794 21.2499 9.63531Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
      <Path
        d="M15.7442 11.29C14.974 12.6129 13.6043 13.683 12.0205 13.6556C10.4368 13.683 9.06708 12.6129 8.29688 11.29"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </Svg>
  );
};

const AnimatedPath = Animated.createAnimatedComponent(Path);
export const AnimatedMenuHeartIcon = forwardRef<any, AnimatedProps<{ animatedProps: any }>>((props, ref) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <AnimatedPath
        d="M21.2499 9.63531C21.24 7.09945 19.9096 4.71464 17.2866 3.86966C15.4855 3.28845 13.5236 3.61167 12 5.79914C10.4764 3.61167 8.51447 3.28845 6.71339 3.86966C4.09014 4.71474 2.75971 7.09999 2.75008 9.63618C2.72582 14.6799 7.83662 18.5394 11.9987 20.3842L12 20.3836L12.0013 20.3842C16.1636 18.5393 21.2748 14.6794 21.2499 9.63531Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="square"
        {...props}
      />
      <AnimatedPath
        d="M15.7442 11.29C14.974 12.6129 13.6043 13.683 12.0205 13.6556C10.4368 13.683 9.06708 12.6129 8.29688 11.29"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </Svg>
  );
});

export const AnimatedHeartIcon = forwardRef<any, AnimatedProps<{ animatedProps: any }>>((props, ref) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <AnimatedPath
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.8376 3C15.331 2.99873 13.8874 3.60428 12.8326 4.68L12.0001 5.52L11.1676 4.68C10.1115 3.60629 8.66859 3.00157 7.16258 3.00157C5.65656 3.00157 4.21361 3.60629 3.15758 4.68C0.944871 6.9325 0.944871 10.5425 3.15758 12.795L12.0001 21.75L20.8426 12.795C23.0553 10.5425 23.0553 6.9325 20.8426 4.68C19.7868 3.60571 18.3438 3.00042 16.8376 3Z"
        stroke="#868B88"
        {...props}
      />
    </Svg>
  );
});

AnimatedMenuHeartIcon.displayName = 'AnimatedMenuHeartIcon';
AnimatedHeartIcon.displayName = 'AnimatedHeartIcon';
