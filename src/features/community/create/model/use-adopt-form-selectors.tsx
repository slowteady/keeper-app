import { UseFormReturn, useWatch } from 'react-hook-form';

import { CommunityAdoptFormDto } from '@/entities/community';
import { AnimalTypeDto } from '@/shared/model';
import { ChosungSelectSheet, useBottomSheet, useBottomSheetMenu } from '@/shared/ui';

import { makeFormOptions } from '../lib/make-form-options';

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
      <ChosungSelectSheet
        options={kindOption}
        value={kind ?? ''}
        searchPlaceholder="예)골든 리트리버"
        onSelect={(id) => {
          if (id) form.setValue('specificType', id, { shouldDirty: true });
          dismiss();
        }}
      />,
      { snapPoints: ['70%'], disableViewWrap: true }
    );

  return { openAgeSelector, openKindSelector };
};
