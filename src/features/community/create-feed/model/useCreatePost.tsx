import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { CREATE_POST_DEFAULT_VALUES, CommunityAdoptFormSchema, CommunityAdoptFormDto } from '@/entities';
import { BottomSheetMenu, useBottomSheet } from '@/shared';

import { makeFormOptions } from '../lib/makeFormOptions';
import { CreatePostKindBottomSheet } from '../ui';

export const useCreatePost = () => {
  const form = useForm<CommunityAdoptFormDto>({
    resolver: zodResolver(CommunityAdoptFormSchema),
    defaultValues: CREATE_POST_DEFAULT_VALUES
  });

  const weight = useWatch({ control: form.control, name: 'weight' });
  const age = useWatch({ control: form.control, name: 'age' });
  const kind = useWatch({ control: form.control, name: 'specificType' });

  const { weightOption, ageOption, kindOption } = makeFormOptions();
  const { present, dismiss } = useBottomSheet();

  const handleSubmit = (data: CommunityAdoptFormDto) => {};

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

  const openKindSelector = () => {
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
  };

  return {
    form,
    actions: { handleSubmit, openWeightSelector, openAgeSelector, openKindSelector }
  };
};
