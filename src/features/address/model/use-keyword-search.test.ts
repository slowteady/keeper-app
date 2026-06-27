import { act, renderHook, waitFor } from '@testing-library/react-native';

import { kakaoApi } from '@/shared/api';
import { createWrapper } from '@/test/create-wrapper';

import { useKeywordSearch } from './use-keyword-search';

const mockedKakaoGet = jest.mocked(kakaoApi.get);

const makeResponse = (page: number, isEnd: boolean) => ({
  data: {
    documents: [
      {
        id: `place-${page}`,
        place_name: `장소 ${page}`,
        category_name: '',
        category_group_code: '',
        category_group_name: '',
        phone: '',
        address_name: '',
        road_address_name: '',
        x: '127',
        y: '37',
        place_url: '',
        distance: ''
      }
    ],
    meta: { is_end: isEnd, pageable_count: 2, total_count: 2 }
  }
});

beforeEach(() => {
  jest.clearAllMocks();
  mockedKakaoGet.mockImplementation((_url, config) => {
    const page = Number(config?.params?.page);
    return Promise.resolve(makeResponse(page, page === 2) as never);
  });
});

describe('useKeywordSearch', () => {
  it('검색어 입력 전에는 요청하지 않는다', () => {
    renderHook(() => useKeywordSearch(), { wrapper: createWrapper() });

    expect(mockedKakaoGet).not.toHaveBeenCalled();
  });

  it('검색어 입력 후 디바운스 시간이 지나면 다음 페이지를 이어 붙인다', async () => {
    const { result } = renderHook(() => useKeywordSearch(), { wrapper: createWrapper() });

    act(() => result.current.setKeyword(' 강남 '));

    await waitFor(() => expect(result.current.results).toHaveLength(1));
    expect(mockedKakaoGet).toHaveBeenLastCalledWith('keyword.json', {
      params: { query: '강남', page: 1, size: 15 }
    });

    await act(() => result.current.fetchNextPage());

    await waitFor(() => expect(result.current.results).toHaveLength(2));
    expect(mockedKakaoGet).toHaveBeenLastCalledWith('keyword.json', {
      params: { query: '강남', page: 2, size: 15 }
    });
    expect(result.current.hasNextPage).toBe(false);
  });

  it('reset 하면 검색어와 결과가 비워진다', async () => {
    const { result } = renderHook(() => useKeywordSearch(), { wrapper: createWrapper() });

    act(() => result.current.setKeyword('강남'));
    await waitFor(() => expect(result.current.results).toHaveLength(1));

    act(() => result.current.reset());

    await waitFor(() => expect(result.current.results).toBeUndefined());
    expect(result.current.keyword).toBe('');
  });
});
