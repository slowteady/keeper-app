import { renderHook, waitFor } from '@testing-library/react-native';

import { authApi } from '@/shared/api/instance';
import { createWrapper } from '@/test/create-wrapper';

import { useCommunityAdoptFeed } from './use-community-adopt-feed';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() }
}));

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

beforeEach(() => {
  jest.clearAllMocks();
  mockedAuthGet.mockResolvedValue(makeListResponse() as never);
});

describe('useCommunityAdoptFeed', () => {
  it('기본 호출 시 authApi.get params에 sort=NEW가 포함된다', async () => {
    const { result } = renderHook(() => useCommunityAdoptFeed(), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedAuthGet).toHaveBeenCalledWith(
      '/community/posts',
      expect.objectContaining({
        params: expect.objectContaining({ sort: 'NEW' })
      })
    );
  });

  it('sort=LIKE 호출 시 params에 sort: "LIKE"가 포함된다', async () => {
    const { result } = renderHook(() => useCommunityAdoptFeed({ sort: 'LIKE' }), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedAuthGet).toHaveBeenCalledWith(
      '/community/posts',
      expect.objectContaining({
        params: expect.objectContaining({ sort: 'LIKE' })
      })
    );
  });

  it('sort=VIEW + animalType=DOG 호출 시 params에 두 값 모두 포함된다', async () => {
    const { result } = renderHook(() => useCommunityAdoptFeed({ sort: 'VIEW', animalType: 'DOG' }), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedAuthGet).toHaveBeenCalledWith(
      '/community/posts',
      expect.objectContaining({
        params: expect.objectContaining({ sort: 'VIEW', animalType: 'DOG' })
      })
    );
  });

  it('반환 객체 shape에 필수 키가 모두 존재한다', async () => {
    const { result } = renderHook(() => useCommunityAdoptFeed(), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current).toHaveProperty('adoptList');
    expect(result.current).toHaveProperty('total');
    expect(result.current).toHaveProperty('moreButtonText');
    expect(result.current).toHaveProperty('hasNextPage');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isFetchingNextPage');
    expect(result.current).toHaveProperty('isError');
    expect(result.current).toHaveProperty('error');
    expect(typeof result.current.refresh).toBe('function');
    expect(typeof result.current.fetchNextPage).toBe('function');
    expect(typeof result.current.goDetailPage).toBe('function');
  });
});
