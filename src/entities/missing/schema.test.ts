import { MissingDataSchema, MissingListSchema, MissingParamsSchema, MissingResponseSchema } from './schema';

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
  it('callTel(문자열) 포함 시 통과', () => {
    expect(() => MissingDataSchema.parse({ ...VALID_MISSING, callTel: '010-1234-5678' })).not.toThrow();
  });

  it('callTel null 허용', () => {
    expect(() => MissingDataSchema.parse({ ...VALID_MISSING, callTel: null })).not.toThrow();
  });

  it('callTel 누락 시 실패', () => {
    expect(() => MissingDataSchema.parse(VALID_MISSING)).toThrow();
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
