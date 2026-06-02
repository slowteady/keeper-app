import { styled, Text, View, XStack } from 'tamagui';

import { ADOPT_OPTIONS } from '@/entities/adopt';
import { ButtonGroup, Dropdown, SearchInput } from '@/shared/ui';

export type AdoptListHeaderSectionProps = {
  filterValue: string;
  animalType: string;
  searchValue: string;
  onChangeFilter: (value: string) => void;
  onChangeAnimalType: (value: string) => void;
  onChangeSearch: (value: string) => void;
  onSearch: (value: string) => void;
};

export const AdoptListHeaderSection = ({
  filterValue,
  animalType,
  searchValue,
  onChangeFilter,
  onChangeAnimalType,
  onChangeSearch,
  onSearch
}: AdoptListHeaderSectionProps) => {
  return (
    <>
      <TitleContainer mb={24}>
        <Text fontSize={32} lineHeight={34} fontWeight="500" color="$black900">
          입양공고
        </Text>
        <View mt={12}>
          <Dropdown data={ADOPT_OPTIONS.FILTER} value={filterValue} onChange={(value) => onChangeFilter(value.id)} />
        </View>
      </TitleContainer>

      <View mb={16}>
        <ButtonGroup data={ADOPT_OPTIONS.ANIMAL} id={animalType} onChange={(id) => onChangeAnimalType(id)} />
      </View>

      <View mb={32}>
        <SearchInput
          placeholder="품종 또는 지역을 입력해주세요"
          value={searchValue}
          onTextChange={onChangeSearch}
          onSubmit={onSearch}
        />
      </View>
    </>
  );
};

const TitleContainer = styled(XStack, {
  items: 'center',
  justify: 'space-between'
});
