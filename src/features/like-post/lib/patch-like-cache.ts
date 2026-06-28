export type PostLikeState = {
  isLiked: boolean;
  count: number;
};

type WithLike = {
  id: string;
  isLiked: boolean;
  counts: { like: number; [k: string]: number };
};

type ListPage = { items: WithLike[]; [k: string]: unknown };
type InfiniteShape = { pages: ListPage[]; pageParams: unknown[] };

const isInfinite = (data: unknown): data is InfiniteShape =>
  !!data &&
  typeof data === 'object' &&
  'pages' in (data as Record<string, unknown>) &&
  Array.isArray((data as { pages: unknown }).pages);

const isPostLike = (data: unknown): data is WithLike =>
  !!data &&
  typeof data === 'object' &&
  'id' in (data as Record<string, unknown>) &&
  'isLiked' in (data as Record<string, unknown>) &&
  'counts' in (data as Record<string, unknown>);

type DetailUnion = { kind: 'ADOPT'; adopt: WithLike } | { kind: 'QNA'; qna: WithLike };

const isDetailUnion = (data: unknown): data is DetailUnion => {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return d.kind === 'ADOPT' ? isPostLike(d.adopt) : d.kind === 'QNA' ? isPostLike(d.qna) : false;
};

const patchItem = (item: WithLike, next: PostLikeState): WithLike => ({
  ...item,
  isLiked: next.isLiked,
  counts: { ...item.counts, like: next.count }
});

export const patchLikeCache = <T>(data: T, postId: string, next: PostLikeState): T => {
  if (data === undefined || data === null) return data;

  if (isInfinite(data)) {
    let changed = false;
    const pages = data.pages.map((page) => {
      if (!Array.isArray(page.items)) return page;
      let pageChanged = false;
      const items = page.items.map((item) => {
        if (item.id !== postId) return item;
        pageChanged = true;
        return patchItem(item, next);
      });
      if (!pageChanged) return page;
      changed = true;
      return { ...page, items };
    });
    return changed ? ({ ...data, pages } as T) : data;
  }

  if (isDetailUnion(data)) {
    if (data.kind === 'QNA') {
      return (data.qna.id === postId ? { ...data, qna: patchItem(data.qna, next) } : data) as T;
    }
    return (data.adopt.id === postId ? { ...data, adopt: patchItem(data.adopt, next) } : data) as T;
  }

  if (isPostLike(data) && data.id === postId) {
    return patchItem(data, next) as unknown as T;
  }

  return data;
};
