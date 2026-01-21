import { useMemo } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Spinner, Text, useTheme } from 'tamagui';

export const BUTTON_HEIGHT = {
  small: 48,
  medium: 55,
  large: 60
};

export interface ButtonProps extends PressableProps {
  variant?: 'default' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'tertiary';
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

  const styles = useMemo(
    () => getStyles(variant, theme, size, color, disabled!),
    [color, size, theme, disabled, variant]
  );

  return (
    <Pressable disabled={disabled} style={[styles.button, style]} {...props}>
      {isLoading ? (
        <Spinner size="small" color="$primaryDark" />
      ) : typeof children === 'string' ? (
        <Text style={styles.text}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
};

const getStyles = (
  variant: ButtonProps['variant'],
  theme: any,
  size: ButtonProps['size'],
  color: ButtonProps['color'],
  disabled: ButtonProps['disabled']
) => {
  const sizes = {
    small: { minHeight: BUTTON_HEIGHT.small },
    medium: { minHeight: BUTTON_HEIGHT.medium },
    large: { minHeight: BUTTON_HEIGHT.large }
  };

  const getColorStyles = (
    variant: ButtonProps['variant'],
    color: ButtonProps['color'],
    disabled: ButtonProps['disabled']
  ) => {
    if (variant === 'ghost') {
      return {
        backgroundColor: 'transparent'
      };
    }

    switch (color) {
      case 'primary':
        return {
          backgroundColor: disabled ? theme.white800.val : theme.primaryMain.val
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? theme.white800.val : theme.blackMain.val
        };
      case 'tertiary':
        return {
          backgroundColor: disabled ? theme.backgroundDefault.val : theme.white800.val
        };
      default:
        return {
          backgroundColor: theme.primaryMain.val
        };
    }
  };

  const getTextStyles = (
    variant: ButtonProps['variant'],
    color: ButtonProps['color'],
    disabled: ButtonProps['disabled']
  ) => {
    if (variant === 'ghost') {
      if (disabled) {
        return {
          color: theme.black500.val
        };
      }

      switch (color) {
        case 'primary':
          return {
            color: theme.primaryMain.val
          };
        case 'secondary':
          return {
            color: theme.blackMain.val
          };
        default:
          return {
            color: theme.primaryMain.val
          };
      }
    } else if (variant === 'default') {
      switch (color) {
        case 'primary':
          return {
            color: disabled ? theme.black500.val : theme.black900.val
          };
        case 'secondary':
          return {
            color: disabled ? theme.black500.val : theme.white900.val
          };
        case 'tertiary':
          return {
            color: disabled ? theme.white600.val : theme.black900.val
          };
        default:
          return {
            color: theme.black900.val
          };
      }
    }
  };

  return StyleSheet.create({
    button: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      overflow: 'hidden',
      ...(variant === 'ghost' ? {} : sizes[size!]),
      ...getColorStyles(variant!, color!, disabled!)
    },
    text: {
      fontWeight: '600',
      fontSize: 15,
      ...getTextStyles(variant, color, disabled)
    }
  });
};
