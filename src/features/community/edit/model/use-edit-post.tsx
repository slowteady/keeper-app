import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';

import { CommunityAdoptFormDto, CommunityAdoptFormSchema, communityQueries } from '@/entities/community';
import { toCreateAdoptionPersonalBody, updateAdoptionPersonal } from '@/features/community/create/model/api';
import { useAdoptFormSelectors } from '@/features/community/create/model/use-adopt-form-selectors';
import { globalToast } from '@/shared/lib';

import { fromAdoptionPersonalDetail } from '../lib/from-detail';

export const useEditPost = (postId: number) => {
  const queryClient = useQueryClient();
  // useSuspenseQuery — detail 도착이 hook 마운트 시점에 보장됨.
  // defaultValues 에 동기 주입하므로 default → 실제값 따닥거림 제거.
  const { data: detail } = useSuspenseQuery(communityQueries.detail(postId));

  const form = useForm<CommunityAdoptFormDto>({
    resolver: zodResolver(CommunityAdoptFormSchema),
    defaultValues: fromAdoptionPersonalDetail(detail)
  });

  const animalType = useWatch({ control: form.control, name: 'animalType' });
  const { openAgeSelector, openKindSelector } = useAdoptFormSelectors(form, animalType);

  const submitMutation = useMutation({
    mutationFn: (data: CommunityAdoptFormDto) => {
      const body = toCreateAdoptionPersonalBody(data, data.images);
      return updateAdoptionPersonal(postId, body);
    },
    onSuccess: (updated) => {
      // 서버 응답 후 detail 캐시 즉시 갱신 (refetch 1초 지연 우회)
      queryClient.setQueryData(communityQueries.detail(postId).queryKey, updated);
      // 백그라운드 정합 (list 도 변경 반영)
      queryClient.invalidateQueries({ queryKey: communityQueries.all() });
      router.back();
    },
    onError: () => {
      globalToast('게시글 수정에 실패했어요. 잠시 후 다시 시도해주세요', 'fail');
    }
  });

  const handleSubmit = (data: CommunityAdoptFormDto) => submitMutation.mutate(data);

  return {
    form,
    isSubmitting: submitMutation.isPending,
    actions: { handleSubmit, openAgeSelector, openKindSelector }
  };
};
