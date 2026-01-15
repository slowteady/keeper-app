import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { CommunityAdoptFormDto, CommunityAdoptFormSchema, CREATE_POST_OPTIONS } from '@/entities/community';
import { BottomSheetMenu, useBottomSheet } from '@/shared/ui';

import { makeFormOptions } from '../lib/makeFormOptions';
import { CreatePostKindBottomSheet } from '../ui';

export const useCreatePost = () => {
  const form = useForm<CommunityAdoptFormDto>({
    resolver: zodResolver(CommunityAdoptFormSchema),
    defaultValues: {
      title: '',
      animalType: CREATE_POST_OPTIONS.animalType[0].value,
      gender: CREATE_POST_OPTIONS.gender[0].value,
      neuterYn: CREATE_POST_OPTIONS.neuterYn[0].value,
      healthCheck: CREATE_POST_OPTIONS.healthCheck[0].value,
      protectionType: CREATE_POST_OPTIONS.protectionType[0].value,
      vaccinationCheck: CREATE_POST_OPTIONS.vaccinationCheck[0].value,
      weight: '',
      location: '',
      age: '',
      specificType: '',
      specialMark: '',
      content: '',
      contact: [{ type: CREATE_POST_OPTIONS.contact[0].value, value: '' }],
      images: [],
      // 선택 입력 필드
      likes: '',
      dislikes: '',
      health: '',
      relatedLink: ''
    }
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
