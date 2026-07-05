import { CommunityQnaDetailDto } from '@/entities/community';

import { convertToQnaDetailOverviewData } from './mapper';

const base: CommunityQnaDetailDto = {
  id: 'q1',
  user: { id: 'u1', nickname: '닉', image: 'img', isAdmin: false },
  displayTime: '2026-07-01T00:00:00.000Z',
  title: '질문',
  content: '내용',
  qnaType: 'HEALTH',
  animalType: 'DOG',
  images: ['https://img/a.jpg'],
  counts: { like: 0, view: 0, comment: 0 },
  isLiked: false
};

describe('convertToQnaDetailOverviewData', () => {
  it('영상 있으면 videoItem 으로 매핑', () => {
    const overview = convertToQnaDetailOverviewData({
      ...base,
      videoUrl: 'https://r2/videos/q.mp4',
      videoThumbnailUrl: 'https://r2/videos/q.jpg',
      videoDuration: 18
    });

    expect(overview.videoItem).toEqual({
      videoUrl: 'https://r2/videos/q.mp4',
      thumbnailUrl: 'https://r2/videos/q.jpg'
    });
  });

  it('영상 없으면 videoItem 은 null (하위호환)', () => {
    const overview = convertToQnaDetailOverviewData(base);
    expect(overview.videoItem).toBeNull();
  });
});
