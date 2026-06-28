import { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { ScrollButton } from '@/shared/ui/icons/etc';

export type ScrollToTopButtonProps = {
  scrollY: SharedValue<number>;
  onPress: () => void;
  threshold?: number;
  bottom?: number;
};

const DEFAULT_THRESHOLD = 600;
const SIZE = 54;

export const ScrollToTopButton = ({
  scrollY,
  onPress,
  threshold = DEFAULT_THRESHOLD,
  bottom = 24
}: ScrollToTopButtonProps) => {
  const style = useAnimatedStyle(() => {
    const visible = scrollY.value > threshold ? 1 : 0;
    return {
      opacity: withTiming(visible, { duration: 200 }),
      transform: [{ scale: withTiming(0.92 + visible * 0.08, { duration: 200 }) }]
    };
  });

  const handlePress = useCallback(() => {
    if (scrollY.value <= threshold) return;
    onPress();
  }, [scrollY, threshold, onPress]);

  return (
    <Animated.View style={[styles.container, { bottom }, style]}>
      <Pressable
        onPress={handlePress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="맨 위로"
        testID="scroll-to-top"
      >
        <ScrollButton width={SIZE} height={SIZE} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6
  }
});
