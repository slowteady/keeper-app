import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import { CommunityAdoptDetailDto, communityQueries } from '@/entities/community';

import { useEditPost } from './use-edit-post';

const mockToast = jest.fn();
const mockGetDetail = jest.fn();
const mockUpdate = jest.fn();
const mockPresent = jest.fn();
const mockDismiss = jest.fn();

jest.mock('@/shared/ui', () => {
  const actual = jest.requireActual('@/shared/ui');
  return {
    ...actual,
    useBottomSheet: () => ({ present: mockPresent, dismiss: mockDismiss })
  };
});

jest.mock('@/shared/lib', () => {
  const actual = jest.requireActual('@/shared/lib');
  return { ...actual, globalToast: (...args: unknown[]) => mockToast(...args) };
});

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() }
}));

// communityQueries.detail → authApi.get 으로 흐름
jest.mock('@/shared/api/instance', () => ({
  authApi: { get: (...args: unknown[]) => mockGetDetail(...args), patch: jest.fn(), post: jest.fn() },
  publicApi: { get: jest.fn() }
}));

// updateAdoptionPersonal 직접 mock — API 경계 검증은 사이클 2 (api.test.ts) 에서 끝남
jest.mock('@/features/community/create/model/api', () => {
  const actual = jest.requireActual('@/features/community/create/model/api');
  return {
    ...actual,
    updateAdoptionPersonal: (...args: unknown[]) => mockUpdate(...args)
  };
});

const detail: CommunityAdoptDetailDto = {
  id: 42,
  user: { id: 1, image: '', nickname: 't' },
  displayTime: '방금 전',
  title: '귀여운 강아지 입양',
  images: ['https://img/1.png'],
  content: '소개글',
  age: '2023',
  gender: 'F',
  weight: '5',
  animalType: 'DOG',
  specificType: '말티즈',
  location: '서울',
  healthCheck: 'Y',
  neuterYn: 'Y',
  vaccinationCheck: 'FIRST',
  protectionType: 'ADOPTION',
  specialMark: '겁이 많아요',
  likes: '간식',
  dislikes: null,
  health: null,
  relatedLink: null,
  rfid: null,
  contacts: [{ type: 'PHONE', value: '010-1111-2222' }],
  counts: { like: 0, view: 0, comment: 0 },
  isLiked: false
};

const setup = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false }
    }
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper, queryClient };
};

describe('useEditPost', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDetail.mockResolvedValue({ data: { data: detail } });
  });

  it('detail 도착 후 폼이 prefill 된다 — title/animalType/contact 매핑', async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useEditPost(42), { wrapper });

    await waitFor(() => expect(result.current.form.getValues('title')).toBe('귀여운 강아지 입양'));

    const values = result.current.form.getValues();
    expect(values.animalType).toBe('DOG');
    expect(values.contact).toEqual([{ type: 'PHONE', value: '010-1111-2222' }]);
    expect(values.images).toEqual(['https://img/1.png']);
  });

  it('handleSubmit 호출 시 updateAdoptionPersonal(postId, body) — 이미지는 폼 값 그대로 재전송', async () => {
    mockUpdate.mockResolvedValue(detail);
    const { wrapper } = setup();
    const { result } = renderHook(() => useEditPost(42), { wrapper });

    await waitFor(() => expect(result.current.form.getValues('title')).toBe('귀여운 강아지 입양'));

    act(() => {
      result.current.actions.handleSubmit(result.current.form.getValues());
    });

    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
    const [calledId, body] = mockUpdate.mock.calls[0];
    expect(calledId).toBe(42);
    expect(body.images).toEqual(['https://img/1.png']);
    expect(body.contacts).toEqual([{ type: 'PHONE', value: '010-1111-2222' }]);
  });

  it('actions.openWeightSelector 호출 시 바텀시트 present 가 호출된다', async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useEditPost(42), { wrapper });

    await waitFor(() => expect(result.current.form.getValues('title')).toBe('귀여운 강아지 입양'));

    act(() => result.current.actions.openWeightSelector());

    expect(mockPresent).toHaveBeenCalled();
  });

  it('actions.openAgeSelector / openKindSelector 도 함수로 노출되고 호출 시 present 호출', async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useEditPost(42), { wrapper });

    await waitFor(() => expect(result.current.form.getValues('title')).toBe('귀여운 강아지 입양'));

    expect(typeof result.current.actions.openAgeSelector).toBe('function');
    expect(typeof result.current.actions.openKindSelector).toBe('function');

    act(() => result.current.actions.openAgeSelector());
    act(() => result.current.actions.openKindSelector());

    expect(mockPresent).toHaveBeenCalledTimes(2);
  });

  it('detail 가 다시 도착해도 사용자가 수정 중인 폼 값은 덮어쓰지 않는다', async () => {
    const { wrapper, queryClient } = setup();
    const { result } = renderHook(() => useEditPost(42), { wrapper });

    // 첫 prefill 완료 대기
    await waitFor(() => expect(result.current.form.getValues('title')).toBe('귀여운 강아지 입양'));

    // 사용자가 제목을 수정
    act(() => {
      result.current.form.setValue('title', '사용자가 직접 수정한 제목');
    });

    // detail 재조회 (백엔드 응답은 그대로) — refetch
    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: communityQueries.all() });
    });

    // 사용자 입력이 보존되어야 함
    expect(result.current.form.getValues('title')).toBe('사용자가 직접 수정한 제목');
  });

  it('수정 실패 시 fail 토스트 (router.back 호출되지 않음)', async () => {
    mockUpdate.mockRejectedValue(new Error('500'));
    const { wrapper } = setup();
    const { result } = renderHook(() => useEditPost(42), { wrapper });

    await waitFor(() => expect(result.current.form.getValues('title')).toBe('귀여운 강아지 입양'));

    act(() => {
      result.current.actions.handleSubmit(result.current.form.getValues());
    });

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith('게시글 수정에 실패했어요. 잠시 후 다시 시도해주세요', 'fail')
    );
    expect(router.back).not.toHaveBeenCalled();
  });

  it('수정 성공 시 성공 토스트 + 캐시 invalidate + router.back', async () => {
    mockUpdate.mockResolvedValue(detail);
    const { wrapper, queryClient } = setup();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEditPost(42), { wrapper });

    await waitFor(() => expect(result.current.form.getValues('title')).toBe('귀여운 강아지 입양'));

    act(() => {
      result.current.actions.handleSubmit(result.current.form.getValues());
    });

    await waitFor(() => expect(mockToast).toHaveBeenCalledWith('게시글을 수정했어요', 'success'));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['community'] });
    expect(router.back).toHaveBeenCalled();
  });
});
