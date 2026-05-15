import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { CommunityAdoptFormDto, CommunityAdoptFormSchema, CREATE_POST_OPTIONS } from '@/entities/community';
import { useImageUpload } from '@/features/upload';
import { globalToast } from '@/shared/lib';
import { BottomSheetMenu, useBottomSheet } from '@/shared/ui';

import { makeFormOptions } from '../lib/make-form-options';
import { CreatePostKindBottomSheet } from '../ui';
import { createAdoptionPersonal, toCreateAdoptionPersonalBody } from './api';

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
  const animalType = useWatch({ control: form.control, name: 'animalType' });

  // animalType 이 바뀌면 품종 리스트가 달라지므로 옵션 재생성
  const { weightOption, ageOption, kindOption } = makeFormOptions(animalType);

  // animalType 변경 시 specificType reset — 강아지에서 고른 품종이 고양이로 바꿔도 남아있는 문제 방지
  // 첫 마운트(default 값)에선 reset 하지 않도록 ref 로 변경 추적
  const prevAnimalTypeRef = useRef(animalType);
  useEffect(() => {
    if (prevAnimalTypeRef.current !== animalType) {
      form.setValue('specificType', '');
      prevAnimalTypeRef.current = animalType;
    }
  }, [animalType, form]);
  const { present, dismiss } = useBottomSheet();

  // 게시글 등록 흐름: 이미지 presigned 업로드 → 백엔드 createPost → 상세로 이동
  // 백엔드 presigned 엔드포인트(/uploads/presign) 미구현 시 이미지 업로드 단계에서 실패하므로,
  // 그 책임은 백엔드 개발자가 담당. 프론트는 흐름 틀만 완성.
  const imageUpload = useImageUpload();
  const submitMutation = useMutation({
    mutationFn: async (data: CommunityAdoptFormDto) => {
      const uploadedUrls = data.images.length > 0 ? await imageUpload.mutateAsync(data.images) : [];
      const body = toCreateAdoptionPersonalBody(data, uploadedUrls);
      return createAdoptionPersonal(body);
    },
    onSuccess: (post) => {
      globalToast('게시글이 등록되었어요', 'success');
      router.replace(`/(untabs)/community/${post.id}`);
    },
    onError: () => {
      globalToast('게시글 등록에 실패했어요. 잠시 후 다시 시도해주세요', 'fail');
    }
  });

  const handleSubmit = (data: CommunityAdoptFormDto) => submitMutation.mutate(data);

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
    isSubmitting: submitMutation.isPending,
    actions: { handleSubmit, openWeightSelector, openAgeSelector, openKindSelector }
  };
};
