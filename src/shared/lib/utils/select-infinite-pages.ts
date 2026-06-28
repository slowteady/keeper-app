import { InfiniteData } from '@tanstack/react-query';

type PageMeta<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
  hasNext: boolean;
};

export const selectInfinitePages = <T>(data: InfiniteData<PageMeta<T>>) => {
  const lastPage = data.pages[data.pages.length - 1];
  return {
    items: data.pages.flatMap((p) => p.items),
    total: lastPage.total,
    page: lastPage.page,
    size: lastPage.size,
    hasNext: lastPage.hasNext
  };
};
