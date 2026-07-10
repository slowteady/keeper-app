import { useMutation } from '@tanstack/react-query';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { compress } from 'react-native-video-trim';

import { getPresignedUrls } from '@/entities/upload';
import { toFileUri } from '@/shared/lib';

const VIDEO_MAX_SIZE = 720;
const VIDEO_BITRATE = 2_000_000;

type LocalVideo = { uri: string; thumbnailUri: string };
type Thumbnail = { uri: string; portrait: boolean };
export type VideoUploadResult = { videoUrl: string; videoThumbnailUrl: string };
type VideoUploadVars = { video: LocalVideo };

const compressVideo = async (uri: string, portrait: boolean): Promise<string> => {
  try {
    const { outputPath } = await compress(uri, {
      bitrate: VIDEO_BITRATE,
      width: portrait ? -1 : VIDEO_MAX_SIZE,
      height: portrait ? VIDEO_MAX_SIZE : -1
    });
    return toFileUri(outputPath);
  } catch {
    return uri;
  }
};

const toJpeg = async (uri: string): Promise<Thumbnail> => {
  const rendered = await ImageManipulator.manipulate(uri).renderAsync();
  const result = await rendered.saveAsync({ format: SaveFormat.JPEG });
  return { uri: result.uri, portrait: rendered.height > rendered.width };
};

const putFile = async (uploadUrl: string, uri: string, contentType: string) => {
  const blob = await fetch(uri).then((r) => r.blob());
  const res = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: blob });
  if (!res.ok) {
    throw new Error(`upload failed: ${res.status}`);
  }
};

const uploadVideo = async ({ video }: VideoUploadVars): Promise<VideoUploadResult> => {
  const thumbnail = await toJpeg(video.thumbnailUri);

  const [compressedUri, videoPresign, thumbPresign] = await Promise.all([
    compressVideo(video.uri, thumbnail.portrait),
    getPresignedUrls({ count: 1, mediaType: 'video' }),
    getPresignedUrls({ count: 1, mediaType: 'image' })
  ]);
  const videoItem = videoPresign.data.data.items[0];
  const thumbItem = thumbPresign.data.data.items[0];

  await Promise.all([
    putFile(videoItem.uploadUrl, compressedUri, 'video/mp4'),
    putFile(thumbItem.uploadUrl, thumbnail.uri, 'image/jpeg')
  ]);

  return { videoUrl: videoItem.publicUrl, videoThumbnailUrl: thumbItem.publicUrl };
};

export const useVideoUpload = () => useMutation({ mutationFn: uploadVideo });
