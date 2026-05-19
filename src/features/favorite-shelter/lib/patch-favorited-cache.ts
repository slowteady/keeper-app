// 찜 토글 시 React Query 캐시의 isFavorited 만 갱신하는 순수 함수.
//
// patchLikeCache 와 다른 점:
//   - count 가 없음 (isFavorited boolean 만)
//   - id 비교 함수를 외부에서 주입 가능 → shelter(careRegNo) / abandonment(desertionNo) 등 공통 사용
//
// 지원 캐시 형태:
//   1. InfiniteData<{ items: WithFav[] } | { value: WithFav[] }>  — list (PageV2 / 옛 page 둘 다)
//   2. 단순 배열 WithFav[]                                          — shelter list 등 select 가 cache 에 view 배열 저장하는 케이스
//   3. 단일 객체 (detail / 그 외)
//   4. 그 외 / undefined                                            — 그대로 반환

type WithFav = { isFavorited?: boolean; [k: string]: unknown };
// matcher 는 호출자가 원하는 type 으로 좁혀 받을 수 있도록 unknown 입력. (id 비교 등은 caller 책임)
type IdMatcher = (item: unknown) => boolean;

type ListPage = { items?: WithFav[]; value?: WithFav[]; [k: string]: unknown };
type InfiniteShape = { pages: ListPage[]; pageParams: unknown[] };

const isInfinite = (data: unknown): data is InfiniteShape =>
  !!data &&
  typeof data === 'object' &&
  'pages' in (data as Record<string, unknown>) &&
  Array.isArray((data as { pages: unknown }).pages);

export const patchFavoritedCache = <T>(data: T, matcher: IdMatcher, nextFavorited: boolean): T => {
  if (data === undefined || data === null) return data;

  if (isInfinite(data)) {
    let changed = false;
    const pages = data.pages.map((page) => {
      const items = page.items ?? page.value;
      if (!Array.isArray(items)) return page;
      let pageChanged = false;
      const patched = items.map((item) => {
        if (!matcher(item)) return item;
        pageChanged = true;
        return { ...item, isFavorited: nextFavorited };
      });
      if (!pageChanged) return page;
      changed = true;
      return page.items ? { ...page, items: patched } : { ...page, value: patched };
    });
    return changed ? ({ ...data, pages } as T) : data;
  }

  // 단순 배열 — matcher 통과한 element 만 patch, 미매칭 시 identity 유지
  if (Array.isArray(data)) {
    let changed = false;
    const patched = data.map((item) => {
      if (!matcher(item)) return item;
      changed = true;
      return { ...item, isFavorited: nextFavorited };
    });
    return (changed ? patched : data) as T;
  }

  // 단일 객체 — matcher 통과 시 patch
  if (data && typeof data === 'object' && matcher(data as WithFav)) {
    return { ...(data as object), isFavorited: nextFavorited } as T;
  }

  return data;
};
