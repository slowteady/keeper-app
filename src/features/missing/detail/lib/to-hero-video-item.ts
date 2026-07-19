import { MissingDetailDto } from '@/entities/missing';
import { CarouselVideoItem } from '@/shared/ui';

export const toHeroVideoItem = (missing: MissingDetailDto): CarouselVideoItem | null =>
  missing.videoUrl ? { videoUrl: missing.videoUrl, thumbnailUrl: missing.videoThumbnailUrl ?? undefined } : null;

export const hasHeroMedia = (missing: MissingDetailDto): boolean => missing.images.length > 0 || !!missing.videoUrl;
