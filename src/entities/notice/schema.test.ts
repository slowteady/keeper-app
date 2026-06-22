import { NOTICE_TYPE_LABEL, NoticeDetailSchema, NoticeListResponseSchema, UrgentNoticeSchema } from './schema';

describe('NoticeListResponseSchema', () => {
  it('PageV2 목록 응답을 파싱한다', () => {
    const parsed = NoticeListResponseSchema.parse({
      items: [{ id: 'n1', type: 'URGENT', title: '점검 안내', isPinned: true, createdAt: '2026-06-20T00:00:00Z' }],
      total: 1,
      page: 1,
      size: 20,
      hasNext: false
    });
    expect(parsed.items[0].type).toBe('URGENT');
    expect(parsed.items[0].isPinned).toBe(true);
  });

  it('잘못된 type은 거부', () => {
    const result = NoticeListResponseSchema.safeParse({
      items: [{ id: 'n1', type: 'WARN', title: 't', createdAt: '2026-06-20T00:00:00Z' }],
      total: 1,
      page: 1,
      size: 20,
      hasNext: false
    });
    expect(result.success).toBe(false);
  });
});

describe('NoticeDetailSchema', () => {
  it('content·images 포함 상세를 파싱한다', () => {
    const parsed = NoticeDetailSchema.parse({
      id: 'n1',
      type: 'NORMAL',
      title: '공지',
      isPinned: false,
      content: '본문',
      images: ['https://cdn/a.png'],
      createdAt: '2026-06-20T00:00:00Z'
    });
    expect(parsed.content).toBe('본문');
    expect(parsed.images).toHaveLength(1);
  });
});

describe('UrgentNoticeSchema', () => {
  it('긴급공지 필드를 파싱한다', () => {
    const parsed = UrgentNoticeSchema.parse({
      id: 'u1',
      title: '긴급',
      content: '내용',
      images: []
    });
    expect(parsed.id).toBe('u1');
  });
});

describe('NOTICE_TYPE_LABEL', () => {
  it('일반·긴급 라벨이 정의돼 있다', () => {
    expect(NOTICE_TYPE_LABEL.NORMAL).toBe('일반');
    expect(NOTICE_TYPE_LABEL.URGENT).toBe('긴급');
  });
});
