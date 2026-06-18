import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';

import { authQueries, updateMe } from '@/entities/auth';
import { useImageUpload } from '@/features/upload';
import { compressImage, globalToast } from '@/shared/lib';

const PROFILE_IMAGE_SIZE = 800;
const PROFILE_IMAGE_QUALITY = 0.75;

export const useProfileImage = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: uploadImages, isPending: isUploading } = useImageUpload();
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: updateMe,
    onSuccess: (res) => queryClient.setQueryData(authQueries.me().queryKey, res),
    onError: () => globalToast('프로필 사진을 변경하지 못했어요', 'fail')
  });

  const changeProfileImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const compressed = await compressImage({
      uri: asset.uri,
      sourceWidth: asset.width,
      sourceHeight: asset.height,
      square: true,
      size: PROFILE_IMAGE_SIZE,
      quality: PROFILE_IMAGE_QUALITY
    });

    try {
      const [publicUrl] = await uploadImages([compressed.uri]);
      if (!publicUrl) throw new Error('no public url');
      updateProfile({ image: publicUrl });
    } catch {
      globalToast('프로필 사진을 변경하지 못했어요', 'fail');
    }
  }, [uploadImages, updateProfile]);

  return { changeProfileImage, isPending: isUploading || isUpdating };
};
