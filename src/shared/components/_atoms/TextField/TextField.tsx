import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { GetProps, Input, styled, Text, useTheme, XStack } from 'tamagui';

import { CircleX } from '@/components/atoms/icons/outline';

export interface TextFieldProps extends GetProps<typeof CustomTextField> {
  helperText?: React.ReactNode;
  status?: 'default' | 'error' | 'success';
}

export const TextField = ({
  helperText,
  status = 'default',
  size,
  value = '',
  onChangeText,
  ...props
}: TextFieldProps) => {
  const closeButtonOpacity = useSharedValue(0);
  const { black500 } = useTheme();

  const handlePressReset = () => {
    onChangeText?.('');
  };

  useEffect(() => {
    closeButtonOpacity.value = value?.length > 0 ? 1 : 0;
  }, [closeButtonOpacity, value]);

  const animatedCloseButtonStyle = useAnimatedStyle(() => ({
    opacity: withTiming(closeButtonOpacity.value, { duration: 200 }),
    transform: [{ scale: withTiming(closeButtonOpacity.value, { duration: 200 }) }]
  }));

  return (
    <>
      <Container>
        <CustomTextField size={size} value={value} onChangeText={onChangeText} {...props} />
        <Animated.View style={[animatedCloseButtonStyle]}>
          <Pressable onPress={handlePressReset} style={{ paddingHorizontal: 16 }}>
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
  bg: '$white900',
  rounded: '$3'
});
const CustomTextField = styled(Input, {
  flex: 1,
  bg: 'transparent',
  variants: { variant: { default: { borderWidth: 0 } } } as const,
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
