import Button from '@/components/atoms/button/Button';
import theme from '@/constants/theme';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export interface ButtonGroupData<T> {
  label: string;
  id: T;
}
export interface ButtonGroupProps<T> {
  data: ButtonGroupData<T>[];
  id: T;
  onChange: (id: T) => void;
}

const ButtonGroup = <T,>({ data, id, onChange }: ButtonGroupProps<T>) => {
  return (
    <View style={styles.container}>
      {data.map((item, idx) => {
        const key = `${String(item.id)}-${idx}`;
        const isSelected = item.id === id;

        return (
          <AnimatedButton key={key} label={item.label} isSelected={isSelected} onPress={() => onChange(item.id)} />
        );
      })}
    </View>
  );
};

export default ButtonGroup;

interface AnimatedButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}
const AnimatedButton = ({ label, isSelected, onPress }: AnimatedButtonProps) => {
  const progress = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isSelected ? 1 : 0, { duration: 100 });
  }, [isSelected, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(progress.value, [0, 1], ['transparent', theme.colors.black[900]])
    };
  });
  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(progress.value, [0, 1], [theme.colors.black[600], theme.colors.white[900]])
    };
  });

  return (
    <Button onPress={onPress} style={styles.button}>
      <Animated.View
        style={[
          styles.buttonInner,
          ,
          { borderColor: isSelected ? 'transparent' : theme.colors.white[600] },
          animatedStyle
        ]}
      >
        <Animated.Text style={[styles.label, animatedTextStyle]}>{label}</Animated.Text>
      </Animated.View>
    </Button>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    gap: 4
  },
  button: {
    flex: 1
  },
  buttonInner: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    paddingVertical: 11,
    borderWidth: 1
  },
  label: {
    fontSize: 14,
    lineHeight: 15,
    fontWeight: '500',
    color: theme.colors.white[900]
  }
});
