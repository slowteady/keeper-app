import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
  communityApi,
  CommunityQnaFormDto,
  CommunityQnaFormSchema,
  communityQueries,
  type PostDetailUnion
} from '@/entities/community';
import { useImageUpload } from '@/features/upload';
import { getModerationMessage, globalToast } from '@/shared/lib';

export const useUpdateQnaPost = (id: string) => {
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(communityQueries.detail(id));
  const detail = data.kind === 'QNA' ? data.qna : undefined;

  const form = useForm<CommunityQnaFormDto>({
    resolver: zodResolver(CommunityQnaFormSchema),
    defaultValues: { type: 'ETC', animalType: undefined, title: '', content: '', images: [] }
  });

  useEffect(() => {
    if (detail) {
      form.reset({
        type: detail.qnaType,
        animalType: detail.animalType,
        title: detail.title,
        content: detail.content,
        images: detail.images
      });
    }
  }, [detail, form]);

  const imageUpload = useImageUpload();
  const submitMutation = useMutation({
    mutationFn: async (data: CommunityQnaFormDto) => {
      const existing = (data.images ?? []).filter((u) => u.startsWith('https://'));
      const localUris = (data.images ?? []).filter((u) => !u.startsWith('https://'));
      const uploaded = localUris.length > 0 ? await imageUpload.mutateAsync(localUris) : [];
      return communityApi.updateQnaPost(id, { ...data, images: [...existing, ...uploaded] });
    },
    onSuccess: (updated) => {
      const next: PostDetailUnion = { kind: 'QNA', qna: updated };
      queryClient.setQueryData(communityQueries.detail(id).queryKey, next);
      queryClient.invalidateQueries({ queryKey: communityQueries.all() });
      router.back();
    },
    onError: (error) => {
      globalToast(getModerationMessage(error) ?? '글을 수정하지 못했어요', 'fail');
    }
  });

  const handleSubmit = (data: CommunityQnaFormDto) => submitMutation.mutate(data);

  return {
    form,
    onSubmit: form.handleSubmit(handleSubmit),
    isPending: submitMutation.isPending || imageUpload.isPending
  };
};
