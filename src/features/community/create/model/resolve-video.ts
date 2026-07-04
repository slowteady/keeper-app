import { VideoUploadResult } from '@/features/upload';

type LocalVideo = { uri: string; thumbnailUri: string; duration: number };
export type ResolvedVideo = VideoUploadResult & { videoDuration: number };

export const resolveVideoUpload = async (
  video: LocalVideo | null | undefined,
  upload: (video: LocalVideo) => Promise<VideoUploadResult>
): Promise<ResolvedVideo | null> => {
  if (!video) return null;
  if (video.uri.startsWith('http')) {
    return { videoUrl: video.uri, videoThumbnailUrl: video.thumbnailUri, videoDuration: video.duration };
  }
  return { ...(await upload(video)), videoDuration: video.duration };
};
