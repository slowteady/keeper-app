import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';

import {
  communityApi,
  CommunityQnaFormDto,
  CommunityQnaFormSchema,
  communityQueries,
  QNA_CATEGORY_OPTIONS
} from '@/entities/community';
import { useImageUpload } from '@/features/upload';
import { globalToast } from '@/shared/lib';

export const useCreateQnaPost = () => {
  const queryClient = useQueryClient();

  const form = useForm<CommunityQnaFormDto>({
    resolver: zodResolver(CommunityQnaFormSchema),
    defaultValues: {
      type: QNA_CATEGORY_OPTIONS[0].value,
      animalType: undefined,
      title: '',
      content: '',
      images: []
    }
  });

  const imageUpload = useImageUpload();
  const submitMutation = useMutation({
    mutationFn: async (data: CommunityQnaFormDto) => {
      const uploadedUrls = data.images && data.images.length > 0 ? await imageUpload.mutateAsync(data.images) : [];
      return communityApi.createQnaPost({ ...data, images: uploadedUrls });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityQueries.all() });
      globalToast('글을 등록했어요', 'success');
      router.back();
    },
    onError: () => {
      globalToast('등록에 실패했어요. 잠시 후 다시 시도해주세요', 'fail');
    }
  });

  const handleSubmit = (data: CommunityQnaFormDto) => submitMutation.mutate(data);

  return {
    form,
    onSubmit: form.handleSubmit(handleSubmit),
    isPending: submitMutation.isPending || imageUpload.isPending
  };
};
