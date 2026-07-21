import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { missingApi, MissingCreateFormDto, MissingCreateFormSchema, missingQueries } from '@/entities/missing';
import { resolveRegionFromPlace, useLocationBottomSheet } from '@/features/address';
import { toMissingCreateBody } from '@/features/missing/create/model';
import { resolveVideoUpload, useImageUpload, useVideoUpload } from '@/features/upload';
import { getModerationMessage, globalToast, logger } from '@/shared/lib';
import { useAnimalFormSelectors } from '@/shared/ui/form';

import { fromMissingDetail } from '../lib/from-detail';

class MediaUploadError extends Error {}

export const useEditMissing = (id: string) => {
  const queryClient = useQueryClient();
  const { data: detail } = useSuspenseQuery(missingQueries.userDetail(id));

  const form = useForm<MissingCreateFormDto>({
    resolver: zodResolver(MissingCreateFormSchema),
    mode: 'onChange',
    defaultValues: fromMissingDetail(detail, detail.contacts ?? [])
  });

  const animalType = useWatch({ control: form.control, name: 'animalType' });

  const prevAnimalTypeRef = useRef(animalType);
  useEffect(() => {
    if (prevAnimalTypeRef.current !== animalType) {
      form.setValue('specificType', '', { shouldDirty: true });
      prevAnimalTypeRef.current = animalType;
    }
  }, [animalType, form]);

  const { openAgeSelector, openKindSelector } = useAnimalFormSelectors(form, animalType);

  const regionPending = useRef<Promise<void> | null>(null);

  const location = useLocationBottomSheet((selected) => {
    form.setValue('address', selected.road_address_name || selected.address_name, { shouldDirty: true });
    form.setValue('lat', Number(selected.y), { shouldDirty: true });
    form.setValue('lng', Number(selected.x), { shouldDirty: true });
    form.setValue('regionCode', null);
    regionPending.current = resolveRegionFromPlace(selected)
      .then(({ regionCode }) => {
        if (regionCode) form.setValue('regionCode', regionCode, { shouldDirty: true });
      })
      .catch((error) => logger.warn('실종 수정 regionCode 해석 실패', error));
  });

  const imageUpload = useImageUpload();
  const videoUpload = useVideoUpload();

  const submitMutation = useMutation({
    mutationFn: async (data: MissingCreateFormDto) => {
      await regionPending.current;

      let images: string[] = [];
      let videoResult = null;
      try {
        const localUris = data.images.filter((uri) => !uri.startsWith('http'));
        const uploaded = localUris.length > 0 ? await imageUpload.mutateAsync(localUris) : [];
        let next = 0;
        images = data.images.map((uri) => (uri.startsWith('http') ? uri : uploaded[next++]));
        videoResult = await resolveVideoUpload(data.video, (video) => videoUpload.mutateAsync({ video }));
      } catch (error) {
        throw new MediaUploadError(error instanceof Error ? error.message : '업로드 실패');
      }

      const resolved = { ...data, regionCode: form.getValues('regionCode') };
      return missingApi.update(id, toMissingCreateBody(resolved, images, videoResult));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: missingQueries.all() });
      globalToast('실종 신고를 수정했어요', 'success');
      router.back();
    },
    onError: (error) => {
      if (error instanceof MediaUploadError) {
        globalToast('사진·동영상을 업로드하지 못했어요. 다시 시도해 주세요', 'fail');
        return;
      }
      globalToast(getModerationMessage(error) ?? '실종 신고를 수정하지 못했어요', 'fail');
    }
  });

  const handleSubmit = (data: MissingCreateFormDto) => submitMutation.mutate(data);

  return {
    form,
    location,
    isSubmitting: submitMutation.isPending,
    actions: { handleSubmit, openAgeSelector, openKindSelector }
  };
};
