import { UseFormReturn, useWatch } from 'react-hook-form';

import { CommunityAdoptFormDto } from '@/entities/community';
import { AnimalTypeDto } from '@/shared/model';
import { useBottomSheet, useBottomSheetMenu } from '@/shared/ui';

import { makeFormOptions } from '../lib/make-form-options';
import { CreatePostKindBottomSheet } from '../ui';

export const useAdoptFormSelectors = (form: UseFormReturn<CommunityAdoptFormDto>, animalType: AnimalTypeDto) => {
  const age = useWatch({ control: form.control, name: 'age' });
  const kind = useWatch({ control: form.control, name: 'specificType' });

  const { ageOption, kindOption } = makeFormOptions(animalType);
  const { present, dismiss } = useBottomSheet();

  const { open: openAgeSelector } = useBottomSheetMenu({
    data: ageOption,
    value: Number(age),
    onPress: (data) => form.setValue('age', data.id.toString(), { shouldDirty: true })
  });

  const openKindSelector = () =>
    present(
      <CreatePostKindBottomSheet
        kindOption={kindOption}
        kind={kind ?? ''}
        onSelect={(id) => {
          form.setValue('specificType', id, { shouldDirty: true });
          dismiss();
        }}
      />,
      // sheet 70% 고정 + disableViewWrap (SectionList 가 root scrollable, input/chip 은 ListHeaderComponent)
      // 키보드 blur 시 복원은 CreatePostKindBottomSheet 안 Keyboard listener 가 snapToIndex(0) 호출
      { snapPoints: ['70%'], disableViewWrap: true }
    );

  return { openAgeSelector, openKindSelector };
};
