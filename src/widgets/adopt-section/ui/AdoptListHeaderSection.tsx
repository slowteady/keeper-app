import { useState } from 'react';
import { styled, Text, View, XStack } from 'tamagui';

import { ADOPT_LIST_FILTER } from '@/entities';
import { ADOPT_ANIMAL_FILTER, ButtonGroup, Dropdown, SearchInput } from '@/shared';

export interface AdoptListHeaderSectionProps {
  filterValue: string;
  animalType: string;
  onChangeFilter: (value: string) => void;
  onChangeAnimalType: (value: string) => void;
  onSearch: (value: string) => void;
}

export const AdoptListHeaderSection = ({
  filterValue,
  animalType,
  onChangeFilter,
  onChangeAnimalType,
  onSearch
}: AdoptListHeaderSectionProps) => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <>
      <TitleContainer mb={24}>
        <Text fontSize={32} lineHeight={34} fontWeight="500" color="$black900">
          전체공고
        </Text>
        <View mt={12}>
          <Dropdown
            data={[...ADOPT_LIST_FILTER]}
            value={filterValue}
            onChange={(value) => onChangeFilter(value.id)}
            snapPoints={[200]}
          />
        </View>
      </TitleContainer>

      <View mb={16}>
        <ButtonGroup data={ADOPT_ANIMAL_FILTER} id={animalType} onChange={(id) => onChangeAnimalType(id)} />
      </View>

      <View mb={32}>
        <SearchInput
          placeholder="품종 또는 지역을 입력해주세요."
          value={searchValue}
          onTextChange={setSearchValue}
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
