import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { UseFormReturn, useWatch } from 'react-hook-form';

import { CommunityAdoptFormDto } from '@/entities/community';
import { AnimalTypeDto } from '@/shared/model';
import { BottomSheetMenu, useBottomSheet } from '@/shared/ui';

import { makeFormOptions } from '../lib/make-form-options';
import { CreatePostKindBottomSheet } from '../ui';

export const useAdoptFormSelectors = (form: UseFormReturn<CommunityAdoptFormDto>, animalType: AnimalTypeDto) => {
  const weight = useWatch({ control: form.control, name: 'weight' });
  const age = useWatch({ control: form.control, name: 'age' });
  const kind = useWatch({ control: form.control, name: 'specificType' });

  const { weightOption, ageOption, kindOption } = makeFormOptions(animalType);
  const { present, dismiss } = useBottomSheet();

  const openWeightSelector = () =>
    present(
      <BottomSheetScrollView>
        <BottomSheetMenu
          data={weightOption}
          value={Number(weight)}
          onPress={(data) => {
            form.setValue('weight', data.id.toString());
            dismiss();
          }}
        />
      </BottomSheetScrollView>,
      { snapPoints: ['50%'] }
    );

  const openAgeSelector = () =>
    present(
      <BottomSheetScrollView>
        <BottomSheetMenu
          data={ageOption}
          value={Number(age)}
          onPress={(data) => {
            form.setValue('age', data.id.toString());
            dismiss();
          }}
        />
      </BottomSheetScrollView>,
      { snapPoints: ['50%'] }
    );

  const openKindSelector = () =>
    present(
      <CreatePostKindBottomSheet
        kindOption={kindOption}
        kind={kind}
        onSelect={(id) => {
          form.setValue('specificType', id);
          dismiss();
        }}
      />,
      { snapPoints: ['50%'] }
    );

  return { openWeightSelector, openAgeSelector, openKindSelector };
};
