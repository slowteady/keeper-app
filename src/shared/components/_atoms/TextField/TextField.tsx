import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { GetProps, Input, styled, Text, TextArea, useTheme, XStack } from 'tamagui';

import { CircleX } from '../icons/outline';

export interface TextFieldProps extends GetProps<typeof CustomTextField> {
  mode?: 'single' | 'multiple';
  helperText?: React.ReactNode;
  status?: 'default' | 'error' | 'success';
  onPress?: () => void;
  onPressReset?: () => void;
}

export const TextField = ({
  helperText,
  mode = 'single',
  status = 'default',
  variant = 'default',
  size,
  value = '',
  onChangeText,
  onPress,
  onPressReset,
  disabled,
  ...props
}: TextFieldProps) => {
  const closeButtonOpacity = useSharedValue(0);
  const { black500 } = useTheme();

  useEffect(() => {
    closeButtonOpacity.value = value?.length > 0 ? 1 : 0;
  }, [closeButtonOpacity, value]);

  const animatedCloseButtonStyle = useAnimatedStyle(() => ({
    opacity: withTiming(closeButtonOpacity.value, { duration: 200 }),
    transform: [{ scale: withTiming(closeButtonOpacity.value, { duration: 200 }) }]
  }));

  if (mode === 'multiple') {
    return (
      <Container variant={variant}>
        <TextArea size={size} value={value} onChangeText={onChangeText} {...props} />
      </Container>
    );
  }

  return (
    <>
      <Container variant={variant} onPress={disabled ? onPress : undefined}>
        <CustomTextField
          variant={variant}
          size={size}
          value={value}
          onChangeText={onChangeText}
          pointerEvents={disabled ? 'none' : 'auto'}
          {...props}
        />

        <Animated.View style={[animatedCloseButtonStyle]}>
          <Pressable onPress={onPressReset} style={{ paddingHorizontal: 16 }}>
            <CircleX width={16} height={16} color={black500.val} />
          </Pressable>
        </Animated.View>
      </Container>

      {helperText && typeof helperText === 'string' ? (
        <HelperText size={size as any} status={status}>
          {helperText}
        </HelperText>
      ) : (
        helperText
      )}
    </>
  );
};

const Container = styled(XStack, {
  items: 'center',
  justify: 'space-between',
  rounded: '$3',
  flex: 1,
  variants: {
    variant: {
      default: {
        bg: '$white900'
      },
      fill: {
        bg: '$backgroundDefault'
      }
    }
  } as const,
  defaultVariants: {
    variant: 'default'
  }
});
const CustomTextField = styled(Input, {
  flex: 1,
  bg: 'transparent',
  variants: { variant: { default: { borderWidth: 0 }, fill: { borderWidth: 0 } } } as const,
  defaultVariants: { variant: 'default' }
});
const HelperText = styled(Text, {
  variants: {
    status: {
      default: {
        color: '$black500'
      },
      error: {
        color: '$errorMain'
      },
      success: {
        color: '$primaryDark'
      }
    },
    size: {
      $4: {
        fontSize: 14,
        lineHeight: 16,
        fontWeight: '$4',
        mt: '$3'
      }
    }
  } as const,
  defaultVariants: {
    size: '$4'
  }
});
