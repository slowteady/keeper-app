import { QueryClient } from '@tanstack/react-query';

import { communityQueries } from '@/entities/community';

type WithCommentCount = { id: string; counts: { comment: number; [k: string]: number } };
type ListPage = { items: WithCommentCount[]; [k: string]: unknown };
type InfiniteShape = { pages: ListPage[]; pageParams: unknown[] };
type DetailUnion = { kind: 'ADOPT'; adopt: WithCommentCount } | { kind: 'QNA'; qna: WithCommentCount };

const isInfinite = (data: unknown): data is InfiniteShape =>
  !!data &&
  typeof data === 'object' &&
  'pages' in (data as Record<string, unknown>) &&
  Array.isArray((data as { pages: unknown }).pages);

const isWithCommentCount = (data: unknown): data is WithCommentCount =>
  !!data &&
  typeof data === 'object' &&
  'id' in (data as Record<string, unknown>) &&
  'counts' in (data as Record<string, unknown>);

const isDetailUnion = (data: unknown): data is DetailUnion => {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return d.kind === 'ADOPT' ? isWithCommentCount(d.adopt) : d.kind === 'QNA' ? isWithCommentCount(d.qna) : false;
};

const bump = (item: WithCommentCount, delta: number): WithCommentCount => ({
  ...item,
  counts: { ...item.counts, comment: Math.max(0, item.counts.comment + delta) }
});

export const patchCommentCountCache = <T>(data: T, postId: string, delta: number): T => {
  if (data === undefined || data === null) return data;

  if (isInfinite(data)) {
    let changed = false;
    const pages = data.pages.map((page) => {
      if (!Array.isArray(page.items)) return page;
      let pageChanged = false;
      const items = page.items.map((item) => {
        if (item.id !== postId) return item;
        pageChanged = true;
        return bump(item, delta);
      });
      if (!pageChanged) return page;
      changed = true;
      return { ...page, items };
    });
    return changed ? ({ ...data, pages } as T) : data;
  }

  if (isDetailUnion(data)) {
    if (data.kind === 'QNA') {
      return (data.qna.id === postId ? { ...data, qna: bump(data.qna, delta) } : data) as T;
    }
    return (data.adopt.id === postId ? { ...data, adopt: bump(data.adopt, delta) } : data) as T;
  }

  if (isWithCommentCount(data) && data.id === postId) {
    return bump(data, delta) as unknown as T;
  }

  return data;
};

export const patchPostCommentCount = (queryClient: QueryClient, postId: string, delta: number) => {
  const apply = (queryKey: readonly unknown[]) =>
    queryClient.setQueriesData({ queryKey }, (old: unknown) => patchCommentCountCache(old, postId, delta));
  apply([...communityQueries.all(), 'list']);
  apply([...communityQueries.all(), 'qna', 'list']);
  apply([...communityQueries.all(), 'detail']);
  apply([...communityQueries.all(), 'qna', 'detail']);
};
