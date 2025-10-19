import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { GetProps, Input, styled, Text, useTheme, XStack } from 'tamagui';

import { CircleX } from '../icons/outline';

export interface TextFieldProps extends GetProps<typeof CustomTextField> {
  helperText?: React.ReactNode;
  status?: 'default' | 'error' | 'success';
  onPress?: () => void;
  onPressReset?: () => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export const TextField = ({
  helperText,
  status = 'default',
  variant = 'default',
  size = '$4',
  value = '',
  onChangeText,
  onPress,
  onPressReset,
  disabled,
  left,
  right,
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

  return (
    <>
      <Container variant={variant} onPress={disabled ? onPress : undefined}>
        {left && <LeftElementWrapper>{left}</LeftElementWrapper>}

        <CustomTextField
          variant={variant}
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

        {right && <RightElementWrapper>{right}</RightElementWrapper>}
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
  placeholderTextColor: '$black500',
  fontSize: 15,
  fontWeight: '$4',
  variants: {
    variant: { default: { borderWidth: 0 }, fill: { borderWidth: 0 } }
  } as const,
  defaultVariants: { variant: 'default' }
});
const LeftElementWrapper = styled(XStack, {
  items: 'center',
  pl: '$4',
  gap: '$2'
});
const RightElementWrapper = styled(XStack, {
  items: 'center',
  pr: '$4',
  gap: '$2'
});
const HelperText = styled(Text, {
  letterSpacing: -0.25,
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
