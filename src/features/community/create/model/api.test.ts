import { CommunityAdoptFormDto } from '@/entities/community';

import { toCreateAdoptionPersonalBody } from './api';

// 폼 데이터 → 백엔드 PostAdoptionPersonalRequest 매핑
// 핵심: contact → contacts(복수), NONE 옵셔널 처리, tags 빈 배열, 이미지는 presigned 결과 사용
const fullForm: CommunityAdoptFormDto = {
  title: '말티즈 가족 찾아요',
  animalType: 'DOG',
  specificType: '말티즈',
  images: ['file://1.jpg'],
  gender: 'M',
  neuterYn: 'Y',
  healthCheck: 'Y',
  age: '2023',
  weight: '5',
  location: '서울특별시',
  specialMark: '온순함',
  content: '소개글 본문',
  protectionType: 'ADOPTION',
  vaccinationCheck: 'THIRD',
  contact: [{ type: 'PHONE', value: '010-1234-5678' }],
  likes: '산책',
  dislikes: '소음',
  health: '피부 케어',
  relatedLink: 'https://example.com'
};

describe('toCreateAdoptionPersonalBody', () => {
  it('필드 기본 매핑이 정확하다 (contact → contacts 복수형)', () => {
    const body = toCreateAdoptionPersonalBody(fullForm, ['https://s3/1.jpg']);
    expect(body.category).toBe('ADOPTION_PERSONAL');
    expect(body.title).toBe('말티즈 가족 찾아요');
    expect(body.contacts).toEqual([{ type: 'PHONE', value: '010-1234-5678' }]);
    expect(body.tags).toEqual([]); // 백엔드 라벨 자동 생성과 별개로 빈 배열 송신
  });

  it('이미지는 form.images(local URI) 대신 uploadedImageUrls(presigned 결과) 를 송신한다', () => {
    const body = toCreateAdoptionPersonalBody(fullForm, ['https://s3/a.jpg', 'https://s3/b.jpg']);
    expect(body.images).toEqual(['https://s3/a.jpg', 'https://s3/b.jpg']);
    expect(body.images).not.toContain('file://1.jpg');
  });

  it('이미지가 없으면 빈 배열을 송신한다', () => {
    const body = toCreateAdoptionPersonalBody(fullForm, []);
    expect(body.images).toEqual([]);
  });

  describe('NONE 옵셔널 처리', () => {
    it('healthCheck NONE → undefined', () => {
      const body = toCreateAdoptionPersonalBody({ ...fullForm, healthCheck: 'NONE' }, []);
      expect(body.healthCheck).toBeUndefined();
    });

    it('healthCheck Y → 그대로 송신', () => {
      const body = toCreateAdoptionPersonalBody({ ...fullForm, healthCheck: 'Y' }, []);
      expect(body.healthCheck).toBe('Y');
    });

    it('vaccinationCheck NONE → undefined', () => {
      const body = toCreateAdoptionPersonalBody({ ...fullForm, vaccinationCheck: 'NONE' }, []);
      expect(body.vaccinationCheck).toBeUndefined();
    });

    it('vaccinationCheck THIRD → 그대로 송신', () => {
      const body = toCreateAdoptionPersonalBody({ ...fullForm, vaccinationCheck: 'THIRD' }, []);
      expect(body.vaccinationCheck).toBe('THIRD');
    });
  });

  describe('선택 입력 필드 — 빈 문자열은 undefined 로 변환', () => {
    it('likes 빈 문자열 → undefined', () => {
      const body = toCreateAdoptionPersonalBody({ ...fullForm, likes: '' }, []);
      expect(body.likes).toBeUndefined();
    });

    it('dislikes 채워짐 → 그대로 송신', () => {
      const body = toCreateAdoptionPersonalBody({ ...fullForm, dislikes: '큰 소음' }, []);
      expect(body.dislikes).toBe('큰 소음');
    });

    it('relatedLink 빈 문자열 → undefined', () => {
      const body = toCreateAdoptionPersonalBody({ ...fullForm, relatedLink: '' }, []);
      expect(body.relatedLink).toBeUndefined();
    });
  });

  describe('contact 매핑', () => {
    it('chip 3개(PHONE/EMAIL/SNS) 모두 contacts 배열로 매핑', () => {
      const body = toCreateAdoptionPersonalBody(
        {
          ...fullForm,
          contact: [
            { type: 'PHONE', value: '010-1234-5678' },
            { type: 'EMAIL', value: 'a@b.co' },
            { type: 'SNS', value: '@kakao_id' }
          ]
        },
        []
      );
      expect(body.contacts).toEqual([
        { type: 'PHONE', value: '010-1234-5678' },
        { type: 'EMAIL', value: 'a@b.co' },
        { type: 'SNS', value: '@kakao_id' }
      ]);
    });
  });
});
