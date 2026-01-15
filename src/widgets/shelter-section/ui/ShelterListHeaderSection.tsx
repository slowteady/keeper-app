import { useState } from 'react';
import { styled, Text, View, XStack } from 'tamagui';

import { SearchInput } from '@/shared/ui';

interface ShelterListHeaderSectionProps {
  onSearch: (text: string) => void;
  onPressLocation: () => void;
}

export const ShelterListHeaderSection = ({ onSearch, onPressLocation }: ShelterListHeaderSectionProps) => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <>
      <TitleContainer mb={16}>
        <Text fontSize={32} lineHeight={40} fontWeight="500" color="$black900">
          보호소 찾기
        </Text>
        <Button onPress={onPressLocation}>
          <Text fontSize={14} lineHeight={16} fontWeight="500" color="$black600">
            위치설정
          </Text>
        </Button>
      </TitleContainer>

      <SearchInput
        placeholder="보호소명 또는 주소를 검색해주세요."
        value={searchValue}
        onTextChange={setSearchValue}
        onSubmit={onSearch}
      />
    </>
  );
};

const TitleContainer = styled(XStack, {
  items: 'center',
  justify: 'space-between'
});

const Button = styled(View, {
  rounded: 50,
  borderWidth: 1,
  borderColor: '$white600',
  px: 12,
  py: 8
});
