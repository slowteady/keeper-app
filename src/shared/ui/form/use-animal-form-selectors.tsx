import { FieldValues, Path, PathValue, UseFormReturn, useWatch } from 'react-hook-form';

import { AnimalTypeDto, makeFormOptions } from '@/shared/model';
import { ChosungSelectSheet, useBottomSheet, useBottomSheetMenu } from '@/shared/ui';

type AnimalSelectorForm = { age?: string; specificType?: string };

export const useAnimalFormSelectors = <T extends FieldValues & AnimalSelectorForm>(
  form: UseFormReturn<T>,
  animalType: AnimalTypeDto
) => {
  const ageName = 'age' as Path<T>;
  const kindName = 'specificType' as Path<T>;

  const age = useWatch({ control: form.control, name: ageName });
  const kind = useWatch({ control: form.control, name: kindName });

  const { ageOption, kindOption } = makeFormOptions(animalType);
  const { present, dismiss } = useBottomSheet();

  const { open: openAgeSelector } = useBottomSheetMenu({
    data: ageOption,
    value: Number(age),
    onPress: (data) => form.setValue(ageName, data.id.toString() as PathValue<T, Path<T>>, { shouldDirty: true })
  });

  const openKindSelector = () =>
    present(
      <ChosungSelectSheet
        options={kindOption}
        value={typeof kind === 'string' ? kind : ''}
        searchPlaceholder="예)골든 리트리버"
        onSelect={(id) => {
          if (id) form.setValue(kindName, id as PathValue<T, Path<T>>, { shouldDirty: true });
          dismiss();
        }}
      />,
      { snapPoints: ['70%'], disableViewWrap: true }
    );

  return { openAgeSelector, openKindSelector };
};
