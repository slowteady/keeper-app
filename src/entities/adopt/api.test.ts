import { authApi } from '@/shared/api/instance';

import { adoptApi, adoptQueries } from './api';

const mockedAuthGet = jest.mocked(authApi.get);
const mockedAuthPost = jest.mocked(authApi.post);
const mockedAuthDelete = jest.mocked(authApi.delete);

beforeEach(() => {
  jest.clearAllMocks();
  const noop = { data: { data: null } } as never;
  mockedAuthGet.mockResolvedValue(noop);
});

describe('adoptQueries.all', () => {
  it('queryKey가 ["adopts"]이다', () => {
    expect(adoptQueries.all()).toEqual(['adopts']);
  });
});

describe('adoptQueries.list', () => {
  const listParams = { filter: 'NEW' as const, animalType: 'DOG', size: 10, page: 1 };

  it('/abandonments 로 GET 요청하고 params와 pageParam을 전달한다', async () => {
    const queryFn = adoptQueries.list(listParams).queryFn;

    await (queryFn as never as (ctx: { pageParam: number }) => Promise<unknown>)({ pageParam: 3 });

    expect(mockedAuthGet).toHaveBeenCalledWith('/abandonments', {
      params: { ...listParams, page: 3 }
    });
  });

  it('queryKey에 params가 포함된다', () => {
    expect(adoptQueries.list(listParams).queryKey).toEqual(['adopts', 'list', listParams]);
  });

  it('queryFn 이 ApiResponse 의 data.data (AdoptResponseDto) 를 직접 반환한다 — 낙관 업데이트 일관성', async () => {
    const response = { total: 1, page: 1, size: 10, hasNext: false, items: [{ id: 'A' }] };
    mockedAuthGet.mockResolvedValueOnce({ data: { data: response } } as never);

    const queryFn = adoptQueries.list(listParams).queryFn;
    const result = await (queryFn as never as (ctx: { pageParam: number }) => Promise<unknown>)({ pageParam: 0 });

    expect(result).toEqual(response);
  });

  it('getNextPageParam: hasNext가 true이면 page + 1을 반환한다', () => {
    const opts = adoptQueries.list(listParams);
    const lastPage = { hasNext: true, page: 2 } as never;

    expect(opts.getNextPageParam(lastPage, [lastPage], 0, [0])).toBe(3);
  });

  it('getNextPageParam: hasNext가 false이면 undefined를 반환한다', () => {
    const opts = adoptQueries.list(listParams);
    const lastPage = { hasNext: false, page: 2 } as never;

    expect(opts.getNextPageParam(lastPage, [lastPage], 0, [0])).toBeUndefined();
  });

  it('select: pages 2개 입력 시 items가 두 페이지의 items를 flatMap한 결과이다', () => {
    const opts = adoptQueries.list(listParams);
    const item1 = { id: 'a1' };
    const item2 = { id: 'a2' };
    const item3 = { id: 'a3' };

    const pagesData = {
      pages: [
        { total: 3, page: 1, size: 2, hasNext: true, items: [item1, item2] },
        { total: 3, page: 2, size: 2, hasNext: false, items: [item3] }
      ],
      pageParams: [1, 2]
    } as never;

    const selected = opts.select!(pagesData);

    expect(selected.items).toEqual([item1, item2, item3]);
  });

  it('select: 마지막 페이지의 메타 정보를 포함한다', () => {
    const opts = adoptQueries.list(listParams);
    const pagesData = {
      pages: [
        { total: 5, page: 1, size: 2, hasNext: true, items: [] },
        { total: 5, page: 2, size: 2, hasNext: false, items: [] }
      ],
      pageParams: [1, 2]
    } as never;

    const selected = opts.select!(pagesData);

    expect(selected.hasNext).toBe(false);
    expect(selected.page).toBe(2);
    expect(selected.total).toBe(5);
  });
});

describe('adoptQueries.detail', () => {
  it('/abandonments/:id 로 GET 요청한다', async () => {
    const opts = adoptQueries.detail('a1');

    await (opts.queryFn as never as () => Promise<unknown>)();

    expect(mockedAuthGet).toHaveBeenCalledWith('/abandonments/a1');
  });

  it('queryKey에 id가 포함된다', () => {
    expect(adoptQueries.detail('a1').queryKey).toEqual(['adopts', 'detail', 'a1']);
  });

  it('queryFn 이 ApiResponse 의 data.data (AdoptDataDto) 를 직접 반환한다', async () => {
    const detail = { id: 'a1', name: 'malti' };
    mockedAuthGet.mockResolvedValueOnce({ data: { data: detail } } as never);

    const result = await (adoptQueries.detail('a1').queryFn as never as () => Promise<unknown>)();

    expect(result).toEqual(detail);
  });
});

describe('adoptApi.favorite / unfavorite', () => {
  beforeEach(() => {
    mockedAuthPost.mockResolvedValue({ data: { data: { isFavorited: true } } } as never);
    mockedAuthDelete.mockResolvedValue({ data: { data: { isFavorited: false } } } as never);
  });

  it('favorite: POST /abandonments/:desertionNo/favorite 호출 후 isFavorited 반환', async () => {
    const result = await adoptApi.favorite('D001');

    expect(mockedAuthPost).toHaveBeenCalledWith('/abandonments/D001/favorite');
    expect(result).toEqual({ isFavorited: true });
  });

  it('unfavorite: DELETE /abandonments/:desertionNo/favorite 호출 후 isFavorited 반환', async () => {
    const result = await adoptApi.unfavorite('D001');

    expect(mockedAuthDelete).toHaveBeenCalledWith('/abandonments/D001/favorite');
    expect(result).toEqual({ isFavorited: false });
  });
});
