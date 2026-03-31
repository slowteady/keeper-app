import { AnimatePresence, Input, InputProps, SizeTokens, styled, Text, View, XStack, YStack } from 'tamagui';

import { Cancel } from '../icons/outline';

export interface TextInputProps extends Omit<InputProps, 'size'> {
  value?: string;
  onTextChange?: (text: string) => void;
  onSubmit?: (text: string) => void;
  onPressReset?: () => void;
  size?: keyof typeof TEXT_INPUT_SIZE;
  helperText?: React.ReactNode;
  helperTextStatus?: 'default' | 'error' | 'success';
}

export const TEXT_INPUT_SIZE = {
  MEDIUM: 48
};

export const TextInput = ({
  size = 'MEDIUM',
  value,
  onTextChange,
  onSubmit,
  helperText,
  helperTextStatus = 'default',
  onPressReset,
  ...props
}: TextInputProps) => {
  const hasValue = value && value.length > 0;

  return (
    <YStack gap={12}>
      <XStack items="center">
        <StyledInput
          value={value}
          placeholder="검색어를 입력하세요."
          size={size as SizeTokens}
          keyboardType="default"
          returnKeyType="done"
          pr={30}
          unstyled
          onChangeText={onTextChange}
          submitBehavior="newline"
          onSubmitEditing={(e) => onSubmit?.(e.nativeEvent.text)}
          {...props}
        />

        <ButtonContainer r={0} gap={12} px={20}>
          <AnimatePresence>
            {hasValue && (
              <ClearButton onPress={onPressReset}>
                <Cancel />
              </ClearButton>
            )}
          </AnimatePresence>
        </ButtonContainer>
      </XStack>

      {helperText && typeof helperText === 'string' ? (
        <HelperText size={size as any} status={helperTextStatus}>
          {helperText}
        </HelperText>
      ) : (
        helperText
      )}
    </YStack>
  );
};

const StyledInput = styled(Input, {
  flex: 1,
  rounded: 6,
  px: 16,
  bg: '$white850',
  placeholderTextColor: '$black500',
  color: '$black800',
  variants: {
    size: {
      MEDIUM: {
        height: TEXT_INPUT_SIZE.MEDIUM,
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 20
      }
    }
  } as const
});

const ButtonContainer = styled(XStack, {
  position: 'absolute'
});

const ClearButton = styled(View, {
  width: 20,
  height: 20,
  hitSlop: 10,
  enterStyle: { opacity: 0, scale: 0.8 },
  exitStyle: { opacity: 0, scale: 0.8 },
  animation: 'quick'
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
      MEDIUM: {
        fontSize: 14,
        lineHeight: 16,
        fontWeight: 400
      }
    }
  } as const
});
