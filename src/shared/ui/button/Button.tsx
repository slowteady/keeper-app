import { useMemo } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Spinner, Text, useTheme } from 'tamagui';

export const BUTTON_HEIGHT = {
  small: 44,
  medium: 55,
  large: 60
};

export interface ButtonProps extends PressableProps {
  variant?: 'default' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary';
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
  variant: 'default' | 'ghost',
  theme: any,
  size: 'small' | 'medium' | 'large',
  color: 'primary' | 'secondary',
  disabled: boolean
) => {
  const sizes = {
    small: { height: BUTTON_HEIGHT.small },
    medium: { height: BUTTON_HEIGHT.medium },
    large: { height: BUTTON_HEIGHT.large }
  };

  const getColorStyles = (variant: 'default' | 'ghost', color: 'primary' | 'secondary', disabled: boolean) => {
    if (variant === 'ghost') {
      return {
        backgroundColor: 'transparent'
      };
    }

    if (disabled) {
      return {
        backgroundColor: theme.white800.val
      };
    }

    switch (color) {
      case 'primary':
        return {
          backgroundColor: theme.primaryMain.val
        };
      case 'secondary':
        return {
          backgroundColor: theme.blackMain.val
        };
      default:
        return {
          backgroundColor: theme.primaryMain.val
        };
    }
  };

  const getTextStyles = (variant: 'default' | 'ghost', color: 'primary' | 'secondary', disabled: boolean) => {
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
    }

    if (disabled) {
      return {
        color: theme.black500.val
      };
    }

    switch (color) {
      case 'primary':
        return {
          color: theme.black900.val
        };
      case 'secondary':
        return {
          color: theme.white900.val
        };
      default:
        return {
          color: theme.black900.val
        };
    }
  };

  return StyleSheet.create({
    button: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      overflow: 'hidden',
      ...(variant === 'ghost' ? {} : sizes[size]),
      ...getColorStyles(variant, color, disabled)
    },
    text: {
      fontWeight: '600',
      fontSize: 15,
      ...getTextStyles(variant, color, disabled)
    }
  });
};
