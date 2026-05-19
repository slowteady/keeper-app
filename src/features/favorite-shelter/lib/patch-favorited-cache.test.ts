import { patchFavoritedCache } from './patch-favorited-cache';

const matcher = (targetId: string) => (item: unknown) => (item as { id?: string }).id === targetId;

describe('patchFavoritedCache', () => {
  it('undefined / null 이면 그대로 반환', () => {
    expect(patchFavoritedCache(undefined, matcher('A'), true)).toBeUndefined();
    expect(patchFavoritedCache(null, matcher('A'), true)).toBeNull();
  });

  it('형태 미일치 객체는 matcher 가 false 면 그대로 반환', () => {
    const data = { foo: 'bar' };
    expect(patchFavoritedCache(data, matcher('A'), true)).toBe(data);
  });

  describe('단일 detail 형태', () => {
    it('matcher 통과 시 isFavorited 갱신', () => {
      const detail = { id: 'A1', name: '보호소1', isFavorited: false };
      const next = patchFavoritedCache(detail, matcher('A1'), true);
      expect(next).toEqual({ id: 'A1', name: '보호소1', isFavorited: true });
      expect(detail.isFavorited).toBe(false); // 원본 불변
    });

    it('matcher 불일치 시 그대로 반환', () => {
      const detail = { id: 'A1', isFavorited: false };
      expect(patchFavoritedCache(detail, matcher('B2'), true)).toBe(detail);
    });
  });

  describe('InfiniteData(items 형태) — 새 PageV2 list', () => {
    const makeData = () => ({
      pages: [
        {
          items: [
            { id: 'A', isFavorited: false },
            { id: 'B', isFavorited: true }
          ]
        },
        { items: [{ id: 'C', isFavorited: false }] }
      ],
      pageParams: [1, 2]
    });

    it('해당 id 가 있는 page 의 item 만 patch', () => {
      const data = makeData();
      const next = patchFavoritedCache(data, matcher('B'), false);
      expect(next.pages[0].items[0]).toBe(data.pages[0].items[0]); // 미터치 identity
      expect(next.pages[0].items[1]).toEqual({ id: 'B', isFavorited: false });
      expect(next.pages[1]).toBe(data.pages[1]); // 미터치 page identity
    });

    it('어떤 page 에도 없으면 원본 identity', () => {
      const data = makeData();
      expect(patchFavoritedCache(data, matcher('Z'), true)).toBe(data);
    });
  });

  describe('InfiniteData(value 형태) — adopt list', () => {
    it('value 배열 안의 item patch', () => {
      const data = {
        pages: [{ value: [{ id: 'X', isFavorited: false }] }],
        pageParams: [1]
      };
      const next = patchFavoritedCache(data, matcher('X'), true);
      expect(next.pages[0].value[0]).toEqual({ id: 'X', isFavorited: true });
    });
  });

  describe('단순 배열 — shelter list cache', () => {
    it('배열 안 매칭 아이템만 patch, 미터치 아이템 identity 유지', () => {
      const a = { id: 'A', isFavorited: false };
      const b = { id: 'B', isFavorited: true };
      const c = { id: 'C', isFavorited: false };
      const data = [a, b, c];
      const next = patchFavoritedCache(data, matcher('B'), false);

      expect(Array.isArray(next)).toBe(true);
      expect(next).not.toBe(data);
      expect(next[0]).toBe(a);
      expect(next[1]).toEqual({ id: 'B', isFavorited: false });
      expect(next[2]).toBe(c);
    });

    it('매칭 없으면 배열 identity 유지', () => {
      const data = [
        { id: 'A', isFavorited: false },
        { id: 'B', isFavorited: false }
      ];
      const next = patchFavoritedCache(data, matcher('Z'), true);
      expect(next).toBe(data);
    });

    it('빈 배열은 그대로 반환', () => {
      const data: { id: string; isFavorited: boolean }[] = [];
      expect(patchFavoritedCache(data, matcher('A'), true)).toBe(data);
    });
  });
});
