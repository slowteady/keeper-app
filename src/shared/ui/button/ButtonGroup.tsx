import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { styled, useTheme, XStack } from 'tamagui';

export interface ButtonGroupProps<T> {
  id: T;
  data: ButtonGroupData<T>[];
  onChange: (id: T) => void;
}

export interface ButtonGroupData<T> {
  id: T;
  label: string;
}

export const ButtonGroup = <T,>({ data, id, onChange }: ButtonGroupProps<T>) => {
  return (
    <Container>
      {data.map((item, idx) => {
        const key = `${item.id}-${idx}`;
        const isSelected = item.id === id;

        return <Button key={key} label={item.label} isSelected={isSelected} onPress={() => onChange(item.id)} />;
      })}
    </Container>
  );
};

interface ButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}
const Button = ({ isSelected, label, onPress }: ButtonProps) => {
  const { black600, black900, white600, white900 } = useTheme();
  const progress = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isSelected ? 1 : 0, { duration: 100 });
  }, [isSelected, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(progress.value, [0, 1], ['transparent', black900.val])
    };
  });
  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(progress.value, [0, 1], [black600.val, white900.val])
    };
  });

  return (
    <Pressable style={{ flex: 1 }} onPress={onPress}>
      <Animated.View style={[styles.button, { borderColor: isSelected ? 'transparent' : white600.val }, animatedStyle]}>
        <Animated.Text style={[styles.label, { color: white900.val }, animatedTextStyle]}>{label}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

const Container = styled(XStack, {
  gap: 4
});

const styles = StyleSheet.create({
  button: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 11,
    borderWidth: 1
  },
  label: {
    fontSize: 14,
    lineHeight: 15,
    fontWeight: '600'
  }
});
