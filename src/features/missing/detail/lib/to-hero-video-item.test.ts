import { MissingDetailDto } from '@/entities/missing';

import { hasHeroMedia, toHeroVideoItem } from './to-hero-video-item';

const BASE = {
  images: [],
  videoUrl: null,
  videoThumbnailUrl: null
} as unknown as MissingDetailDto;

describe('toHeroVideoItem', () => {
  it('영상이 없으면 null', () => {
    expect(toHeroVideoItem(BASE)).toBeNull();
  });

  it('영상이 있으면 재생용 아이템을 만든다', () => {
    const item = toHeroVideoItem({
      ...BASE,
      videoUrl: 'https://cdn/v.mp4',
      videoThumbnailUrl: 'https://cdn/v.jpg'
    });
    expect(item).toEqual({ videoUrl: 'https://cdn/v.mp4', thumbnailUrl: 'https://cdn/v.jpg' });
  });

  it('썸네일이 없으면 undefined 로 넘긴다', () => {
    const item = toHeroVideoItem({ ...BASE, videoUrl: 'https://cdn/v.mp4' });
    expect(item?.thumbnailUrl).toBeUndefined();
  });
});

describe('hasHeroMedia', () => {
  it('사진도 영상도 없으면 false', () => {
    expect(hasHeroMedia(BASE)).toBe(false);
  });

  it('사진만 있으면 true', () => {
    expect(hasHeroMedia({ ...BASE, images: ['https://cdn/a.jpg'] })).toBe(true);
  });

  it('영상만 있어도 true (사진 없는 영상 단독 등록 대응)', () => {
    expect(hasHeroMedia({ ...BASE, videoUrl: 'https://cdn/v.mp4' })).toBe(true);
  });
});
