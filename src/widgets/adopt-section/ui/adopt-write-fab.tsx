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

export type AdoptWriteFabProps = {
  onPress: () => void;
  scrollY: SharedValue<number>;
};

const COLLAPSE_THRESHOLD = 24;
const LABEL_GAP = 6;

export const AdoptWriteFab = ({ onPress, scrollY }: AdoptWriteFabProps) => {
  const { primaryMain } = useTheme();
  const [labelWidth, setLabelWidth] = useState<number | null>(null);

  const progress = useDerivedValue(() => withTiming(scrollY.value > COLLAPSE_THRESHOLD ? 0 : 1, { duration: 200 }));

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
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={[styles.button, { backgroundColor: primaryMain.val }]}
      accessibilityRole="button"
      accessibilityLabel="개인 공고 올리기"
      testID="adopt-write-fab"
    >
      <Plus size={22} color="white" />
      <Animated.View style={[styles.label, labelStyle]} onLayout={labelWidth == null ? handleLabelLayout : undefined}>
        <Text fontSize={15} lineHeight={18} fontWeight={600} color="#fff" numberOfLines={1}>
          공고 올리기
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 18,
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
