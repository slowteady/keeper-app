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
import { resolveVideoUpload, useImageUpload, useVideoUpload } from '@/features/upload';
import { getModerationMessage, globalToast } from '@/shared/lib';

export const useCreateQnaPost = () => {
  const queryClient = useQueryClient();

  const form = useForm<CommunityQnaFormDto>({
    resolver: zodResolver(CommunityQnaFormSchema),
    mode: 'onChange',
    defaultValues: {
      type: QNA_CATEGORY_OPTIONS[0].value,
      animalType: undefined,
      title: '',
      content: '',
      images: [],
      video: null
    }
  });

  const imageUpload = useImageUpload();
  const videoUpload = useVideoUpload();
  const submitMutation = useMutation({
    mutationFn: async (data: CommunityQnaFormDto) => {
      const uploadedUrls = data.images && data.images.length > 0 ? await imageUpload.mutateAsync(data.images) : [];
      const videoResult = await resolveVideoUpload(data.video, (video) => videoUpload.mutateAsync({ video }));
      return communityApi.createQnaPost({
        type: data.type,
        animalType: data.animalType,
        title: data.title,
        content: data.content,
        images: uploadedUrls,
        videoUrl: videoResult?.videoUrl,
        videoThumbnailUrl: videoResult?.videoThumbnailUrl,
        videoDuration: videoResult?.videoDuration || undefined
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityQueries.all() });
      globalToast('글을 등록했어요', 'success');
      router.back();
    },
    onError: (error) => {
      globalToast(getModerationMessage(error) ?? '글을 등록하지 못했어요', 'fail');
    }
  });

  const handleSubmit = (data: CommunityQnaFormDto) => submitMutation.mutate(data);

  return {
    form,
    onSubmit: form.handleSubmit(handleSubmit),
    isPending: submitMutation.isPending || imageUpload.isPending || videoUpload.isPending
  };
};
