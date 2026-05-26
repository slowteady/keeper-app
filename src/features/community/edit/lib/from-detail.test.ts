import { CommunityAdoptDetailDto } from '@/entities/community';

import { fromAdoptionPersonalDetail } from './from-detail';

const base: CommunityAdoptDetailDto = {
  id: 1,
  user: { id: 1, image: '', nickname: 't' },
  displayTime: '',
  title: '제목',
  images: ['https://img/a.png'],
  content: '소개글',
  age: '2023',
  gender: 'F',
  weight: '5',
  animalType: 'DOG',
  specificType: '말티즈',
  location: '서울',
  healthCheck: 'Y',
  neuterYn: 'Y',
  vaccinationCheck: 'FIRST',
  protectionType: 'ADOPTION',
  specialMark: '겁이 많음',
  likes: '간식',
  dislikes: '천둥',
  health: '없음',
  relatedLink: 'https://x',
  rfid: null,
  contacts: [{ type: 'PHONE', value: '010-1' }],
  counts: { like: 0, view: 0, comment: 0 },
  isLiked: false
};

describe('fromAdoptionPersonalDetail', () => {
  it('contacts(복수) → contact(단수형 폼 필드)로 변환한다', () => {
    const form = fromAdoptionPersonalDetail({
      ...base,
      contacts: [
        { type: 'PHONE', value: '010-1111' },
        { type: 'EMAIL', value: 'a@b.com' }
      ]
    });

    expect(form.contact).toEqual([
      { type: 'PHONE', value: '010-1111' },
      { type: 'EMAIL', value: 'a@b.com' }
    ]);
  });

  it('선택 enum(healthCheck/vaccinationCheck) 이 null 이면 undefined 로 매핑한다 (미선택 상태)', () => {
    const form = fromAdoptionPersonalDetail({
      ...base,
      healthCheck: null,
      vaccinationCheck: null
    });

    expect(form.healthCheck).toBeUndefined();
    expect(form.vaccinationCheck).toBeUndefined();
  });

  it('선택 텍스트(특징/likes/dislikes/health/relatedLink) 가 null 이면 undefined 로 매핑한다', () => {
    const form = fromAdoptionPersonalDetail({
      ...base,
      specialMark: null,
      likes: null,
      dislikes: null,
      health: null,
      relatedLink: null
    });

    expect(form.specialMark).toBeUndefined();
    expect(form.likes).toBeUndefined();
    expect(form.dislikes).toBeUndefined();
    expect(form.health).toBeUndefined();
    expect(form.relatedLink).toBeUndefined();
  });

  it('필수 텍스트(content) 가 null 이면 빈 문자열로 fallback', () => {
    const form = fromAdoptionPersonalDetail({ ...base, content: null });
    expect(form.content).toBe('');
  });

  it('구버전 데이터 — 선택 enum 의 "NONE" 값을 undefined 로 정규화한다', () => {
    const form = fromAdoptionPersonalDetail({
      ...base,
      neuterYn: 'NONE',
      healthCheck: 'NONE',
      vaccinationCheck: 'NONE'
    });

    expect(form.neuterYn).toBeUndefined();
    expect(form.healthCheck).toBeUndefined();
    expect(form.vaccinationCheck).toBeUndefined();
  });

  it('images URL 배열을 그대로 보존한다 (수정 시 read-only — 재전송 용도)', () => {
    const form = fromAdoptionPersonalDetail({
      ...base,
      images: ['https://img/1.png', 'https://img/2.png']
    });

    expect(form.images).toEqual(['https://img/1.png', 'https://img/2.png']);
  });

  it('전 필드(animalType, gender, weight, age, location, specificType, neuterYn, protectionType, title) 를 그대로 전달한다', () => {
    const form = fromAdoptionPersonalDetail({
      ...base,
      animalType: 'CAT',
      gender: 'M',
      weight: '8',
      age: '2020',
      location: '부산',
      specificType: '코숏',
      neuterYn: 'N',
      protectionType: 'TEMPORARY',
      title: '입양 보냅니다'
    });

    expect(form.animalType).toBe('CAT');
    expect(form.gender).toBe('M');
    expect(form.weight).toBe('8');
    expect(form.age).toBe('2020');
    expect(form.location).toBe('부산');
    expect(form.specificType).toBe('코숏');
    expect(form.neuterYn).toBe('N');
    expect(form.protectionType).toBe('TEMPORARY');
    expect(form.title).toBe('입양 보냅니다');
  });
});
