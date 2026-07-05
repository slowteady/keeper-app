import { useMutation } from '@tanstack/react-query';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Video } from 'react-native-compressor';

import { getPresignedUrls } from '@/entities/upload';

const VIDEO_MAX_SIZE = 720;
const VIDEO_BITRATE = 2_000_000;

type LocalVideo = { uri: string; thumbnailUri: string };
export type VideoUploadResult = { videoUrl: string; videoThumbnailUrl: string };
type VideoUploadVars = { video: LocalVideo; onProgress?: (progress: number) => void };

const compressVideo = async (uri: string, onProgress?: (progress: number) => void): Promise<string> => {
  try {
    return await Video.compress(
      uri,
      { compressionMethod: 'manual', maxSize: VIDEO_MAX_SIZE, bitrate: VIDEO_BITRATE },
      (progress) => onProgress?.(progress)
    );
  } catch {
    return uri;
  }
};

const toJpeg = async (uri: string): Promise<string> => {
  const rendered = await ImageManipulator.manipulate(uri).renderAsync();
  const result = await rendered.saveAsync({ format: SaveFormat.JPEG });
  return result.uri;
};

const putFile = async (uploadUrl: string, uri: string, contentType: string) => {
  const blob = await fetch(uri).then((r) => r.blob());
  const res = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: blob });
  if (!res.ok) {
    throw new Error(`upload failed: ${res.status}`);
  }
};

const uploadVideo = async ({ video, onProgress }: VideoUploadVars): Promise<VideoUploadResult> => {
  const [compressedUri, thumbnailUri] = await Promise.all([
    compressVideo(video.uri, onProgress),
    toJpeg(video.thumbnailUri)
  ]);

  const [videoPresign, thumbPresign] = await Promise.all([
    getPresignedUrls({ count: 1, mediaType: 'video' }),
    getPresignedUrls({ count: 1, mediaType: 'image' })
  ]);
  const videoItem = videoPresign.data.data.items[0];
  const thumbItem = thumbPresign.data.data.items[0];

  await Promise.all([
    putFile(videoItem.uploadUrl, compressedUri, 'video/mp4'),
    putFile(thumbItem.uploadUrl, thumbnailUri, 'image/jpeg')
  ]);

  return { videoUrl: videoItem.publicUrl, videoThumbnailUrl: thumbItem.publicUrl };
};

export const useVideoUpload = () => useMutation({ mutationFn: uploadVideo });
