import { PresignedItemSchema, PresignedUrlsBodySchema, PresignedUrlsDataSchema } from './schema';

describe('PresignedItemSchema', () => {
  it('uploadUrl 과 publicUrl 이 모두 있으면 통과', () => {
    expect(() =>
      PresignedItemSchema.parse({
        uploadUrl: 'https://bucket.s3.amazonaws.com/x.jpg?sig=abc',
        publicUrl: 'https://bucket.s3.amazonaws.com/x.jpg'
      })
    ).not.toThrow();
  });

  it('uploadUrl 누락 시 실패', () => {
    expect(() => PresignedItemSchema.parse({ publicUrl: 'https://x' })).toThrow();
  });
});

describe('PresignedUrlsBodySchema', () => {
  it('count 1~10 통과', () => {
    [1, 5, 10].forEach((count) => {
      expect(() => PresignedUrlsBodySchema.parse({ count })).not.toThrow();
    });
  });

  it('count 0 거부', () => {
    expect(() => PresignedUrlsBodySchema.parse({ count: 0 })).toThrow();
  });

  it('count 11 거부', () => {
    expect(() => PresignedUrlsBodySchema.parse({ count: 11 })).toThrow();
  });

  it('count 가 정수가 아니면 거부', () => {
    expect(() => PresignedUrlsBodySchema.parse({ count: 1.5 })).toThrow();
  });

  it('mediaType 미지정 시 image 로 기본', () => {
    expect(PresignedUrlsBodySchema.parse({ count: 1 }).mediaType).toBe('image');
  });

  it('mediaType video 통과', () => {
    expect(PresignedUrlsBodySchema.parse({ count: 1, mediaType: 'video' }).mediaType).toBe('video');
  });

  it('mediaType 이 image/video 외이면 거부', () => {
    expect(() => PresignedUrlsBodySchema.parse({ count: 1, mediaType: 'audio' })).toThrow();
  });
});

describe('PresignedUrlsDataSchema', () => {
  it('items 배열 통과 (빈 배열 포함)', () => {
    expect(() => PresignedUrlsDataSchema.parse({ items: [] })).not.toThrow();
    expect(() =>
      PresignedUrlsDataSchema.parse({
        items: [
          { uploadUrl: 'https://a', publicUrl: 'https://a' },
          { uploadUrl: 'https://b', publicUrl: 'https://b' }
        ]
      })
    ).not.toThrow();
  });

  it('items 의 항목 형식이 PresignedItem 과 다르면 거부', () => {
    expect(() => PresignedUrlsDataSchema.parse({ items: [{ uploadUrl: 'https://a' }] })).toThrow();
  });
});
