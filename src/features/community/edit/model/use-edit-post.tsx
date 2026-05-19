import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import {
  CommunityAdoptFormDto,
  CommunityAdoptFormSchema,
  communityQueries,
  CREATE_POST_OPTIONS
} from '@/entities/community';
import { toCreateAdoptionPersonalBody, updateAdoptionPersonal } from '@/features/community/create/model/api';
import { useAdoptFormSelectors } from '@/features/community/create/model/use-adopt-form-selectors';
import { globalToast } from '@/shared/lib';

import { fromAdoptionPersonalDetail } from '../lib/from-detail';

export const useEditPost = (postId: number) => {
  const queryClient = useQueryClient();
  const detailQuery = useQuery(communityQueries.detail(postId));

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
      likes: '',
      dislikes: '',
      health: '',
      relatedLink: ''
    }
  });

  // detail 도착 시 한 번만 reset — 사용자가 수정 중인 값을 덮어쓰지 않도록 ref 로 guard
  const hasResetRef = useRef(false);
  useEffect(() => {
    if (!detailQuery.data || hasResetRef.current) return;
    form.reset(fromAdoptionPersonalDetail(detailQuery.data));
    hasResetRef.current = true;
  }, [detailQuery.data, form]);

  const animalType = useWatch({ control: form.control, name: 'animalType' });
  const { openWeightSelector, openAgeSelector, openKindSelector } = useAdoptFormSelectors(form, animalType);

  const submitMutation = useMutation({
    mutationFn: (data: CommunityAdoptFormDto) => {
      // 이미지는 read-only — data.images 가 이미 publicUrl 배열이라 업로드 단계 스킵
      const body = toCreateAdoptionPersonalBody(data, data.images);
      return updateAdoptionPersonal(postId, body);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: communityQueries.all() });
      globalToast('게시글을 수정했어요', 'success');
      router.back();
    },
    onError: () => {
      globalToast('게시글 수정에 실패했어요. 잠시 후 다시 시도해주세요', 'fail');
    }
  });

  const handleSubmit = (data: CommunityAdoptFormDto) => submitMutation.mutate(data);

  return {
    form,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
    isSubmitting: submitMutation.isPending,
    actions: { handleSubmit, openWeightSelector, openAgeSelector, openKindSelector }
  };
};
