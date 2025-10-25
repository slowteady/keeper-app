import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { CREATE_POST_DEFAULT_VALUES, CreatePostDto, TCreatePostDto } from '@/entities';
import { BottomSheetMenu, useBottomSheet } from '@/shared';

import { makeFormOptions } from '../lib/makeFormOptions';

export const useCreatePost = () => {
  const form = useForm<TCreatePostDto>({
    resolver: zodResolver(CreatePostDto),
    defaultValues: CREATE_POST_DEFAULT_VALUES
  });

  const { present, dismiss } = useBottomSheet();

  const weight = useWatch({ control: form.control, name: 'weight' });
  const age = useWatch({ control: form.control, name: 'age' });
  const kind = useWatch({ control: form.control, name: 'specificType' });

  const { weightOption, ageOption, kindOption } = makeFormOptions();

  const handleSubmit = (data: TCreatePostDto) => {};

  const createBottomSheetHandler = (
    fieldName: keyof TCreatePostDto,
    options: { id: number | string; label: string }[],
    currentValue: string
  ) => {
    return () => {
      present(
        <BottomSheetScrollView>
          <BottomSheetMenu
            data={options}
            value={currentValue}
            onPress={(data) => {
              form.setValue(fieldName, data.id.toString());
              dismiss();
            }}
          />
        </BottomSheetScrollView>,
        { snapPoints: ['50%'] }
      );
    };
  };

  const handlePressWeight = createBottomSheetHandler('weight', weightOption, weight);
  const handlePressAge = createBottomSheetHandler('age', ageOption, age);
  const handlePressKind = createBottomSheetHandler('specificType', kindOption, kind);

  return {
    form,
    actions: { handleSubmit, handlePressWeight, handlePressAge, handlePressKind }
  };
};
