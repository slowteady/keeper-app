import { AnimatePresence, Input, InputProps, SizeTokens, styled, View, XStack } from 'tamagui';

import { Cancel } from '../icons/outline';
import { Search } from '../icons/solid';

export interface SearchInputProps extends Omit<InputProps, 'size'> {
  value?: string;
  onTextChange?: (text: string) => void;
  onSubmit?: (text: string) => void;
  size?: keyof typeof SEARCH_INPUT_SIZE;
}

export const SEARCH_INPUT_SIZE = {
  MEDIUM: 48
};

export const SearchInput = ({ size = 'MEDIUM', value, onTextChange, onSubmit, ...props }: SearchInputProps) => {
  const hasValue = value && value.length > 0;

  return (
    <XStack items="center">
      <StyledInput
        value={value}
        placeholder="검색어를 입력하세요."
        size={size as SizeTokens}
        keyboardType="default"
        returnKeyType="search"
        pr={30}
        unstyled
        onChangeText={onTextChange}
        onSubmitEditing={(e) => onSubmit?.(e.nativeEvent.text)}
        {...props}
      />

      <ButtonContainer r={0} gap={12} px={20}>
        <AnimatePresence>
          {hasValue && (
            <ClearButton onPress={() => onTextChange?.('')}>
              <Cancel />
            </ClearButton>
          )}
        </AnimatePresence>

        <View width={24} height={24} onPress={() => onSubmit?.(value ?? '')} hitSlop={10}>
          <Search color="$black700" />
        </View>
      </ButtonContainer>
    </XStack>
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
        height: SEARCH_INPUT_SIZE.MEDIUM,
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 20
      }
    }
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
