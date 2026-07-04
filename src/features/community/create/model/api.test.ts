import { CommunityAdoptFormDto } from '@/entities/community';
import { authApi } from '@/shared/api/instance';

import { toCreateAdoptionPersonalBody, updateAdoptionPersonal } from './api';

jest.mock('@/shared/api/instance', () => ({
  authApi: { patch: jest.fn(), post: jest.fn() }
}));

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
  content: '소개글 본문',
  protectionType: 'ADOPTION',
  vaccinationCheck: 'THIRD',
  contact: [{ type: 'PHONE', value: '010-1234-5678' }],
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

  describe('video 매핑', () => {
    it('video 미전달 시 videoUrl/videoThumbnailUrl undefined', () => {
      const body = toCreateAdoptionPersonalBody(fullForm, ['https://s3/1.jpg']);
      expect(body.videoUrl).toBeUndefined();
      expect(body.videoThumbnailUrl).toBeUndefined();
    });

    it('video 전달 시 videoUrl/videoThumbnailUrl 매핑', () => {
      const body = toCreateAdoptionPersonalBody(fullForm, ['https://s3/1.jpg'], {
        videoUrl: 'https://r2/videos/v.mp4',
        videoThumbnailUrl: 'https://r2/videos/v.jpg'
      });
      expect(body.videoUrl).toBe('https://r2/videos/v.mp4');
      expect(body.videoThumbnailUrl).toBe('https://r2/videos/v.jpg');
    });

    it('video null 전달 시 undefined (영상 삭제)', () => {
      const body = toCreateAdoptionPersonalBody(fullForm, [], null);
      expect(body.videoUrl).toBeUndefined();
      expect(body.videoThumbnailUrl).toBeUndefined();
    });
  });

  describe('선택 enum 처리 (BP: chip 미선택 = undefined)', () => {
    it('healthCheck undefined → undefined', () => {
      const body = toCreateAdoptionPersonalBody({ ...fullForm, healthCheck: undefined }, []);
      expect(body.healthCheck).toBeUndefined();
    });

    it('healthCheck Y → 그대로 송신', () => {
      const body = toCreateAdoptionPersonalBody({ ...fullForm, healthCheck: 'Y' }, []);
      expect(body.healthCheck).toBe('Y');
    });

    it('vaccinationCheck undefined → undefined', () => {
      const body = toCreateAdoptionPersonalBody({ ...fullForm, vaccinationCheck: undefined }, []);
      expect(body.vaccinationCheck).toBeUndefined();
    });

    it('vaccinationCheck THIRD → 그대로 송신', () => {
      const body = toCreateAdoptionPersonalBody({ ...fullForm, vaccinationCheck: 'THIRD' }, []);
      expect(body.vaccinationCheck).toBe('THIRD');
    });
  });

  describe('선택 입력 필드 — 빈 문자열은 undefined 로 변환', () => {
    it('relatedLink 빈 문자열 → undefined', () => {
      const body = toCreateAdoptionPersonalBody({ ...fullForm, relatedLink: '' }, []);
      expect(body.relatedLink).toBeUndefined();
    });
  });

  describe('행동 필드 — chip 미선택(undefined)과 선택값 매핑', () => {
    it('toiletTraining undefined → undefined', () => {
      const body = toCreateAdoptionPersonalBody({ ...fullForm, toiletTraining: undefined }, []);
      expect(body.toiletTraining).toBeUndefined();
    });

    it('toiletTraining COMPLETE → 그대로 송신', () => {
      const body = toCreateAdoptionPersonalBody({ ...fullForm, toiletTraining: 'COMPLETE' }, []);
      expect(body.toiletTraining).toBe('COMPLETE');
    });

    it('activityLevel VERY_ACTIVE → 그대로 송신', () => {
      const body = toCreateAdoptionPersonalBody({ ...fullForm, activityLevel: 'VERY_ACTIVE' }, []);
      expect(body.activityLevel).toBe('VERY_ACTIVE');
    });

    it('withDogs SHY → 그대로 송신', () => {
      const body = toCreateAdoptionPersonalBody({ ...fullForm, withDogs: 'SHY' }, []);
      expect(body.withDogs).toBe('SHY');
    });

    it('withCats undefined → undefined (미선택 상태 보존)', () => {
      const body = toCreateAdoptionPersonalBody({ ...fullForm, withCats: undefined }, []);
      expect(body.withCats).toBeUndefined();
    });
  });

  describe('updateAdoptionPersonal', () => {
    const detailResponse = {
      id: '42',
      user: { id: '1', image: '', nickname: 't' },
      displayTime: '',
      title: '말티즈 가족 찾아요',
      images: ['https://s3/1.jpg'],
      content: '소개글',
      age: '2023',
      gender: 'M',
      weight: '5',
      animalType: 'DOG',
      specificType: '말티즈',
      location: '서울',
      healthCheck: 'Y',
      neuterYn: 'Y',
      vaccinationCheck: 'THIRD',
      protectionType: 'ADOPTION',
      health: null,
      relatedLink: null,
      rfid: null,
      hasContact: true,
      contacts: [{ type: 'PHONE', value: '010-1234-5678' }],
      counts: { like: 0, view: 0, comment: 0 },
      isLiked: false
    };

    beforeEach(() => {
      (authApi.patch as jest.Mock).mockReset();
    });

    it('PATCH /community/posts/adoption-personal/:id 로 요청한다', async () => {
      (authApi.patch as jest.Mock).mockResolvedValue({ data: { data: detailResponse } });
      const body = toCreateAdoptionPersonalBody(fullForm, ['https://s3/1.jpg']);

      await updateAdoptionPersonal('42', body);

      expect(authApi.patch).toHaveBeenCalledWith('/community/posts/adoption-personal/42', body);
    });

    it('응답을 CommunityAdoptDetailSchema 로 parse 한 결과를 반환한다', async () => {
      (authApi.patch as jest.Mock).mockResolvedValue({ data: { data: detailResponse } });
      const body = toCreateAdoptionPersonalBody(fullForm, ['https://s3/1.jpg']);

      const result = await updateAdoptionPersonal('42', body);

      expect(result.id).toBe('42');
      expect(result.title).toBe('말티즈 가족 찾아요');
      expect(result.contacts).toEqual([{ type: 'PHONE', value: '010-1234-5678' }]);
    });

    it('백엔드 응답이 스키마와 다르면 parse 가 throw 한다 (안전성 확인)', async () => {
      (authApi.patch as jest.Mock).mockResolvedValue({ data: { data: { id: 'not-a-number' } } });
      const body = toCreateAdoptionPersonalBody(fullForm, []);

      await expect(updateAdoptionPersonal('42', body)).rejects.toThrow();
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
