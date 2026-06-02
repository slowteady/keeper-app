import { authApi } from '@/shared/api/instance';

import { shelterApi, shelterQueries } from './api';

const mockedAuthGet = jest.mocked(authApi.get);
const mockedAuthPost = jest.mocked(authApi.post);
const mockedAuthDelete = jest.mocked(authApi.delete);

beforeEach(() => {
  jest.clearAllMocks();
  const noop = { data: { data: null } } as never;
  mockedAuthGet.mockResolvedValue(noop);
});

describe('shelterQueries.all', () => {
  it('queryKey가 ["shelters"]이다', () => {
    expect(shelterQueries.all()).toEqual(['shelters']);
  });
});

describe('shelterQueries.list', () => {
  it('/shelters 로 GET 요청하고 params를 전달한다', async () => {
    const params = { latitude: 37, longitude: 127, distance: 5, userLatitude: 37, userLongitude: 127 };
    const opts = shelterQueries.list(params);

    await (opts.queryFn as never as () => Promise<unknown>)();

    expect(mockedAuthGet).toHaveBeenCalledWith('/shelters', { params });
  });

  it('queryKey에 params가 포함된다', () => {
    const params = { latitude: 37, longitude: 127, distance: 5, userLatitude: 37, userLongitude: 127 };

    expect(shelterQueries.list(params).queryKey).toEqual(['shelters', 'list', params]);
  });

  it('queryFn 이 ApiResponse 의 data.data (ShelterDto[]) 를 직접 반환한다 — 낙관 업데이트 일관성', async () => {
    const params = { latitude: 37, longitude: 127, distance: 5, userLatitude: 37, userLongitude: 127 };
    const opts = shelterQueries.list(params);
    const items = [{ id: 'S1' }, { id: 'S2' }];
    mockedAuthGet.mockResolvedValueOnce({ data: { data: items } } as never);

    const result = await (opts.queryFn as never as () => Promise<unknown>)();

    expect(result).toEqual(items);
  });
});

describe('shelterQueries.within', () => {
  it('/shelters/within 로 GET 요청하고 bounds params를 전달한다', async () => {
    const params = {
      minLatitude: 37,
      maxLatitude: 38,
      minLongitude: 126,
      maxLongitude: 128,
      userLatitude: 37.5,
      userLongitude: 127
    };
    const opts = shelterQueries.within(params);

    await (opts.queryFn as never as () => Promise<unknown>)();

    expect(mockedAuthGet).toHaveBeenCalledWith('/shelters/within', { params });
  });

  it('queryKey가 ["shelters","within",params] — 찜 prefix 유지', () => {
    const params = { minLatitude: 37, maxLatitude: 38, minLongitude: 126, maxLongitude: 128 };

    expect(shelterQueries.within(params).queryKey).toEqual(['shelters', 'within', params]);
  });

  it('queryFn 이 data.data (ShelterDto[]) 를 직접 반환한다', async () => {
    const params = { minLatitude: 37, maxLatitude: 38, minLongitude: 126, maxLongitude: 128 };
    const items = [{ id: 'S1' }, { id: 'S2' }];
    mockedAuthGet.mockResolvedValueOnce({ data: { data: items } } as never);

    const result = await (shelterQueries.within(params).queryFn as never as () => Promise<unknown>)();

    expect(result).toEqual(items);
  });
});

describe('shelterQueries.detail', () => {
  it('/shelters/:id 로 GET 요청한다', async () => {
    const opts = shelterQueries.detail('s1');

    await (opts.queryFn as never as () => Promise<unknown>)();

    expect(mockedAuthGet).toHaveBeenCalledWith('/shelters/s1');
  });

  it('queryKey에 id가 포함된다', () => {
    expect(shelterQueries.detail('s1').queryKey).toEqual(['shelters', 'detail', 's1']);
  });

  it('queryFn 이 ApiResponse 의 data.data (ShelterDto) 를 직접 반환한다', async () => {
    const detail = { id: 's1', name: 'shelter' };
    mockedAuthGet.mockResolvedValueOnce({ data: { data: detail } } as never);

    const opts = shelterQueries.detail('s1');
    const result = await (opts.queryFn as never as () => Promise<unknown>)();

    expect(result).toEqual(detail);
  });
});

describe('shelterQueries.adopts', () => {
  const adoptParams = { size: 10, page: 1, filter: 'NEW' };

  it('/shelters/:id/abandonments 로 GET 요청하고 params와 pageParam을 전달한다', async () => {
    const queryFn = shelterQueries.adopts('s1', adoptParams).queryFn;

    await (queryFn as never as (ctx: { pageParam: number }) => Promise<unknown>)({ pageParam: 2 });

    expect(mockedAuthGet).toHaveBeenCalledWith('/shelters/s1/abandonments', {
      params: { ...adoptParams, page: 2 }
    });
  });

  it('queryKey에 id와 params가 포함된다', () => {
    expect(shelterQueries.adopts('s1', adoptParams).queryKey).toEqual(['shelters', 'adopts', 's1', adoptParams]);
  });

  it('getNextPageParam: hasNext가 true이면 page + 1을 반환한다', () => {
    const opts = shelterQueries.adopts('s1', adoptParams);
    const lastPage = { hasNext: true, page: 3 } as never;

    expect(opts.getNextPageParam(lastPage, [lastPage], 0, [0])).toBe(4);
  });

  it('getNextPageParam: hasNext가 false이면 undefined를 반환한다', () => {
    const opts = shelterQueries.adopts('s1', adoptParams);
    const lastPage = { hasNext: false, page: 3 } as never;

    expect(opts.getNextPageParam(lastPage, [lastPage], 0, [0])).toBeUndefined();
  });

  it('queryFn 이 ApiResponse 의 data.data (AdoptResponseDto) 를 직접 반환한다', async () => {
    const response = { total: 0, page: 1, size: 16, hasNext: false, items: [] };
    mockedAuthGet.mockResolvedValueOnce({ data: { data: response } } as never);

    const queryFn = shelterQueries.adopts('s1', adoptParams).queryFn;
    const result = await (queryFn as never as (ctx: { pageParam: number }) => Promise<unknown>)({ pageParam: 0 });

    expect(result).toEqual(response);
  });
});

describe('shelterApi.favorite / unfavorite', () => {
  beforeEach(() => {
    mockedAuthPost.mockResolvedValue({ data: { data: { isFavorited: true } } } as never);
    mockedAuthDelete.mockResolvedValue({ data: { data: { isFavorited: false } } } as never);
  });

  it('favorite: POST /shelters/:careRegNo/favorite 호출 후 isFavorited 반환', async () => {
    const result = await shelterApi.favorite('S001');

    expect(mockedAuthPost).toHaveBeenCalledWith('/shelters/S001/favorite');
    expect(result).toEqual({ isFavorited: true });
  });

  it('unfavorite: DELETE /shelters/:careRegNo/favorite 호출 후 isFavorited 반환', async () => {
    const result = await shelterApi.unfavorite('S001');

    expect(mockedAuthDelete).toHaveBeenCalledWith('/shelters/S001/favorite');
    expect(result).toEqual({ isFavorited: false });
  });
});
