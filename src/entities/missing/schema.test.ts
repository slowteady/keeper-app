import {
  MissingContactSchema,
  MissingCreateFormSchema,
  MissingDataSchema,
  MissingDetailSchema,
  MissingFeedItemSchema,
  MissingFeedListSchema,
  MissingListSchema,
  MissingParamsSchema,
  MissingResponseSchema
} from './schema';

const VALID_MISSING = {
  id: 'm1',
  photos: ['https://a'],
  kind: '진도견',
  color: '갈색',
  sex: 'M',
  age: '6살',
  specialMark: '왼쪽 귀 접힘',
  happenAddr: '서울특별시 강남구 역삼동',
  happenPlace: '역삼역 3번 출구',
  happenDt: '2026-07-01',
  orgNm: '강남구청'
};

describe('MissingResponseSchema', () => {
  it('필수 + nullable 필드 통과', () => {
    expect(() => MissingResponseSchema.parse(VALID_MISSING)).not.toThrow();
  });

  it('nullable 필드에 null 허용', () => {
    expect(() =>
      MissingResponseSchema.parse({
        ...VALID_MISSING,
        color: null,
        sex: null,
        age: null,
        specialMark: null,
        happenPlace: null,
        orgNm: null
      })
    ).not.toThrow();
  });

  it('id 누락 시 실패', () => {
    const { id: _id, ...rest } = VALID_MISSING;
    expect(() => MissingResponseSchema.parse(rest)).toThrow();
  });

  it('happenAddr 누락 시 실패 (필수)', () => {
    const { happenAddr: _addr, ...rest } = VALID_MISSING;
    expect(() => MissingResponseSchema.parse(rest)).toThrow();
  });

  it('nullable 필드가 null 아닌 undefined 면 실패 (누락 불허)', () => {
    const { color: _color, ...rest } = VALID_MISSING;
    expect(() => MissingResponseSchema.parse(rest)).toThrow();
  });
});

describe('MissingDataSchema', () => {
  it('hasCallTel(boolean) 포함 시 통과', () => {
    expect(() => MissingDataSchema.parse({ ...VALID_MISSING, hasCallTel: true })).not.toThrow();
  });

  it('hasCallTel 누락 시 실패', () => {
    expect(() => MissingDataSchema.parse(VALID_MISSING)).toThrow();
  });

  it('전화번호는 상세 응답에 실리지 않는다', () => {
    const parsed = MissingDataSchema.parse({ ...VALID_MISSING, hasCallTel: true, callTel: '010-1234-5678' });
    expect(parsed).not.toHaveProperty('callTel');
  });
});

describe('MissingContactSchema', () => {
  it('callTel 문자열 통과', () => {
    expect(() => MissingContactSchema.parse({ callTel: '010-1234-5678' })).not.toThrow();
  });

  it('callTel 누락 시 실패', () => {
    expect(() => MissingContactSchema.parse({})).toThrow();
  });
});

describe('MissingListSchema', () => {
  const VALID_LIST = {
    items: [VALID_MISSING],
    total: 1,
    page: 1,
    size: 20,
    hasNext: false,
    appliedRegion: '서울특별시'
  };

  it('appliedRegion 포함 모든 필드 있으면 통과', () => {
    expect(() => MissingListSchema.parse(VALID_LIST)).not.toThrow();
  });

  it('appliedRegion null 허용', () => {
    expect(() => MissingListSchema.parse({ ...VALID_LIST, appliedRegion: null })).not.toThrow();
  });

  it('appliedRegion 누락 시 실패', () => {
    const { appliedRegion: _r, ...rest } = VALID_LIST;
    expect(() => MissingListSchema.parse(rest)).toThrow();
  });
});

describe('MissingParamsSchema', () => {
  it('size 필수, page/sido/sigungu optional', () => {
    expect(() => MissingParamsSchema.parse({ size: 20 })).not.toThrow();
    expect(() => MissingParamsSchema.parse({ size: 20, page: 2 })).not.toThrow();
    expect(() => MissingParamsSchema.parse({ size: 20, sido: '서울특별시', sigungu: '강남구' })).not.toThrow();
  });

  it('size 누락 시 실패', () => {
    expect(() => MissingParamsSchema.parse({ page: 1 })).toThrow();
  });
});

describe('MissingFeedItemSchema', () => {
  const base = {
    source: 'USER',
    id: 'p1',
    sortDate: '2026-07-01T00:00:00.000Z',
    thumbnail: 'https://img/a.jpg',
    kindLabel: '말티즈',
    region: '서울특별시 강남구',
    status: 'MISSING',
    hasContact: true
  };

  it('정상 피드 아이템을 파싱한다', () => {
    expect(MissingFeedItemSchema.parse(base).source).toBe('USER');
  });

  it('thumbnail 은 null 허용', () => {
    expect(MissingFeedItemSchema.parse({ ...base, thumbnail: null }).thumbnail).toBeNull();
  });

  it('알 수 없는 source 는 거부', () => {
    expect(() => MissingFeedItemSchema.parse({ ...base, source: 'X' })).toThrow();
  });
});

describe('MissingFeedListSchema', () => {
  it('PageV2 형태를 파싱한다', () => {
    const parsed = MissingFeedListSchema.parse({
      items: [],
      total: 0,
      page: 1,
      size: 20,
      hasNext: false
    });
    expect(parsed.hasNext).toBe(false);
  });
});

describe('MissingDetailSchema', () => {
  const detail = {
    id: 'p1',
    animalType: 'DOG',
    name: null,
    breed: null,
    gender: null,
    age: null,
    weight: null,
    hasIdTag: null,
    rfid: null,
    colorFeature: '흰색 곱슬',
    description: null,
    lostAt: '2026-07-01T00:00:00.000Z',
    lat: 37.5,
    lng: 127.03,
    address: '서울특별시 강남구',
    regionCode: null,
    status: 'MISSING',
    hasContact: true,
    images: ['https://img/a.jpg'],
    videoUrl: null,
    videoThumbnailUrl: null,
    videoDuration: null,
    author: { id: 'u1', nickname: '닉', image: 'https://img/u.jpg' },
    isOwner: false,
    createdAt: '2026-07-01T00:00:00.000Z'
  };

  it('상세를 파싱하고 좌표는 number', () => {
    const parsed = MissingDetailSchema.parse(detail);
    expect(parsed.lat).toBeCloseTo(37.5);
    expect(parsed.hasContact).toBe(true);
  });

  it('좌표가 string 으로 와도 number 로 coerce', () => {
    const parsed = MissingDetailSchema.parse({ ...detail, lat: '37.5', lng: '127.03' });
    expect(parsed.lat).toBeCloseTo(37.5);
  });

  it('author null 허용', () => {
    expect(MissingDetailSchema.parse({ ...detail, author: null }).author).toBeNull();
  });
});

describe('MissingCreateFormSchema', () => {
  const form = {
    images: ['https://img/a.jpg'],
    animalType: 'DOG',
    name: '초코',
    specificType: '말티즈',
    hasIdTag: 'Y',
    colorFeature: '흰색 곱슬',
    lostAt: '2026-07-01T00:00:00.000Z',
    lat: 37.5,
    lng: 127.03,
    address: '서울특별시 강남구',
    contact: [{ type: 'PHONE', value: '010-1234-5678' }]
  };

  it('유효한 폼을 통과시킨다', () => {
    expect(MissingCreateFormSchema.parse(form).animalType).toBe('DOG');
  });

  it('사진 0장이면 거부', () => {
    expect(() => MissingCreateFormSchema.parse({ ...form, images: [] })).toThrow();
  });

  it('연락처가 0개면 거부', () => {
    expect(() => MissingCreateFormSchema.parse({ ...form, contact: [] })).toThrow();
  });

  it('연락처 값이 비면 거부', () => {
    expect(() => MissingCreateFormSchema.parse({ ...form, contact: [{ type: 'PHONE', value: '' }] })).toThrow();
  });

  it('SNS 는 https 링크가 아니면 거부', () => {
    expect(() =>
      MissingCreateFormSchema.parse({ ...form, contact: [{ type: 'SNS', value: '인스타아이디' }] })
    ).toThrow();
  });

  it('SNS 가 https 링크면 통과', () => {
    const parsed = MissingCreateFormSchema.parse({
      ...form,
      contact: [{ type: 'SNS', value: 'https://open.kakao.com/o/x' }]
    });
    expect(parsed.contact[0].type).toBe('SNS');
  });

  it('선택 필드(성별·나이·몸무게) 없이도 통과', () => {
    expect(MissingCreateFormSchema.parse(form).gender).toBeUndefined();
  });

  it('실종일시가 미래면 거부 (네이티브 상한 대신 스키마가 막는다)', () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    expect(() => MissingCreateFormSchema.parse({ ...form, lostAt: future })).toThrow();
  });

  it('실종일시가 과거면 통과', () => {
    const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expect(MissingCreateFormSchema.parse({ ...form, lostAt: past }).lostAt).toBe(past);
  });

  it('이름이 없으면 거부', () => {
    const { name: _n, ...rest } = form;
    expect(() => MissingCreateFormSchema.parse(rest)).toThrow();
  });

  it('품종이 없으면 거부', () => {
    const { specificType: _s, ...rest } = form;
    expect(() => MissingCreateFormSchema.parse(rest)).toThrow();
  });

  it('인식칩 여부가 없으면 거부', () => {
    const { hasIdTag: _h, ...rest } = form;
    expect(() => MissingCreateFormSchema.parse(rest)).toThrow();
  });

  it('사례금 필드는 스키마에 없다', () => {
    const parsed = MissingCreateFormSchema.parse({ ...form, reward: '10만원' }) as Record<string, unknown>;
    expect(parsed.reward).toBeUndefined();
  });

  it('colorFeature 빈 값은 거부', () => {
    expect(() => MissingCreateFormSchema.parse({ ...form, colorFeature: '' })).toThrow();
  });

  it('colorFeature 60자 초과는 거부', () => {
    expect(() => MissingCreateFormSchema.parse({ ...form, colorFeature: '가'.repeat(61) })).toThrow();
  });

  it('colorFeature 60자는 통과', () => {
    expect(MissingCreateFormSchema.parse({ ...form, colorFeature: '가'.repeat(60) }).colorFeature).toHaveLength(60);
  });

  it('description 없이도 통과', () => {
    expect(MissingCreateFormSchema.parse(form).description).toBeUndefined();
  });

  it('description 500자 초과는 거부', () => {
    expect(() => MissingCreateFormSchema.parse({ ...form, description: '가'.repeat(501) })).toThrow();
  });
});
