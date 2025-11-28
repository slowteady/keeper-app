import { styled, Text, View, XStack } from 'tamagui';

import { SearchInput } from '@/shared';

interface ShelterListHeaderSectionProps {
  onSubmitSearch: (text: string) => void;
  onPressLocation: () => void;
}

export const ShelterListHeaderSection = ({ onSubmitSearch, onPressLocation }: ShelterListHeaderSectionProps) => {
  return (
    <>
      <TitleContainer mb={30}>
        <Text fontSize={32} lineHeight={40} fontWeight="500" color="$black900">
          보호소
        </Text>
        <Button onPress={onPressLocation}>
          <Text fontSize={14} lineHeight={16} fontWeight="500" color="$black600">
            위치설정
          </Text>
        </Button>
      </TitleContainer>

      <SearchInput onSubmit={onSubmitSearch} placeholder="보호소명 또는 주소로 검색해주세요." />
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
