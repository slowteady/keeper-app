import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useCallback } from 'react';
import VideoTrim, { isValidFile, showEditor } from 'react-native-video-trim';

import { globalToast, logger } from '@/shared/lib';

const TRIM_MAX_MS = 30000;

export type PickedVideo = { uri: string; thumbnailUri: string; duration: number };
export type PickedMedia = { images: string[]; video: PickedVideo | null };

const trimVideo = (uri: string): Promise<string | null> =>
  new Promise((resolve) => {
    const subs: { remove: () => void }[] = [];
    const cleanup = () => subs.forEach((sub) => sub.remove());
    subs.push(
      VideoTrim.onFinishTrimming(({ outputPath }: { outputPath: string }) => {
        cleanup();
        resolve(outputPath);
      }),
      VideoTrim.onCancel(() => {
        cleanup();
        resolve(null);
      }),
      VideoTrim.onError(() => {
        cleanup();
        resolve(null);
      })
    );
    showEditor(uri, { maxDuration: TRIM_MAX_MS, enableSaveDialog: false });
  });

const generateThumbnail = async (uri: string): Promise<string> => {
  const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(uri, { time: 0, quality: 0.8 });
  return thumbnailUri;
};

export const useMediaPicker = () => {
  const pickMedia = useCallback(async (): Promise<PickedMedia> => {
    const empty: PickedMedia = { images: [], video: null };
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.8
      });
      if (result.canceled || !result.assets?.length) return empty;

      const images = result.assets.filter((asset) => asset.type !== 'video').map((asset) => asset.uri);
      const videos = result.assets.filter((asset) => asset.type === 'video');
      if (videos.length === 0) return { images, video: null };
      if (videos.length > 1) globalToast('영상은 한 개만 첨부할 수 있어요', 'fail');

      const source = videos[0];
      const validation = await isValidFile(source.uri);
      if (!validation?.isValid) {
        globalToast('첨부할 수 없는 영상이에요', 'fail');
        return { images, video: null };
      }

      const trimmedUri = await trimVideo(source.uri);
      if (!trimmedUri) return { images, video: null };

      const trimmedInfo = await isValidFile(trimmedUri);
      const duration = Math.round((trimmedInfo?.duration ?? 0) / 1000);
      const thumbnailUri = await generateThumbnail(trimmedUri);
      return { images, video: { uri: trimmedUri, thumbnailUri, duration } };
    } catch (error) {
      logger.error(error);
      globalToast('미디어를 불러오지 못했어요', 'fail');
      return empty;
    }
  }, []);

  return { pickMedia };
};
