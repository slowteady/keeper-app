import { CommentDto } from '@/entities/comment';

type InfinitePages<T> = { pages: { items?: T[] }[] };

// commentQueries 의 list/replies infinite cache 와 동일한 shape — pages.items[].
// 해당 commentId 에 helpfulCount/isHelpful 패치. 일치 노드 없으면 cache 그대로 반환.
export const patchHelpfulCache = (
  data: unknown,
  commentId: string,
  next: { isHelpful: boolean; count: number }
): unknown => {
  if (!data || typeof data !== 'object') return data;
  const d = data as InfinitePages<CommentDto>;
  if (!Array.isArray(d.pages)) return data;

  let touched = false;
  const pages = d.pages.map((page) => {
    if (!page.items) return page;
    const items = page.items.map((c) => {
      if (c.id !== commentId) return c;
      touched = true;
      return { ...c, helpfulCount: next.count, isHelpful: next.isHelpful };
    });
    return { ...page, items };
  });
  return touched ? { ...d, pages } : data;
};
