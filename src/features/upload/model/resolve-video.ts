import { VideoUploadResult } from '@/features/upload';
import { MediaVideoDto } from '@/shared/model';

export type ResolvedVideo = VideoUploadResult & { videoDuration: number };

export const resolveVideoUpload = async (
  video: MediaVideoDto | null | undefined,
  upload: (video: MediaVideoDto) => Promise<VideoUploadResult>
): Promise<ResolvedVideo | null> => {
  if (!video) return null;
  if (video.uri.startsWith('http')) {
    return { videoUrl: video.uri, videoThumbnailUrl: video.thumbnailUri, videoDuration: video.duration };
  }
  return { ...(await upload(video)), videoDuration: video.duration };
};
