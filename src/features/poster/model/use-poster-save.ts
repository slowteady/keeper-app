import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useState } from 'react';

import { globalToast } from '@/shared/lib';

export const usePosterSave = () => {
  const [isSaving, setIsSaving] = useState(false);

  const save = async (url: string, desertionNo: string) => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync(true);
      if (!permission.granted) {
        globalToast('사진 접근 권한이 필요해요', 'fail');
        return;
      }

      const destination = new File(Paths.cache, `keeper-poster-${desertionNo}.png`);
      if (destination.exists) {
        destination.delete();
      }
      const file = await File.downloadFileAsync(url, destination);
      await MediaLibrary.saveToLibraryAsync(file.uri);
      globalToast('포스터를 저장했어요', 'success');
    } catch {
      globalToast('포스터를 저장하지 못했어요', 'fail');
    } finally {
      setIsSaving(false);
    }
  };

  return { save, isSaving };
};
