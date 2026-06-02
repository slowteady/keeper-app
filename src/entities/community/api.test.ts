import { authApi } from '@/shared/api/instance';

import { communityApi, communityQueries } from './api';

const mockedAuthGet = jest.mocked(authApi.get);

const makeListResponse = (overrides?: object) => ({
  data: {
    data: {
      items: [],
      total: 0,
      page: 1,
      size: 20,
      hasNext: false,
      ...overrides
    }
  }
});

const makeItem = (id: string) => ({
  id,
  user: { id: '1', image: 'img.png', nickname: '닉네임' },
  displayTime: '방금 전',
  title: `제목${id}`,
  images: [],
  tags: [],
  content: '내용',
  counts: { like: 0, view: 0, comment: 0 },
  isLiked: false
});

beforeEach(() => {
  jest.clearAllMocks();
  mockedAuthGet.mockResolvedValue(makeListResponse() as never);
});

describe('communityQueries.all', () => {
  it('queryKey가 ["community"]이다', () => {
    expect(communityQueries.all()).toEqual(['community']);
  });
});

describe('communityQueries.list', () => {
  it('/community/posts 로 GET 요청하고 category·sort·page·size 파라미터를 전달한다', async () => {
    const opts = communityQueries.list({ category: 'ADOPTION_PERSONAL', sort: 'NEW' });

    await (opts.queryFn as never as (ctx: { pageParam: number }) => Promise<unknown>)({
      pageParam: 1
    });

    expect(mockedAuthGet).toHaveBeenCalledWith('/community/posts', {
      params: expect.objectContaining({
        category: 'ADOPTION_PERSONAL',
        sort: 'NEW',
        page: 1,
        size: 20
      })
    });
  });

  it('size 미지정 시 size=20 default로 전달된다', async () => {
    const opts = communityQueries.list({ sort: 'NEW' });

    await (opts.queryFn as never as (ctx: { pageParam: number }) => Promise<unknown>)({
      pageParam: 1
    });

    expect(mockedAuthGet).toHaveBeenCalledWith(
      '/community/posts',
      expect.objectContaining({ params: expect.objectContaining({ size: 20 }) })
    );
  });

  it('size 지정 시 해당 값을 전달한다', async () => {
    const opts = communityQueries.list({ sort: 'NEW', size: 5 });

    await (opts.queryFn as never as (ctx: { pageParam: number }) => Promise<unknown>)({
      pageParam: 1
    });

    expect(mockedAuthGet).toHaveBeenCalledWith(
      '/community/posts',
      expect.objectContaining({ params: expect.objectContaining({ size: 5 }) })
    );
  });

  it.each([
    ['sort 미지정', undefined],
    ['sort=NEW', 'NEW' as const],
    ['sort=LIKE', 'LIKE' as const],
    ['sort=COMMENT', 'COMMENT' as const],
    ['sort=VIEW', 'VIEW' as const]
  ])('%s 케이스에서 GET 요청이 발동된다', async (_label, sort) => {
    const opts = communityQueries.list(sort ? { sort } : {});

    await (opts.queryFn as never as (ctx: { pageParam: number }) => Promise<unknown>)({
      pageParam: 1
    });

    expect(mockedAuthGet).toHaveBeenCalledTimes(1);
  });

  it('queryKey에 params가 포함된다', () => {
    const params = { category: 'ADOPTION_PERSONAL' as const, sort: 'NEW' as const };

    expect(communityQueries.list(params).queryKey).toEqual(['community', 'list', params]);
  });

  it('getNextPageParam: hasNext=true → page+1 반환', () => {
    const opts = communityQueries.list({ sort: 'NEW' });
    const lastPage = { hasNext: true, page: 2, items: [], total: 10, size: 20 } as never;

    expect(opts.getNextPageParam(lastPage, [lastPage], 0, [0])).toBe(3);
  });

  it('getNextPageParam: hasNext=false → undefined 반환', () => {
    const opts = communityQueries.list({ sort: 'NEW' });
    const lastPage = { hasNext: false, page: 2, items: [], total: 10, size: 20 } as never;

    expect(opts.getNextPageParam(lastPage, [lastPage], 0, [0])).toBeUndefined();
  });

  it('select: 두 페이지 items를 합쳐 4건 반환하고 마지막 페이지 메타를 사용한다', () => {
    const opts = communityQueries.list({ sort: 'NEW' });
    const pagesData = {
      pages: [
        {
          items: [makeItem('1'), makeItem('2')],
          total: 4,
          page: 1,
          size: 2,
          hasNext: true
        },
        {
          items: [makeItem('3'), makeItem('4')],
          total: 4,
          page: 2,
          size: 2,
          hasNext: false
        }
      ],
      pageParams: [1, 2]
    } as never;

    const selected = opts.select!(pagesData);

    expect(selected.items).toHaveLength(4);
    expect(selected.items.map((i: { id: string }) => i.id)).toEqual(['1', '2', '3', '4']);
    expect(selected.total).toBe(4);
    expect(selected.page).toBe(2);
    expect(selected.size).toBe(2);
    expect(selected.hasNext).toBe(false);
  });
});

describe('communityQueries.detail', () => {
  it('queryKey에 id가 포함된다', () => {
    expect(communityQueries.detail('5').queryKey).toEqual(['community', 'detail', '5']);
  });

  it('id 가 빈 문자열이면 enabled=false이다', () => {
    expect(communityQueries.detail('').enabled).toBe(false);
  });

  it('id 가 있으면 enabled=true이다', () => {
    expect(communityQueries.detail('1').enabled).toBe(true);
  });
});

describe('communityApi.getList', () => {
  it('valid 응답이면 schema parse 결과를 반환한다', async () => {
    mockedAuthGet.mockResolvedValue(makeListResponse({ items: [makeItem('1')], total: 1 }) as never);

    const result = await communityApi.getList({ sort: 'NEW' });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('1');
    expect(result.total).toBe(1);
  });

  it('schema 불일치 응답이면 ZodError를 던진다', async () => {
    mockedAuthGet.mockResolvedValue({ data: { data: { invalid: true } } } as never);

    await expect(communityApi.getList({ sort: 'NEW' })).rejects.toThrow();
  });
});
