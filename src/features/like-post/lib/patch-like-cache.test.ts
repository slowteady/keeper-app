import { patchLikeCache } from './patch-like-cache';

const post = (id: string, isLiked: boolean, like: number) => ({
  id,
  isLiked,
  counts: { like, view: 0, comment: 0 }
});

describe('patchLikeCache', () => {
  it('undefined / null 이면 그대로 반환한다', () => {
    expect(patchLikeCache(undefined, '1', { isLiked: true, count: 1 })).toBeUndefined();
    expect(patchLikeCache(null, '1', { isLiked: true, count: 1 })).toBeNull();
  });

  it('형태 미일치(임의 객체)면 그대로 반환한다', () => {
    const data = { foo: 'bar' };
    expect(patchLikeCache(data, '1', { isLiked: true, count: 1 })).toBe(data);
  });

  describe('단일 detail 형태', () => {
    it('id 매치 시 isLiked + counts.like patch', () => {
      const detail = post('7', false, 3);
      const next = patchLikeCache(detail, '7', { isLiked: true, count: 4 });

      expect(next).toEqual({
        id: '7',
        isLiked: true,
        counts: { like: 4, view: 0, comment: 0 }
      });
      // 원본 불변
      expect(detail.isLiked).toBe(false);
      expect(detail.counts.like).toBe(3);
    });

    it('id 불일치 시 그대로 반환', () => {
      const detail = post('7', false, 3);
      expect(patchLikeCache(detail, '99', { isLiked: true, count: 4 })).toBe(detail);
    });
  });

  describe('InfiniteData(list) 형태', () => {
    const makeInfinite = () => ({
      pages: [
        { items: [post('1', false, 5), post('2', true, 10)], total: 2, page: 1 },
        { items: [post('3', false, 0)], total: 3, page: 2 }
      ],
      pageParams: [1, 2]
    });

    it('해당 id 가 들어있는 page 의 item 만 patch', () => {
      const data = makeInfinite();
      const next = patchLikeCache(data, '2', { isLiked: false, count: 9 });

      expect(next.pages[0].items[0]).toBe(data.pages[0].items[0]); // 미터치 item identity
      expect(next.pages[0].items[1]).toEqual({
        id: '2',
        isLiked: false,
        counts: { like: 9, view: 0, comment: 0 }
      });
      expect(next.pages[1]).toBe(data.pages[1]); // 미터치 page identity
    });

    it('id 가 어떤 page 에도 없으면 원본 그대로 반환 (identity 동일)', () => {
      const data = makeInfinite();
      expect(patchLikeCache(data, '999', { isLiked: true, count: 1 })).toBe(data);
    });

    it('빈 items 도 안전', () => {
      const data = { pages: [{ items: [] }], pageParams: [1] };
      expect(patchLikeCache(data, '1', { isLiked: true, count: 1 })).toBe(data);
    });

    it('pageParams / 기타 메타는 보존', () => {
      const data = makeInfinite();
      const next = patchLikeCache(data, '1', { isLiked: true, count: 6 });
      expect(next.pageParams).toEqual([1, 2]);
      expect(next.pages[0].total).toBe(2);
      expect(next.pages[0].page).toBe(1);
    });
  });
});
