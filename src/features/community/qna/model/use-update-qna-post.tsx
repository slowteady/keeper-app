import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { communityApi, CommunityQnaFormDto, CommunityQnaFormSchema, communityQueries } from '@/entities/community';
import { useImageUpload } from '@/features/upload';
import { globalToast } from '@/shared/lib';

export const useUpdateQnaPost = (id: number) => {
  const queryClient = useQueryClient();
  const { data: detail, isLoading } = useQuery(communityQueries.qnaDetail(id));

  const form = useForm<CommunityQnaFormDto>({
    resolver: zodResolver(CommunityQnaFormSchema),
    defaultValues: { type: 'ETC', animalType: undefined, title: '', content: '', images: [] }
  });

  // 상세 로드 후 폼에 값 채움
  useEffect(() => {
    if (detail) {
      form.reset({
        type: detail.type,
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
      // 신규 local URI 만 업로드 (https 는 기존 publicUrl 유지)
      const existing = (data.images ?? []).filter((u) => u.startsWith('http'));
      const localUris = (data.images ?? []).filter((u) => !u.startsWith('http'));
      const uploaded = localUris.length > 0 ? await imageUpload.mutateAsync(localUris) : [];
      return communityApi.updateQnaPost(id, { ...data, images: [...existing, ...uploaded] });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...communityQueries.all(), 'qna'] });
      router.replace(`/(untabs)/community/${id}`);
    },
    onError: () => {
      globalToast('수정에 실패했어요. 잠시 후 다시 시도해주세요', 'fail');
    }
  });

  const handleSubmit = (data: CommunityQnaFormDto) => submitMutation.mutate(data);

  return {
    form,
    onSubmit: form.handleSubmit(handleSubmit),
    isPending: submitMutation.isPending || imageUpload.isPending,
    isLoading
  };
};
