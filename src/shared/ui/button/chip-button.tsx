import { useCallback, useState } from 'react';
import { GestureResponderEvent, Pressable, PressableProps, ViewStyle } from 'react-native';
import { ButtonProps, getTokens, Text, XStack } from 'tamagui';

type ChipButtonSize = 'small' | 'medium' | 'large';

export interface ChipButtonProps extends PressableProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: ChipButtonSize;
  selected?: boolean;
  isPressable?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export const ChipButton = ({
  children,
  variant = 'primary',
  size = 'small',
  selected,
  isPressable = false,
  left,
  right,
  onPress,
  ...props
}: ChipButtonProps) => {
  const [innerSelected, setInnerSelected] = useState(false);

  const handlePress: ButtonProps['onPress'] = useCallback(
    (e: GestureResponderEvent) => {
      if (isPressable && selected === undefined) {
        setInnerSelected((p) => !p);
      }
      onPress?.(e);
    },
    [isPressable, onPress, selected]
  );

  const isSelected = selected ?? innerSelected;
  const isText = typeof children === 'string';
  const styles = getChipStyles(variant, size, isSelected);

  return (
    <Pressable
      {...props}
      onPress={handlePress}
      style={[styles.button, { borderColor: styles.borderColor, backgroundColor: styles.backgroundColor }]}
    >
      <XStack items="center">
        {left && left}
        {isText ? <Text style={[styles.text, { color: styles.color }]}>{children}</Text> : children}
        {right && right}
      </XStack>
    </Pressable>
  );
};

const getChipStyles = (variant: 'primary' | 'secondary', size: ChipButtonSize, isSelected: boolean) => {
  const colors = getTokens().color;

  const baseButton: ViewStyle = {
    borderRadius: 44,
    borderWidth: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const sizeStyles = {
    small: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      fontSize: 14,
      lineHeight: 16,
      fontWeight: '600',
      minWidth: 54
    },
    medium: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      fontSize: 15,
      lineHeight: 17,
      fontWeight: '500'
    },
    large: {
      paddingVertical: 12,
      paddingHorizontal: 18,
      fontSize: 16,
      lineHeight: 18,
      fontWeight: '500'
    }
  };

  const variantStyles = {
    primary: {
      backgroundColor: isSelected ? `#E4FFF0` : 'transparent',
      borderColor: isSelected ? colors.primaryMain.val : colors.white600.val,
      color: isSelected ? colors.primaryMain.val : colors.black500.val
    },
    secondary: {
      backgroundColor: isSelected ? colors.blackMain.val : 'transparent',
      borderColor: isSelected ? colors.blackMain.val : colors.white600.val,
      color: isSelected ? colors.white900.val : colors.black500.val
    }
  };

  return {
    button: {
      ...baseButton,
      ...sizeStyles[size]
    },
    text: {
      fontSize: sizeStyles[size].fontSize,
      lineHeight: sizeStyles[size].lineHeight,
      fontWeight: sizeStyles[size].fontWeight
    },
    ...variantStyles[variant]
  };
};
