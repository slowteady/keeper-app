import { CommunityAdoptDetailDto } from '@/entities/community';

import { convertToAdoptDetailBehaviorData, convertToAdoptDetailOverviewData } from './mapper';

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
  health: null,
  relatedLink: null,
  rfid: null,
  hasContact: false,
  contacts: [],
  counts: { like: 0, view: 0, comment: 0 },
  isLiked: true
};

describe('convertToAdoptDetailBehaviorData', () => {
  it('행동 필드 전부 null/undefined 이면 빈 배열', () => {
    const result = convertToAdoptDetailBehaviorData(baseDetail);
    expect(result).toEqual([]);
  });

  it('채워진 필드만 포함 — null 필드는 스킵', () => {
    const result = convertToAdoptDetailBehaviorData({
      ...baseDetail,
      toiletTraining: 'COMPLETE',
      barking: 'OFTEN'
    });
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ label: '배변훈련', value: '완료' });
    expect(result[1]).toEqual({ label: '짖음', value: '자주' });
  });

  it('표시 순서: 배변훈련 → 혼자 있기 → 짖음 → 활동량 → 아이와 → 강아지와 → 고양이와', () => {
    const result = convertToAdoptDetailBehaviorData({
      ...baseDetail,
      toiletTraining: 'COMPLETE',
      separationAnxiety: 'NONE',
      barking: 'NONE',
      activityLevel: 'NORMAL',
      withChildren: 'GOOD',
      withDogs: 'GOOD',
      withCats: 'GOOD'
    });
    expect(result.map((i) => i.label)).toEqual([
      '배변훈련',
      '혼자 있기',
      '짖음',
      '활동량',
      '아이와',
      '강아지와',
      '고양이와'
    ]);
  });

  it('사회성: GOOD→잘 지내요 / SHY→낯가림 있어요 / HARD→어려워요', () => {
    const result = convertToAdoptDetailBehaviorData({
      ...baseDetail,
      withChildren: 'GOOD',
      withDogs: 'SHY',
      withCats: 'HARD'
    });
    expect(result.find((i) => i.label === '아이와')?.value).toBe('잘 지내요');
    expect(result.find((i) => i.label === '강아지와')?.value).toBe('낯가림 있어요');
    expect(result.find((i) => i.label === '고양이와')?.value).toBe('어려워요');
  });

  it('activityLevel VERY_ACTIVE → 매우 활발', () => {
    const result = convertToAdoptDetailBehaviorData({ ...baseDetail, activityLevel: 'VERY_ACTIVE' });
    expect(result).toEqual([{ label: '활동량', value: '매우 활발' }]);
  });

  it('separationAnxiety SEVERE → 힘들어요', () => {
    const result = convertToAdoptDetailBehaviorData({ ...baseDetail, separationAnxiety: 'SEVERE' });
    expect(result).toEqual([{ label: '혼자 있기', value: '힘들어요' }]);
  });
});

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
