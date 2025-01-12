import { forwardRef } from 'react';
import Animated, { AnimatedProps } from 'react-native-reanimated';
import Svg, { Path, SvgProps } from 'react-native-svg';

export const ChatIcon = ({ ...props }: SvgProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.5481 18.5229C16.693 20.3781 14.2512 21.2765 11.8247 21.2241C8.5295 21.1528 2.75 21.2046 2.75 21.2046C2.75 21.2046 2.80068 15.3573 2.79819 12.0048C2.79644 9.64231 3.69595 7.28029 5.50162 5.47503C9.10096 1.87436 14.9487 1.87436 18.5481 5.4741C22.1539 9.08033 22.1474 14.9232 18.5481 18.5229Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path d="M8.31553 12.3804H8.21679" stroke="black" strokeWidth="1.5" strokeLinecap="square" />
      <Path d="M12.0499 12.3814H11.9512" stroke="black" strokeWidth="1.5" strokeLinecap="square" />
      <Path d="M15.7843 12.3804H15.6855" stroke="black" strokeWidth="1.5" strokeLinecap="square" />
    </Svg>
  );
};

const AnimatedPath = Animated.createAnimatedComponent(Path);
export const AnimatedChatIcon = forwardRef<any, AnimatedProps<{ animatedProps: any }>>((props, ref) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <AnimatedPath
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.5481 18.5229C16.693 20.3781 14.2512 21.2765 11.8247 21.2241C8.5295 21.1528 2.75 21.2046 2.75 21.2046C2.75 21.2046 2.80068 15.3573 2.79819 12.0048C2.79644 9.64231 3.69595 7.28029 5.50162 5.47503C9.10096 1.87436 14.9487 1.87436 18.5481 5.4741C22.1539 9.08033 22.1474 14.9232 18.5481 18.5229Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        {...props}
      />
      <AnimatedPath d="M8.31553 12.3804H8.21679" stroke="black" strokeWidth="1.5" strokeLinecap="square" />
      <AnimatedPath d="M12.0499 12.3814H11.9512" stroke="black" strokeWidth="1.5" strokeLinecap="square" />
      <AnimatedPath d="M15.7843 12.3804H15.6855" stroke="black" strokeWidth="1.5" strokeLinecap="square" />
    </Svg>
  );
});

AnimatedChatIcon.displayName = 'AnimatedChatIcon';
