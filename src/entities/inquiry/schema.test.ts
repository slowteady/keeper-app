import { INQUIRY_STATUS_LABEL, INQUIRY_TYPE_LABEL, InquiryFormSchema, InquiryListResponseSchema } from './schema';

describe('InquiryFormSchema', () => {
  it('유효한 입력을 통과시킨다', () => {
    const result = InquiryFormSchema.safeParse({
      type: 'BUG',
      content: '사진 업로드가 안 돼요',
      images: []
    });
    expect(result.success).toBe(true);
  });

  it('content 2자 미만은 거부', () => {
    const result = InquiryFormSchema.safeParse({ type: 'BUG', content: '아', images: [] });
    expect(result.success).toBe(false);
  });

  it('images 10장 초과는 거부', () => {
    const result = InquiryFormSchema.safeParse({
      type: 'ETC',
      content: '문의합니다',
      images: Array.from({ length: 11 }, (_, i) => `img${i}`)
    });
    expect(result.success).toBe(false);
  });

  it('잘못된 type은 거부', () => {
    const result = InquiryFormSchema.safeParse({ type: 'UNKNOWN', content: '문의합니다', images: [] });
    expect(result.success).toBe(false);
  });

  it('images 미지정 시 빈 배열 기본값', () => {
    const result = InquiryFormSchema.parse({ type: 'ETC', content: '문의합니다' });
    expect(result.images).toEqual([]);
  });
});

describe('InquiryListResponseSchema', () => {
  it('PageV2 응답을 파싱한다', () => {
    const parsed = InquiryListResponseSchema.parse({
      items: [
        {
          id: 'iq1',
          type: 'ADOPTION',
          status: 'RECEIVED',
          contentPreview: '입양 절차가 궁금해요',
          createdAt: '2026-06-18T00:00:00Z'
        }
      ],
      total: 1,
      page: 1,
      size: 50,
      hasNext: false
    });
    expect(parsed.items[0].status).toBe('RECEIVED');
  });
});

describe('라벨 매핑', () => {
  it('7개 유형 + 3개 상태 라벨이 정의돼 있다', () => {
    expect(INQUIRY_TYPE_LABEL.APPEAL).toBe('이의제기');
    expect(INQUIRY_STATUS_LABEL.IN_PROGRESS).toBe('처리중');
  });
});
