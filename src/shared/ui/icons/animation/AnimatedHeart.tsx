import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import Animated, { interpolateColor, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'tamagui';

export interface AnimatedHeartProps extends Omit<SvgProps, 'onPress'> {
  isLiked?: boolean;
  onPress?: (liked: boolean) => void;
  size?: number;
  disabled?: boolean;
  loading?: boolean;
}

const LikeHeart = Animated.createAnimatedComponent(Path);

export const AnimatedHeart = ({
  isLiked = false,
  onPress,
  size = 22,
  disabled = true,
  loading = false,
  ...props
}: AnimatedHeartProps) => {
  const [liked, setLiked] = useState(isLiked);
  const { primaryMain, white600 } = useTheme();

  const fillProgress = useSharedValue(liked ? 1 : 0);

  useEffect(() => {
    fillProgress.value = withTiming(liked ? 1 : 0, { duration: 200 });
  }, [liked, fillProgress]);

  const handlePress = async () => {
    if (disabled || loading) {
      onPress?.(liked);
      return;
    }

    const newLiked = !liked;
    if (newLiked) await impactAsync(ImpactFeedbackStyle.Medium);

    setLiked(newLiked);
    onPress?.(newLiked);
  };

  const animatedPathProps = useAnimatedProps(() => {
    const stroke = interpolateColor(fillProgress.value, [0, 1], [white600.val, primaryMain.val]);
    const fill = interpolateColor(fillProgress.value, [0, 1], ['transparent', primaryMain.val]);

    return { fill, stroke };
  });

  return (
    <Pressable onPress={handlePress} hitSlop={8}>
      <Svg width={size} height={size} viewBox="0 0 22 20" fill="none" {...props}>
        <LikeHeart
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.8376 1C14.331 0.998725 12.8874 1.60428 11.8326 2.68V2.68C11.374 3.1427 10.6261 3.1427 10.1676 2.68V2.68C9.11154 1.60629 7.66859 1.00157 6.16258 1.00157C4.65656 1.00157 3.21361 1.60629 2.15758 2.68C-0.0551292 4.9325 -0.0551292 8.5425 2.15758 10.795L9.57695 18.3088C10.36 19.1018 11.6402 19.1018 12.4232 18.3088L19.8426 10.795C22.0553 8.5425 22.0553 4.9325 19.8426 2.68C18.7868 1.60571 17.3438 1.00042 15.8376 1Z"
          strokeWidth={1.5}
          animatedProps={animatedPathProps}
        />
      </Svg>
    </Pressable>
  );
};
