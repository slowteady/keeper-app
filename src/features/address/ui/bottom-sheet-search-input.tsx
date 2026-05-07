import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useCallback, useState } from 'react';
import { AnimatePresence, styled, useTheme, View, XStack } from 'tamagui';

import { Cancel } from '@/shared/ui/icons/outline';
import { Search } from '@/shared/ui/icons/solid';

export type BottomSheetSearchInputProps = {
  onSubmit: (text: string) => void;
  placeholder?: string;
};

export const BottomSheetSearchInput = ({ onSubmit, placeholder }: BottomSheetSearchInputProps) => {
  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState('');

  const { black500, black900, white600 } = useTheme();

  const handleFocus = () => {
    setIsFocus(true);
  };

  const handleBlur = () => {
    setIsFocus(false);
  };

  const handleSubmit = () => {
    onSubmit(value);
  };

  const handlePressReset = () => {
    setValue('');
  };

  const handleChangeText = useCallback((text: string) => {
    setValue(text);
  }, []);

  const hasValue = value && value.length > 0;

  return (
    <Container borderColor={isFocus ? '$black900' : '$white600'}>
      <Input
        placeholder={placeholder || '검색어를 입력하세요'}
        placeholderTextColor={black500.val}
        keyboardType="default"
        returnKeyType="search"
        value={value}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmit}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      <ButtonContainer r={0} gap={12} px={20}>
        <AnimatePresence>
          {hasValue && (
            <ClearButton onPress={() => handlePressReset()}>
              <Cancel />
            </ClearButton>
          )}
        </AnimatePresence>

        <View width={24} height={24} onPress={() => onSubmit?.(value ?? '')} hitSlop={10}>
          <Search color={isFocus ? black900.val : white600.val} />
        </View>
      </ButtonContainer>
    </Container>
  );
};

const Container = styled(XStack, {
  height: 48,
  items: 'center',
  bg: 'transparent',
  px: 16,
  mb: 16,
  rounded: 6,
  justify: 'space-between',
  borderWidth: 1
});

const Input = styled(BottomSheetTextInput, {
  style: {
    flex: 1,
    color: '$black800',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20
  }
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
