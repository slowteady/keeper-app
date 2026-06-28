import { useMemo } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import { Spinner, Text, useTheme } from 'tamagui';

type Variant = 'default' | 'ghost';
type Size = 'small' | 'medium' | 'large';
type Color = 'primary' | 'secondary' | 'tertiary' | 'destructive';

export const BUTTON_HEIGHT: Record<Size, number> = {
  small: 48,
  medium: 55,
  large: 60
};

export interface ButtonProps extends PressableProps {
  variant?: Variant;
  size?: Size;
  color?: Color;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Button = ({
  variant = 'default',
  size = 'medium',
  children,
  disabled = false,
  color = 'primary',
  isLoading = false,
  style,
  ...props
}: ButtonProps) => {
  const theme = useTheme();

  const { buttonStyle, textStyle } = useMemo(() => {
    const isDisabled = !!disabled;
    const bg = getBackgroundColor(variant, color, isDisabled, theme);
    const fg = getTextColor(variant, color, isDisabled, theme);

    return {
      buttonStyle: {
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        borderRadius: 10,
        overflow: 'hidden' as const,
        backgroundColor: bg,
        ...(variant === 'ghost' ? {} : { minHeight: BUTTON_HEIGHT[size] })
      },
      textStyle: {
        fontWeight: '600' as const,
        fontSize: 15,
        color: fg
      }
    };
  }, [variant, size, color, disabled, theme]);

  return (
    <Pressable disabled={disabled} style={[buttonStyle, style]} {...props}>
      {isLoading ? (
        <Spinner size="small" color="$primaryDark" />
      ) : typeof children === 'string' ? (
        <Text style={textStyle}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
};

const getBackgroundColor = (variant: Variant, color: Color, disabled: boolean, theme: ReturnType<typeof useTheme>) => {
  if (variant === 'ghost') return 'transparent';

  const map = {
    primary: disabled ? theme.white800.val : theme.primaryMain.val,
    secondary: disabled ? theme.white800.val : theme.blackMain.val,
    tertiary: disabled ? theme.backgroundDefault.val : theme.white800.val,
    destructive: disabled ? theme.white800.val : theme.errorMain.val
  };

  return map[color];
};

const getTextColor = (variant: Variant, color: Color, disabled: boolean, theme: ReturnType<typeof useTheme>) => {
  if (variant === 'ghost') {
    if (disabled) return theme.black500.val;
    return color === 'secondary' ? theme.blackMain.val : theme.primaryMain.val;
  }

  const map = {
    primary: disabled ? theme.black500.val : theme.black900.val,
    secondary: disabled ? theme.black500.val : theme.white900.val,
    tertiary: disabled ? theme.white600.val : theme.black900.val,
    destructive: disabled ? theme.black500.val : theme.white900.val
  };

  return map[color];
};
