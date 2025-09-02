import { useCallback, useState } from 'react';
import { GestureResponderEvent, Pressable, PressableProps, StyleSheet } from 'react-native';
import { ButtonProps, Text, useTheme, XStack } from 'tamagui';

type ChipButtonSize = 'small' | 'medium' | 'large';
export interface ChipButtonProps extends PressableProps {
  children: React.ReactNode;
  size?: ChipButtonSize;
  selected?: boolean;
  defaultSelected?: boolean;
  toggleOnPress?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
}
export const ChipButton = ({
  children,
  size = 'small',
  selected,
  defaultSelected = false,
  toggleOnPress = false,
  left,
  right,
  onPress,
  ...props
}: ChipButtonProps) => {
  const [innerSelected, setInnerSelected] = useState(defaultSelected);
  const { primaryMain, white600, black600 } = useTheme();

  const handlePress: ButtonProps['onPress'] = useCallback(
    (e: GestureResponderEvent) => {
      if (toggleOnPress && selected === undefined) {
        setInnerSelected((p) => !p);
      }
      onPress?.(e);
    },
    [onPress, selected, toggleOnPress]
  );

  const isSelected = selected ?? innerSelected;
  const backgroundColor = isSelected ? `${primaryMain.val} + 30` : 'transparent';
  const borderColor = isSelected ? primaryMain.val : white600.val;
  const color = isSelected ? primaryMain.val : black600.val;

  const isText = typeof children === 'string';

  const { text, button } = STYLE[size];

  return (
    <Pressable {...props} onPress={handlePress} style={[styles.button, button, { borderColor, backgroundColor }]}>
      <XStack items="center">
        {left && left}
        {isText ? <Text style={[{ color }, text]}>{children}</Text> : children}
        {right && right}
      </XStack>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 44,
    borderWidth: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const STYLE = {
  small: {
    button: {
      paddingVertical: 8,
      paddingHorizontal: 14
    },
    text: {
      fontSize: 14,
      lineHeight: 16,
      fontWeight: '400'
    }
  },
  medium: {
    button: {},
    text: {
      fontSize: 15,
      lineHeight: 17
    }
  },
  large: {
    button: {},
    text: {
      fontSize: 16,
      lineHeight: 18
    }
  }
};
