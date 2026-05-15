import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useMemo, useState } from 'react';
import { useTheme } from 'tamagui';

import { BottomSheetMenu } from '@/shared/ui';

export type CreatePostKindBottomSheetProps = {
  kindOption: { id: string; label: string }[];
  kind: string;
  onSelect: (id: string) => void;
};

export const CreatePostKindBottomSheet = ({ kindOption, kind, onSelect }: CreatePostKindBottomSheetProps) => {
  const { white850 } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredKindOption = useMemo(() => {
    if (!searchQuery.trim()) {
      return kindOption;
    }

    return kindOption.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, kindOption]);

  return (
    <BottomSheetScrollView>
      <BottomSheetTextInput
        placeholder="품종 검색"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ padding: 16, backgroundColor: white850.val }}
      />

      <BottomSheetMenu
        data={filteredKindOption}
        value={kind}
        onPress={(data) => {
          onSelect(data.id.toString());
        }}
      />
    </BottomSheetScrollView>
  );
};
