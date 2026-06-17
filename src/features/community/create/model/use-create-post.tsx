import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import {
  CommunityAdoptFormDto,
  CommunityAdoptFormSchema,
  communityQueries,
  CREATE_POST_OPTIONS
} from '@/entities/community';
import { useImageUpload } from '@/features/upload';
import { globalToast } from '@/shared/lib';

import { createAdoptionPersonal, toCreateAdoptionPersonalBody } from './api';
import { useAdoptFormSelectors } from './use-adopt-form-selectors';

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  const form = useForm<CommunityAdoptFormDto>({
    resolver: zodResolver(CommunityAdoptFormSchema),
    mode: 'onChange',
    defaultValues: {
      // 필수
      animalType: CREATE_POST_OPTIONS.animalType[0].value,
      protectionType: CREATE_POST_OPTIONS.protectionType[0].value,
      title: '',
      content: '',
      images: [],
      contact: [],
      location: '',
      // 선택 — 미선택은 undefined
      gender: undefined,
      neuterYn: undefined,
      healthCheck: undefined,
      vaccinationCheck: undefined,
      weight: undefined,
      age: undefined,
      specificType: undefined,
      health: undefined,
      relatedLink: undefined,
      toiletTraining: undefined,
      separationAnxiety: undefined,
      barking: undefined,
      activityLevel: undefined,
      withChildren: undefined,
      withDogs: undefined,
      withCats: undefined
    }
  });

  const animalType = useWatch({ control: form.control, name: 'animalType' });

  // animalType 변경 시 specificType reset — 강아지에서 고른 품종이 고양이로 바꿔도 남아있는 문제 방지
  // 첫 마운트(default 값)에선 reset 하지 않도록 ref 로 변경 추적
  const prevAnimalTypeRef = useRef(animalType);
  useEffect(() => {
    if (prevAnimalTypeRef.current !== animalType) {
      form.setValue('specificType', '', { shouldDirty: true });
      prevAnimalTypeRef.current = animalType;
    }
  }, [animalType, form]);

  const { openAgeSelector, openKindSelector } = useAdoptFormSelectors(form, animalType);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityQueries.all() });
      globalToast('공고를 등록했어요', 'success');
      router.back();
    },
    onError: () => {
      globalToast('공고를 등록하지 못했어요', 'fail');
    }
  });

  const handleSubmit = (data: CommunityAdoptFormDto) => submitMutation.mutate(data);

  return {
    form,
    isSubmitting: submitMutation.isPending,
    actions: { handleSubmit, openAgeSelector, openKindSelector }
  };
};
