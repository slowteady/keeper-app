import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBottomSheet } from '@/shared/ui';

import { ProfileImageSheet } from '../ui/profile-image-sheet';

export const useProfileImage = () => {
  const { bottom } = useSafeAreaInsets();
  const { present, dismiss } = useBottomSheet();

  const pickImage = useCallback(async () => {
    dismiss();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });

    if (!result.canceled && result.assets?.[0]) {
      const imageUri = result.assets[0].uri;
      // TODO: 프로필 이미지 업로드 API 호출
    }
  }, [dismiss]);

  const changeProfileImage = useCallback(() => {
    present(<ProfileImageSheet onConfirm={pickImage} bottomInset={bottom} />, { snapPoints: [240] });
  }, [bottom, pickImage, present]);

  return { changeProfileImage };
};
