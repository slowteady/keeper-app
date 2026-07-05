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
import { useImageUpload, useVideoUpload } from '@/features/upload';
import { getModerationMessage, globalToast } from '@/shared/lib';

import { createAdoptionPersonal, toCreateAdoptionPersonalBody } from './api';
import { resolveVideoUpload } from './resolve-video';
import { useAdoptFormSelectors } from './use-adopt-form-selectors';

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  const form = useForm<CommunityAdoptFormDto>({
    resolver: zodResolver(CommunityAdoptFormSchema),
    mode: 'onChange',
    defaultValues: {
      animalType: CREATE_POST_OPTIONS.animalType[0].value,
      protectionType: CREATE_POST_OPTIONS.protectionType[0].value,
      title: '',
      content: '',
      images: [],
      video: null,
      contact: [],
      location: '',
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

  const prevAnimalTypeRef = useRef(animalType);
  useEffect(() => {
    if (prevAnimalTypeRef.current !== animalType) {
      form.setValue('specificType', '', { shouldDirty: true });
      prevAnimalTypeRef.current = animalType;
    }
  }, [animalType, form]);

  const { openAgeSelector, openKindSelector } = useAdoptFormSelectors(form, animalType);

  const imageUpload = useImageUpload();
  const videoUpload = useVideoUpload();
  const submitMutation = useMutation({
    mutationFn: async (data: CommunityAdoptFormDto) => {
      const uploadedUrls = data.images.length > 0 ? await imageUpload.mutateAsync(data.images) : [];
      const videoResult = await resolveVideoUpload(data.video, (video) => videoUpload.mutateAsync({ video }));
      const body = toCreateAdoptionPersonalBody(data, uploadedUrls, videoResult);
      return createAdoptionPersonal(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityQueries.all() });
      globalToast('공고를 등록했어요', 'success');
      router.back();
    },
    onError: (error) => {
      globalToast(getModerationMessage(error) ?? '공고를 등록하지 못했어요', 'fail');
    }
  });

  const handleSubmit = (data: CommunityAdoptFormDto) => submitMutation.mutate(data);

  return {
    form,
    isSubmitting: submitMutation.isPending,
    actions: { handleSubmit, openAgeSelector, openKindSelector }
  };
};
