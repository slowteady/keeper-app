import { CommunityAdoptDetailDto } from '@/entities/community';

import { convertToAdoptDetailOverviewData } from './mapper';

const baseDetail: CommunityAdoptDetailDto = {
  id: '1',
  user: { id: '10', nickname: '닉네임', image: '' },
  displayTime: '방금',
  title: '말티즈 뭉치 가족 찾아요',
  images: ['https://example.com/a.jpg'],
  content: '내용',
  animalType: 'DOG',
  specificType: '말티즈',
  location: '서울',
  age: '2023',
  gender: 'M',
  weight: '4',
  neuterYn: 'Y',
  vaccinationCheck: 'FIRST',
  healthCheck: 'Y',
  protectionType: 'ADOPTION',
  specialMark: null,
  likes: null,
  dislikes: null,
  health: null,
  relatedLink: null,
  rfid: null,
  contacts: [],
  counts: { like: 0, view: 0, comment: 0 },
  isLiked: true
};

describe('convertToAdoptDetailOverviewData', () => {
  it('detailPost.isLiked 를 overview 에 포함시킨다 — detail 헤더 하트가 list 와 sync 되어야 함', () => {
    const result = convertToAdoptDetailOverviewData(baseDetail);
    expect(result.isLiked).toBe(true);
  });

  it('isLiked=false 도 그대로 전달한다', () => {
    const result = convertToAdoptDetailOverviewData({ ...baseDetail, isLiked: false });
    expect(result.isLiked).toBe(false);
  });
});
