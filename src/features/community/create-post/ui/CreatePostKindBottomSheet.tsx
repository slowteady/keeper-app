import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useMemo, useState } from 'react';

import { BottomSheetMenu } from '@/shared';

export interface CreatePostKindBottomSheetProps {
  kindOption: { id: string; label: string }[];
  kind: string;
  onSelect: (id: string) => void;
}

export const CreatePostKindBottomSheet = ({ kindOption, kind, onSelect }: CreatePostKindBottomSheetProps) => {
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
        placeholder="품종을 입력해주세요."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ padding: 16, backgroundColor: '#F7F7F7' }}
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
