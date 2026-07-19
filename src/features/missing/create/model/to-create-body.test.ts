import { MissingCreateFormDto } from '@/entities/missing';

import { toMissingCreateBody } from './to-create-body';

const FORM: MissingCreateFormDto = {
  images: ['file:///local/a.jpg'],
  video: null,
  animalType: 'DOG',
  name: '초코',
  specificType: '말티즈',
  hasIdTag: 'Y',
  colorFeature: '흰색 곱슬',
  lostAt: '2026-07-01T00:00:00.000Z',
  lat: 37.5,
  lng: 127.03,
  address: '서울특별시 강남구',
  regionCode: '1168010100',
  contact: [{ type: 'PHONE', value: '010-1234-5678' }]
};

describe('toMissingCreateBody', () => {
  it('업로드된 URL 로 images 를 교체한다', () => {
    const body = toMissingCreateBody(FORM, ['https://cdn/a.jpg']);
    expect(body.images).toEqual(['https://cdn/a.jpg']);
  });

  it('폼 필드를 그대로 옮긴다', () => {
    const body = toMissingCreateBody(FORM, ['https://cdn/a.jpg']);
    expect(body).toMatchObject({
      animalType: 'DOG',
      colorFeature: '흰색 곱슬',
      lostAt: '2026-07-01T00:00:00.000Z',
      lat: 37.5,
      lng: 127.03,
      address: '서울특별시 강남구',
      regionCode: '1168010100'
    });
  });

  it('연락처를 contacts 로 옮기고 값을 trim 한다', () => {
    const body = toMissingCreateBody({ ...FORM, contact: [{ type: 'PHONE', value: ' 010-1234-5678 ' }] }, [
      'https://cdn/a.jpg'
    ]);
    expect(body.contacts).toEqual([{ type: 'PHONE', value: '010-1234-5678' }]);
  });

  it('여러 연락 수단을 모두 옮긴다', () => {
    const body = toMissingCreateBody(
      {
        ...FORM,
        contact: [
          { type: 'PHONE', value: '010-1234-5678' },
          { type: 'SNS', value: 'https://open.kakao.com/x' }
        ]
      },
      ['https://cdn/a.jpg']
    );
    expect(body.contacts).toHaveLength(2);
  });

  it('regionCode 미해석 시 null 로 보낸다 (백엔드 DTO 가 nullish 여야 함)', () => {
    const body = toMissingCreateBody({ ...FORM, regionCode: null }, ['https://cdn/a.jpg']);
    expect(body.regionCode).toBeNull();
  });

  it('사례금 필드는 body 에 존재하지 않는다', () => {
    const body = toMissingCreateBody(FORM, ['https://cdn/a.jpg']);
    expect(body).not.toHaveProperty('reward');
  });

  it('영상이 있으면 video 필드를 채운다', () => {
    const body = toMissingCreateBody(FORM, ['https://cdn/a.jpg'], {
      videoUrl: 'https://cdn/v.mp4',
      videoThumbnailUrl: 'https://cdn/v.jpg',
      videoDuration: 12
    });
    expect(body).toMatchObject({
      videoUrl: 'https://cdn/v.mp4',
      videoThumbnailUrl: 'https://cdn/v.jpg',
      videoDuration: 12
    });
  });

  it('영상이 없으면 video 필드는 undefined', () => {
    const body = toMissingCreateBody(FORM, ['https://cdn/a.jpg'], null);
    expect(body.videoUrl).toBeUndefined();
    expect(body.videoDuration).toBeUndefined();
  });

  it('필수 아이 정보를 trim 해서 옮긴다', () => {
    const body = toMissingCreateBody({ ...FORM, name: ' 초코 ', specificType: ' 말티즈 ' }, ['https://cdn/a.jpg']);
    expect(body.name).toBe('초코');
    expect(body.breed).toBe('말티즈');
    expect(body.hasIdTag).toBe('Y');
  });

  it('선택 필드는 공백이면 undefined 로 떨군다', () => {
    const body = toMissingCreateBody({ ...FORM, age: '2020', weight: '  ' }, ['https://cdn/a.jpg']);
    expect(body.age).toBe('2020');
    expect(body.weight).toBeUndefined();
  });
});
