import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { communityApi, CommunityQnaFormDto, CommunityQnaFormSchema, communityQueries } from '@/entities/community';
import { useImageUpload } from '@/features/upload';
import { globalToast } from '@/shared/lib';

export const useUpdateQnaPost = (id: number) => {
  const queryClient = useQueryClient();
  // edit 라우트가 category 분기 후 진입 → QNA 만 도달. 판별 query(communityQueries.detail)와 캐시 공유.
  const { data } = useSuspenseQuery(communityQueries.detail(id));
  const detail = data.kind === 'QNA' ? data.qna : undefined;

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
      // 신규 local URI 만 업로드 (CloudFront publicUrl 은 https 로만 시작 — 명시적 검사)
      const existing = (data.images ?? []).filter((u) => u.startsWith('https://'));
      const localUris = (data.images ?? []).filter((u) => !u.startsWith('https://'));
      const uploaded = localUris.length > 0 ? await imageUpload.mutateAsync(localUris) : [];
      return communityApi.updateQnaPost(id, { ...data, images: [...existing, ...uploaded] });
    },
    onSuccess: (updated) => {
      // edit 는 detail 에서 push 로 진입 → back 으로 원래 detail 복귀 (replace 면 스택 중복).
      // detail 캐시 즉시 갱신 + 전체 무효화 (list/detail 정합).
      queryClient.setQueryData(communityQueries.detail(id).queryKey, { kind: 'QNA' as const, qna: updated });
      queryClient.invalidateQueries({ queryKey: communityQueries.all() });
      router.back();
    },
    onError: () => {
      globalToast('수정에 실패했어요. 잠시 후 다시 시도해주세요', 'fail');
    }
  });

  const handleSubmit = (data: CommunityQnaFormDto) => submitMutation.mutate(data);

  return {
    form,
    onSubmit: form.handleSubmit(handleSubmit),
    isPending: submitMutation.isPending || imageUpload.isPending
  };
};
