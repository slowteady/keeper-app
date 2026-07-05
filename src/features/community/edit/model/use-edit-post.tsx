import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';

import {
  CommunityAdoptFormDto,
  CommunityAdoptFormSchema,
  communityQueries,
  type PostDetailUnion
} from '@/entities/community';
import { toCreateAdoptionPersonalBody, updateAdoptionPersonal } from '@/features/community/create/model/api';
import { resolveVideoUpload } from '@/features/community/create/model/resolve-video';
import { useAdoptFormSelectors } from '@/features/community/create/model/use-adopt-form-selectors';
import { useImageUpload, useVideoUpload } from '@/features/upload';
import { getModerationMessage, globalToast } from '@/shared/lib';

import { fromAdoptionPersonalDetail } from '../lib/from-detail';

export const useEditPost = (postId: string) => {
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(communityQueries.detail(postId));
  const detail = data.kind === 'ADOPT' ? data.adopt : undefined;

  const form = useForm<CommunityAdoptFormDto>({
    resolver: zodResolver(CommunityAdoptFormSchema),
    defaultValues: detail ? fromAdoptionPersonalDetail(detail) : undefined
  });

  const animalType = useWatch({ control: form.control, name: 'animalType' });
  const { openAgeSelector, openKindSelector } = useAdoptFormSelectors(form, animalType);

  const imageUpload = useImageUpload();
  const videoUpload = useVideoUpload();
  const submitMutation = useMutation({
    mutationFn: async (data: CommunityAdoptFormDto) => {
      const localUris = data.images.filter((uri) => !uri.startsWith('http'));
      const uploaded = localUris.length > 0 ? await imageUpload.mutateAsync(localUris) : [];
      let next = 0;
      const images = data.images.map((uri) => (uri.startsWith('http') ? uri : uploaded[next++]));
      const videoResult = await resolveVideoUpload(data.video, (video) => videoUpload.mutateAsync({ video }));
      const body = toCreateAdoptionPersonalBody(data, images, videoResult);
      return updateAdoptionPersonal(postId, body);
    },
    onSuccess: (updated) => {
      const next: PostDetailUnion = { kind: 'ADOPT', adopt: updated };
      queryClient.setQueryData(communityQueries.detail(postId).queryKey, next);
      queryClient.invalidateQueries({ queryKey: communityQueries.all() });
      router.back();
    },
    onError: (error) => {
      globalToast(getModerationMessage(error) ?? '공고를 수정하지 못했어요', 'fail');
    }
  });

  const handleSubmit = (data: CommunityAdoptFormDto) => submitMutation.mutate(data);

  return {
    form,
    isSubmitting: submitMutation.isPending,
    actions: { handleSubmit, openAgeSelector, openKindSelector }
  };
};
