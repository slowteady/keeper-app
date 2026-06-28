import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { inquiryApi, InquiryFormDto, inquiryQueries } from '@/entities/inquiry';
import { useImageUpload } from '@/features/upload';
import { globalToast, logger } from '@/shared/lib';

export const useCreateInquiry = () => {
  const queryClient = useQueryClient();
  const imageUpload = useImageUpload();

  const mutation = useMutation({
    retry: false,
    mutationFn: async (data: InquiryFormDto) => {
      const images = data.images.length > 0 ? await imageUpload.mutateAsync(data.images) : [];
      return inquiryApi.createInquiry({ ...data, images });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inquiryQueries.all() });
      globalToast('문의를 접수했어요', 'success');
      router.back();
    },
    onError: (error) => {
      logger.error(error);
      globalToast('문의를 접수하지 못했어요', 'fail');
    }
  });

  return {
    submit: (data: InquiryFormDto) => mutation.mutate(data),
    isPending: mutation.isPending || imageUpload.isPending
  };
};
