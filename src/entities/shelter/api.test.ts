import { publicApi } from '@/shared/api/instance';

import { searchShelters, shelterQueries } from './api';
import { SHELTER_DISTANCES } from './constant';

const mockedPublicGet = jest.mocked(publicApi.get);

beforeEach(() => {
  jest.clearAllMocks();
  const noop = { data: { data: null } } as never;
  mockedPublicGet.mockResolvedValue(noop);
});

describe('shelterQueries.all', () => {
  it('queryKey가 ["shelters"]이다', () => {
    expect(shelterQueries.all()).toEqual(['shelters']);
  });
});

describe('shelterQueries.counts', () => {
  it('/v2/shelters/nearby/count 로 GET 요청하고 SHELTER_DISTANCES를 distances 파라미터에 포함한다', async () => {
    const params = { lat: 37, lng: 127 } as never;
    const opts = shelterQueries.counts(params);

    await (opts.queryFn as never as () => Promise<unknown>)();

    expect(mockedPublicGet).toHaveBeenCalledWith('/v2/shelters/nearby/count', {
      params: { lat: 37, lng: 127, distances: SHELTER_DISTANCES.join(',') }
    });
  });

  it('queryKey에 params가 포함된다', () => {
    const params = { latitude: 37, longitude: 127 };

    expect(shelterQueries.counts(params).queryKey).toEqual(['shelters', 'counts', params]);
  });

  it('select 함수가 정의되어 있다', () => {
    const opts = shelterQueries.counts({ latitude: 37, longitude: 127 });

    expect(typeof opts.select).toBe('function');
  });
});

describe('shelterQueries.list', () => {
  it('/v2/shelters 로 GET 요청하고 params를 전달한다', async () => {
    const params = { latitude: 37, longitude: 127, distance: 5, userLatitude: 37, userLongitude: 127 };
    const opts = shelterQueries.list(params);

    await (opts.queryFn as never as () => Promise<unknown>)();

    expect(mockedPublicGet).toHaveBeenCalledWith('/v2/shelters', { params });
  });

  it('queryKey에 params가 포함된다', () => {
    const params = { latitude: 37, longitude: 127, distance: 5, userLatitude: 37, userLongitude: 127 };

    expect(shelterQueries.list(params).queryKey).toEqual(['shelters', 'list', params]);
  });

  it('select 함수가 정의되어 있다', () => {
    const params = { latitude: 37, longitude: 127, distance: 5, userLatitude: 37, userLongitude: 127 };
    const opts = shelterQueries.list(params);

    expect(typeof opts.select).toBe('function');
  });
});

describe('shelterQueries.detail', () => {
  it('/v2/shelters/:id 로 GET 요청한다', async () => {
    const opts = shelterQueries.detail('s1');

    await (opts.queryFn as never as () => Promise<unknown>)();

    expect(mockedPublicGet).toHaveBeenCalledWith('/v2/shelters/s1');
  });

  it('queryKey에 id가 포함된다', () => {
    expect(shelterQueries.detail('s1').queryKey).toEqual(['shelters', 'detail', 's1']);
  });
});

describe('shelterQueries.adopts', () => {
  const adoptParams = { size: 10, page: 0, filter: 'NEW' };

  it('/v2/shelters/:id/abandonments 로 GET 요청하고 params와 pageParam을 전달한다', async () => {
    const queryFn = shelterQueries.adopts('s1', adoptParams).queryFn;

    await (queryFn as never as (ctx: { pageParam: number }) => Promise<unknown>)({ pageParam: 2 });

    expect(mockedPublicGet).toHaveBeenCalledWith('/v2/shelters/s1/abandonments', {
      params: { ...adoptParams, page: 2 }
    });
  });

  it('queryKey에 id와 params가 포함된다', () => {
    expect(shelterQueries.adopts('s1', adoptParams).queryKey).toEqual(['shelters', 'adopts', 's1', adoptParams]);
  });

  it('getNextPageParam: has_next가 true이면 page + 1을 반환한다', () => {
    const opts = shelterQueries.adopts('s1', adoptParams);
    const lastPage = { data: { data: { has_next: true, page: 3 } } } as never;

    expect(opts.getNextPageParam(lastPage, [lastPage], 0, [0])).toBe(4);
  });

  it('getNextPageParam: has_next가 false이면 undefined를 반환한다', () => {
    const opts = shelterQueries.adopts('s1', adoptParams);
    const lastPage = { data: { data: { has_next: false, page: 3 } } } as never;

    expect(opts.getNextPageParam(lastPage, [lastPage], 0, [0])).toBeUndefined();
  });

  it('select 함수가 정의되어 있다', () => {
    expect(typeof shelterQueries.adopts('s1', adoptParams).select).toBe('function');
  });
});

describe('searchShelters', () => {
  it('/v2/shelters/search 로 GET 요청하고 params를 전달한다', async () => {
    const params = { search: '강남', userLatitude: 37, userLongitude: 127 };

    await searchShelters(params);

    expect(mockedPublicGet).toHaveBeenCalledWith('/v2/shelters/search', { params });
  });
});
