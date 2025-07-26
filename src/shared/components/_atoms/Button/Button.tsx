import { useMemo } from 'react';
import { Pressable, PressableProps, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SizableText, Spinner, styled, useTheme } from 'tamagui';

export interface ButtonProps extends PressableProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary';
  isLoading?: boolean;
}

const AnimatedButton = Animated.createAnimatedComponent(Pressable);

export const Button = ({
  size = 'medium',
  children,
  disabled = false,
  color = 'primary',
  isLoading = false,
  ...props
}: ButtonProps) => {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const styles = useMemo(() => getStyles(theme, size, color), [color, size, theme]);

  return (
    <AnimatedButton
      onPressIn={() => {
        scale.value = withTiming(0.95, { duration: 100 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 100 });
      }}
      disabled={disabled}
      style={[styles[color], animatedStyle, disabled && { backgroundColor: theme.white600.val }]}
      {...props}
    >
      {isLoading ? (
        <Spinner size="small" color="$primaryDark" />
      ) : typeof children === 'string' ? (
        <CustomText disabled={disabled!}>{children}</CustomText>
      ) : (
        children
      )}
    </AnimatedButton>
  );
};

const getStyles = (theme: any, size: 'small' | 'medium' | 'large', color: 'primary') => {
  const sizes = {
    small: {
      height: 40
    },
    medium: {
      height: 55
    },
    large: {
      height: 60
    }
  };

  const colors = {
    primary: {
      backgroundColor: theme.primaryMain.val
    }
  };

  return StyleSheet.create({
    primary: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: colors[color].backgroundColor,
      ...sizes[size]
    }
  });
};

const CustomText = styled(SizableText, {
  fontWeight: '$6',
  variants: {
    size: { $5: { fontSize: 15 } },
    disabled: { true: { color: '$black500' }, false: { color: '$black900' } }
  } as const,
  defaultVariants: {
    disabled: false
  }
});
