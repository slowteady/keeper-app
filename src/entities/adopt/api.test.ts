import { authApi, publicApi } from '@/shared/api/instance';

import { adoptApi, adoptQueries } from './api';

const mockedPublicGet = jest.mocked(publicApi.get);
const mockedAuthPost = jest.mocked(authApi.post);
const mockedAuthDelete = jest.mocked(authApi.delete);

beforeEach(() => {
  jest.clearAllMocks();
  const noop = { data: { data: null } } as never;
  mockedPublicGet.mockResolvedValue(noop);
});

describe('adoptQueries.all', () => {
  it('queryKey가 ["adopts"]이다', () => {
    expect(adoptQueries.all()).toEqual(['adopts']);
  });
});

describe('adoptQueries.list', () => {
  const listParams = { filter: 'NEW' as const, animalType: 'DOG', size: 10, page: 0 };

  it('v2/abandonments 로 GET 요청하고 params와 pageParam을 전달한다', async () => {
    const queryFn = adoptQueries.list(listParams).queryFn;

    await (queryFn as never as (ctx: { pageParam: number }) => Promise<unknown>)({ pageParam: 3 });

    expect(mockedPublicGet).toHaveBeenCalledWith('v2/abandonments', {
      params: { ...listParams, page: 3 }
    });
  });

  it('queryKey에 params가 포함된다', () => {
    expect(adoptQueries.list(listParams).queryKey).toEqual(['adopts', 'list', listParams]);
  });

  it('getNextPageParam: has_next가 true이면 page + 1을 반환한다', () => {
    const opts = adoptQueries.list(listParams);
    const lastPage = { data: { data: { has_next: true, page: 2 } } } as never;

    expect(opts.getNextPageParam(lastPage, [lastPage], 0, [0])).toBe(3);
  });

  it('getNextPageParam: has_next가 false이면 undefined를 반환한다', () => {
    const opts = adoptQueries.list(listParams);
    const lastPage = { data: { data: { has_next: false, page: 2 } } } as never;

    expect(opts.getNextPageParam(lastPage, [lastPage], 0, [0])).toBeUndefined();
  });

  it('select: pages 2개 입력 시 value가 두 페이지의 value를 flatMap한 결과이다', () => {
    const opts = adoptQueries.list(listParams);
    const item1 = { id: 'a1' };
    const item2 = { id: 'a2' };
    const item3 = { id: 'a3' };

    const pagesData = {
      pages: [
        { data: { data: { total: 3, page: 1, size: 2, has_next: true, value: [item1, item2] } } },
        { data: { data: { total: 3, page: 2, size: 2, has_next: false, value: [item3] } } }
      ],
      pageParams: [0, 1]
    } as never;

    const selected = opts.select!(pagesData);

    expect(selected.value).toEqual([item1, item2, item3]);
  });

  it('select: 마지막 페이지의 메타 정보를 포함한다', () => {
    const opts = adoptQueries.list(listParams);
    const pagesData = {
      pages: [
        { data: { data: { total: 5, page: 1, size: 2, has_next: true, value: [] } } },
        { data: { data: { total: 5, page: 2, size: 2, has_next: false, value: [] } } }
      ],
      pageParams: [0, 1]
    } as never;

    const selected = opts.select!(pagesData);

    expect(selected.has_next).toBe(false);
    expect(selected.page).toBe(2);
    expect(selected.total).toBe(5);
  });
});

describe('adoptQueries.detail', () => {
  it('v2/abandonments/:id 로 GET 요청한다', async () => {
    const opts = adoptQueries.detail('a1');

    await (opts.queryFn as never as () => Promise<unknown>)();

    expect(mockedPublicGet).toHaveBeenCalledWith('v2/abandonments/a1');
  });

  it('queryKey에 id가 포함된다', () => {
    expect(adoptQueries.detail('a1').queryKey).toEqual(['adopts', 'detail', 'a1']);
  });

  it('select 함수가 정의되어 있다', () => {
    expect(typeof adoptQueries.detail('a1').select).toBe('function');
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
