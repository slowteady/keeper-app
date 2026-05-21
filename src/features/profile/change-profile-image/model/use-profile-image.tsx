import { BottomSheetFooter } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';

import { compressImage } from '@/shared/lib';
import { useBottomSheet } from '@/shared/ui';

import { ProfileImageSheet, ProfileImageSheetFooterButton } from '../ui/profile-image-sheet';

const PROFILE_IMAGE_SIZE = 800;
const PROFILE_IMAGE_QUALITY = 0.75;

export const useProfileImage = () => {
  const { present, dismiss } = useBottomSheet();

  const pickImage = useCallback(async () => {
    dismiss();
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

    // TODO: presign 발급 → S3 PUT(compressed.uri) → PATCH /auth/me
    void compressed;
  }, [dismiss]);

  const changeProfileImage = useCallback(() => {
    present(<ProfileImageSheet />, {
      snapPoints: [240],
      footerComponent: (footerProps) => (
        <BottomSheetFooter {...footerProps} bottomInset={0}>
          <ProfileImageSheetFooterButton onConfirm={pickImage} />
        </BottomSheetFooter>
      )
    });
  }, [pickImage, present]);

  return { changeProfileImage };
};
