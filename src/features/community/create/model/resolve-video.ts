import { VideoUploadResult } from '@/features/upload';

type LocalVideo = { uri: string; thumbnailUri: string };

export const resolveVideoUpload = async (
  video: LocalVideo | null | undefined,
  upload: (video: LocalVideo) => Promise<VideoUploadResult>
): Promise<VideoUploadResult | null> => {
  if (!video) return null;
  if (video.uri.startsWith('http')) {
    return { videoUrl: video.uri, videoThumbnailUrl: video.thumbnailUri };
  }
  return upload(video);
};
