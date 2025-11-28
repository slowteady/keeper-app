import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useCallback, useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { styled, useTheme, XStack } from 'tamagui';

import { Button } from '@/shared';
import { Close } from '@/shared/ui/icons/outline';
import { Search } from '@/shared/ui/icons/solid';

export interface BottomSheetSearchInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
}

export const BottomSheetSearchInput = ({ onSubmit, placeholder }: BottomSheetSearchInputProps) => {
  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState('');

  const { black500, black900, white600 } = useTheme();
  const closeButtonOpacity = useSharedValue(0);

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
    closeButtonOpacity.value = 0;
  };

  const handleChangeText = useCallback(
    (text: string) => {
      setValue(text);
      closeButtonOpacity.value = text.length > 0 ? 1 : 0;
    },
    [closeButtonOpacity]
  );

  const animatedCloseButtonStyle = useAnimatedStyle(() => ({
    opacity: withTiming(closeButtonOpacity.value, { duration: 200 }),
    transform: [{ scale: withTiming(closeButtonOpacity.value, { duration: 200 }) }]
  }));

  return (
    <Container borderColor={isFocus ? '$black900' : '$white600'}>
      <Input
        placeholder={placeholder || '검색어를 입력하세요.'}
        placeholderTextColor={black500.val}
        keyboardType="default"
        returnKeyType="search"
        value={value}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmit}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      <IconContainer>
        <Animated.View style={animatedCloseButtonStyle}>
          <Button variant="ghost" onPress={handlePressReset}>
            <Close width={24} height={24} color={black500.val} />
          </Button>
        </Animated.View>
        <Button variant="ghost" onPress={handleSubmit}>
          <Search width={24} height={24} color={isFocus ? black900.val : white600.val} />
        </Button>
      </IconContainer>
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

const IconContainer = styled(XStack, {
  items: 'center',
  gap: 10,
  ml: 8
});
