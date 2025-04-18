import theme from '@/constants/theme';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleProp, StyleSheet, TextStyle, View, ViewProps } from 'react-native';
import Animated, {
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

export interface ToggleCompleteProps<T> {
  items: ToggleItemsProps<T>['items'];
  value: T;
  onChange: (value: T) => void;
  size?: ToggleSize;
}
export type ToggleSize = 'small';

export const Toggle = <T,>({ items, value, onChange, size = 'small' }: ToggleCompleteProps<T>) => {
  const [buttonWidth, setButtonWidth] = useState(0);
  const interval = size === 'small' ? 6 : 0;
  const translateX = useSharedValue(interval);
  const duration = 200;

  const buttonRefs = useRef<(View | null)[]>([]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const values = useRef(items.map(({ value: itemValue }) => useSharedValue(itemValue === value ? 1 : 0))).current;

  useEffect(() => {
    requestAnimationFrame(() => {
      Promise.all(
        buttonRefs.current.map(
          (ref) =>
            new Promise<number>((resolve) => {
              ref?.measure((_, __, width) => resolve(width));
            })
        )
      ).then((widths) => {
        setButtonWidth(Math.max(...widths));
      });
    });
  }, [items]);

  useEffect(() => {
    items.forEach(({ value: itemValue }, idx) => {
      const isSelected = itemValue === value;
      values[idx].value = withTiming(isSelected ? 1 : 0, { duration });

      if (isSelected) {
        const selectedButton = buttonRefs.current[idx];
        if (selectedButton) {
          selectedButton.measure((left) => {
            translateX.value = withTiming(left > interval ? left : interval, {
              duration
            });
          });
        }
      }
    });
  }, [items, value, duration, values, translateX, interval]);

  const handleChangeValue = useCallback(
    (selectedValue: T) => {
      onChange(selectedValue);
    },
    [onChange]
  );

  return (
    <View style={styles.container}>
      <Effect buttonWidth={buttonWidth} translateX={translateX} interval={interval} />
      <Items
        items={items}
        values={values}
        buttonWidth={buttonWidth}
        setRefs={(el, idx) => (buttonRefs.current[idx] = el)}
        onPress={handleChangeValue}
      />
    </View>
  );
};

export interface ToggleEffectProps {
  buttonWidth: number;
  interval: number;
  translateX: SharedValue<number>;
}
const Effect = memo(({ interval, buttonWidth, translateX }: ToggleEffectProps) => {
  const width = buttonWidth - interval;
  const transform = [{ translateX }];

  return (
    <View style={[styles.effectContainer, { paddingVertical: interval }]}>
      <Animated.View style={[styles.effect, { width, transform }]} />
    </View>
  );
});

export interface ToggleItemsProps<T> extends ViewProps {
  items: readonly ToggleItem<T>[];
  values: SharedValue<number>[];
  setRefs: (element: View | null, idx: number) => void;
  onPress: (value: T, idx: number) => void;
  buttonWidth: number;
  TextStyle?: StyleProp<TextStyle>;
}
export interface ToggleItem<T> {
  value: T;
  label: string;
}
const Items = <T,>({ items, values, setRefs, onPress, buttonWidth, TextStyle = {}, ...props }: ToggleItemsProps<T>) => {
  return items.map(({ label, value }, idx) => {
    const item = values[idx];
    if (!item) return null;

    return (
      <Pressable
        key={idx}
        ref={(el) => setRefs(el, idx)}
        onPress={() => onPress(value, idx)}
        style={[styles.pressable, { minWidth: buttonWidth > 0 ? buttonWidth : undefined }]}
        {...props}
      >
        <Text item={item} label={label} />
      </Pressable>
    );
  });
};

interface ToggleTextProps {
  item: SharedValue<number>;
  label: string;
}
const Text = ({ item, label }: ToggleTextProps) => {
  const textStyle = useAnimatedStyle(() => {
    const color = interpolateColor(item.value, [0, 1], [theme.colors.black[500], theme.colors.black[900]]);

    return { color };
  }, [item]);

  return <Animated.Text style={[textStyle, styles.text]}>{label}</Animated.Text>;
};

const { white } = theme.colors;
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: white[800],
    borderRadius: 40
  },
  effectContainer: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  },
  effect: {
    backgroundColor: white[900],
    borderRadius: 40,
    height: '100%'
  },
  pressable: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  text: {
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 16
  }
});

Effect.displayName = 'ToggleEffect';
