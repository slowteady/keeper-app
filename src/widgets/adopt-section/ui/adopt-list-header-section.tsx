import { useTheme, View } from 'tamagui';

import { ADOPT_OPTIONS } from '@/entities/adopt';
import { ButtonGroup, ChipButton, SearchInput, useBottomSheetMenu } from '@/shared/ui';
import { DownArrow } from '@/shared/ui/icons/mini';

export type AdoptListHeaderSectionProps = {
  filterValue: string;
  animalType: string;
  searchValue: string;
  onChangeFilter: (value: string) => void;
  onChangeAnimalType: (value: string) => void;
  onChangeSearch: (value: string) => void;
  onSearch: (value: string) => void;
  showFilter?: boolean;
  showSearch?: boolean;
};

export const AdoptListHeaderSection = ({
  filterValue,
  animalType,
  searchValue,
  onChangeFilter,
  onChangeAnimalType,
  onChangeSearch,
  onSearch,
  showFilter = true,
  showSearch = true
}: AdoptListHeaderSectionProps) => {
  const { black500 } = useTheme();
  const { open: openFilterMenu } = useBottomSheetMenu({
    data: ADOPT_OPTIONS.FILTER,
    value: filterValue,
    onPress: (data) => onChangeFilter(data.id)
  });
  const filterText = ADOPT_OPTIONS.FILTER.find((item) => item.id === filterValue)?.label ?? '';

  return (
    <>
      {showSearch && (
        <View mb={16}>
          <SearchInput
            placeholder="품종 또는 지역을 입력해주세요"
            value={searchValue}
            onTextChange={onChangeSearch}
            onSubmit={onSearch}
          />
        </View>
      )}

      <View mb={showFilter ? 12 : 16}>
        <ButtonGroup data={ADOPT_OPTIONS.ANIMAL} id={animalType} onChange={(id) => onChangeAnimalType(id)} />
      </View>

      {showFilter && (
        <View mb={16} items="flex-start">
          <ChipButton
            onPress={() => openFilterMenu()}
            right={<DownArrow width={12} height={12} color={black500.val} style={{ marginLeft: 4 }} />}
          >
            {filterText}
          </ChipButton>
        </View>
      )}
    </>
  );
};
