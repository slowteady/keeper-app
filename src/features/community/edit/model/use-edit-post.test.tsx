import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { type ReactNode, Suspense } from 'react';

import { CommunityAdoptDetailDto, communityQueries, type PostDetailUnion } from '@/entities/community';

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
    useBottomSheet: () => ({ present: mockPresent, dismiss: mockDismiss }),
    useBottomSheetMenu: () => ({ open: mockPresent })
  };
});

jest.mock('@/shared/lib', () => {
  const actual = jest.requireActual('@/shared/lib');
  return { ...actual, globalToast: (...args: unknown[]) => mockToast(...args) };
});

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() }
}));

jest.mock('@/shared/api/instance', () => ({
  authApi: { get: (...args: unknown[]) => mockGetDetail(...args), patch: jest.fn(), post: jest.fn() },
  publicApi: { get: jest.fn() }
}));

jest.mock('@/features/community/create/model/api', () => {
  const actual = jest.requireActual('@/features/community/create/model/api');
  return {
    ...actual,
    updateAdoptionPersonal: (...args: unknown[]) => mockUpdate(...args)
  };
});

const detail: CommunityAdoptDetailDto = {
  id: '42',
  user: { id: '1', image: '', nickname: 't' },
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

// useSuspenseQuery 가 cache hit 즉시 반환되도록 queryClient 에 prefill 한 상태로 hook 을 mount.
// (cache miss 케이스는 Page 의 Suspense fallback 으로 분리되어 hook 자체는 항상 data 가 있는 상태에서만 실행)
const setup = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false }
    }
  });
  const seeded: PostDetailUnion = { kind: 'ADOPT', adopt: detail };
  queryClient.setQueryData(communityQueries.detail('42').queryKey, seeded);

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>{children}</Suspense>
    </QueryClientProvider>
  );
  return { wrapper, queryClient };
};

describe('useEditPost', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDetail.mockResolvedValue({ data: { data: detail } });
  });

  it('cache hit 시 마운트 즉시 prefill — default(빈 값) 노출 없이 동기 렌더', () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useEditPost('42'), { wrapper });

    // waitFor 없이 동기 검증 — useSuspenseQuery 가 cache 즉시 반환 → defaultValues 에 detail 주입
    expect(result.current.form.getValues('title')).toBe('귀여운 강아지 입양');
    expect(result.current.form.getValues('animalType')).toBe('DOG');
    expect(result.current.form.getValues('contact')).toEqual([{ type: 'PHONE', value: '010-1111-2222' }]);
    expect(result.current.form.getValues('images')).toEqual(['https://img/1.png']);
  });

  it('handleSubmit 호출 시 updateAdoptionPersonal(postId, body) — 이미지는 폼 값 그대로 재전송', async () => {
    mockUpdate.mockResolvedValue(detail);
    const { wrapper } = setup();
    const { result } = renderHook(() => useEditPost('42'), { wrapper });

    act(() => {
      result.current.actions.handleSubmit(result.current.form.getValues());
    });

    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
    const [calledId, body] = mockUpdate.mock.calls[0];
    expect(calledId).toBe('42');
    expect(body.images).toEqual(['https://img/1.png']);
    expect(body.contacts).toEqual([{ type: 'PHONE', value: '010-1111-2222' }]);
  });

  it('actions.openAgeSelector / openKindSelector 도 함수로 노출되고 호출 시 present 호출', () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useEditPost('42'), { wrapper });

    expect(typeof result.current.actions.openAgeSelector).toBe('function');
    expect(typeof result.current.actions.openKindSelector).toBe('function');

    act(() => result.current.actions.openAgeSelector());
    act(() => result.current.actions.openKindSelector());

    expect(mockPresent).toHaveBeenCalledTimes(2);
  });

  it('detail cache invalidate 후에도 사용자가 수정 중인 폼 값은 덮어쓰지 않는다', async () => {
    const { wrapper, queryClient } = setup();
    const { result } = renderHook(() => useEditPost('42'), { wrapper });

    act(() => {
      result.current.form.setValue('title', '사용자가 직접 수정한 제목');
    });

    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: communityQueries.all() });
    });

    // form 은 useSuspenseQuery 의 data 와 분리된 state — 재조회되어도 사용자 입력 보존
    expect(result.current.form.getValues('title')).toBe('사용자가 직접 수정한 제목');
  });

  it('수정 실패 시 fail 토스트 (router.back 호출되지 않음)', async () => {
    mockUpdate.mockRejectedValue(new Error('500'));
    const { wrapper } = setup();
    const { result } = renderHook(() => useEditPost('42'), { wrapper });

    act(() => {
      result.current.actions.handleSubmit(result.current.form.getValues());
    });

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith('게시글 수정에 실패했어요. 잠시 후 다시 시도해주세요', 'fail')
    );
    expect(router.back).not.toHaveBeenCalled();
  });

  it('수정 성공 시 캐시 invalidate + router.back (Instagram BP — 성공 토스트 X)', async () => {
    mockUpdate.mockResolvedValue(detail);
    const { wrapper, queryClient } = setup();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useEditPost('42'), { wrapper });

    act(() => {
      result.current.actions.handleSubmit(result.current.form.getValues());
    });

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['community'] }));
    expect(router.back).toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });
});
