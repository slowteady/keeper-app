import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useCallback } from 'react';
import VideoTrim, { isValidFile, showEditor } from 'react-native-video-trim';

import { MediaVideoDto } from '@/entities/community';
import { globalToast, logger } from '@/shared/lib';

const TRIM_MAX_MS = 30000;

export type PickedMedia = { images: string[]; video: MediaVideoDto | null };

type TrimResult = { status: 'done'; uri: string } | { status: 'canceled' } | { status: 'error' };

const trimVideo = (uri: string): Promise<TrimResult> =>
  new Promise((resolve) => {
    const subs: { remove: () => void }[] = [];
    const cleanup = () => subs.forEach((sub) => sub.remove());
    subs.push(
      VideoTrim.onFinishTrimming(({ outputPath }: { outputPath: string }) => {
        cleanup();
        resolve({ status: 'done', uri: outputPath });
      }),
      VideoTrim.onCancel(() => {
        cleanup();
        resolve({ status: 'canceled' });
      }),
      VideoTrim.onError(() => {
        cleanup();
        resolve({ status: 'error' });
      })
    );
    showEditor(uri, { maxDuration: TRIM_MAX_MS, enableSaveDialog: false });
  });

const generateThumbnail = async (uri: string, durationMs: number): Promise<string> => {
  const time = durationMs > 0 ? Math.min(1000, Math.floor(durationMs / 2)) : 1000;
  const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(uri, { time, quality: 0.8 });
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

      const trim = await trimVideo(source.uri);
      if (trim.status === 'canceled') return { images, video: null };
      if (trim.status === 'error') {
        globalToast('영상을 편집하지 못했어요. 다시 시도해 주세요', 'fail');
        return { images, video: null };
      }

      const trimmedUri = trim.uri;
      const trimmedInfo = await isValidFile(trimmedUri);
      const duration = Math.round((trimmedInfo?.duration ?? 0) / 1000);

      let thumbnailUri: string;
      try {
        thumbnailUri = await generateThumbnail(trimmedUri, trimmedInfo?.duration ?? 0);
      } catch (error) {
        logger.error(error);
        globalToast('영상 미리보기를 만들지 못했어요. 영상 앞부분을 살짝 잘라내고 다시 시도해 주세요', 'fail');
        return { images, video: null };
      }

      return { images, video: { uri: trimmedUri, thumbnailUri, duration } };
    } catch (error) {
      logger.error(error);
      globalToast('미디어를 불러오지 못했어요', 'fail');
      return empty;
    }
  }, []);

  return { pickMedia };
};
