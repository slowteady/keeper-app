type WithFav = { isFavorited?: boolean; [k: string]: unknown };
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

  if (Array.isArray(data)) {
    let changed = false;
    const patched = data.map((item) => {
      if (!matcher(item)) return item;
      changed = true;
      return { ...item, isFavorited: nextFavorited };
    });
    return (changed ? patched : data) as T;
  }

  if (data && typeof data === 'object' && matcher(data as WithFav)) {
    return { ...(data as object), isFavorited: nextFavorited } as T;
  }

  return data;
};
