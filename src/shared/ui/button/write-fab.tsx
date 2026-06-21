import { Plus } from '@tamagui/lucide-icons';
import { useCallback, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withTiming
} from 'react-native-reanimated';
import { Text, useTheme } from 'tamagui';

export type WriteFabProps = {
  label: string;
  onPress: () => void;
  scrollY: SharedValue<number>;
  accessibilityLabel?: string;
  testID?: string;
};

const COLLAPSE_THRESHOLD = 24;
const LABEL_GAP = 6;
const ICON_SIZE = 20;
const EXPANDED_HEIGHT = 46;
const COLLAPSED_SIZE = 44;
const EXPANDED_PAD = 16;
const COLLAPSED_PAD = (COLLAPSED_SIZE - ICON_SIZE) / 2;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const WriteFab = ({ label, onPress, scrollY, accessibilityLabel, testID }: WriteFabProps) => {
  const { primaryMain } = useTheme();
  const [labelWidth, setLabelWidth] = useState<number | null>(null);

  const progress = useDerivedValue(() => withTiming(scrollY.value > COLLAPSE_THRESHOLD ? 0 : 1, { duration: 200 }));

  const containerStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [COLLAPSED_SIZE, EXPANDED_HEIGHT]),
    borderRadius: interpolate(progress.value, [0, 1], [COLLAPSED_SIZE / 2, EXPANDED_HEIGHT / 2]),
    paddingHorizontal: interpolate(progress.value, [0, 1], [COLLAPSED_PAD, EXPANDED_PAD])
  }));

  const labelStyle = useAnimatedStyle(() => ({
    width: labelWidth == null ? undefined : interpolate(progress.value, [0, 1], [0, labelWidth]),
    marginLeft: interpolate(progress.value, [0, 1], [0, LABEL_GAP]),
    opacity: progress.value
  }));

  const handleLabelLayout = useCallback((e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    setLabelWidth((prev) => (prev == null ? width : prev));
  }, []);

  return (
    <AnimatedPressable
      onPress={onPress}
      hitSlop={6}
      style={[styles.button, { backgroundColor: primaryMain.val }, containerStyle]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      testID={testID}
    >
      <Plus size={ICON_SIZE} color="white" />
      <Animated.View style={[styles.label, labelStyle]} onLayout={labelWidth == null ? handleLabelLayout : undefined}>
        <Text fontSize={14} lineHeight={16} fontWeight={600} color="#fff" numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6
  },
  label: {
    overflow: 'hidden'
  }
});
