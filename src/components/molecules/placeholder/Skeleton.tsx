import theme from '@/constants/theme';
import { useEffect } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

interface SkeletonProps {
  style?: StyleProp<ViewStyle>;
}

export const Skeleton = ({ style }: SkeletonProps) => {
  const animatedValue = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedValue.value, [0, 1], [0.2, 1]);
    return { opacity };
  });

  useEffect(() => {
    animatedValue.value = withRepeat(withTiming(1, { duration: 1500 }), -1, true);
  }, [animatedValue]);

  return <Animated.View style={[styles.container, animatedStyle, style]} />;
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: theme.colors.white[700]
  }
});
