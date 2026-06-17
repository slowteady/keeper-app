import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { communityApi, communityQueries } from '@/entities/community';

import { usePostMenu } from './use-post-menu';

const mockPresent = jest.fn();
const mockDismiss = jest.fn();
const mockOpenModal = jest.fn();
const mockCloseModal = jest.fn();
const mockBlock = jest.fn();
const mockShare = jest.fn();

let mockUser: { id: string } | null = { id: '1' };

jest.mock('@/shared/ui', () => {
  const actual = jest.requireActual('@/shared/ui');
  return {
    ...actual,
    useBottomSheet: () => ({ present: mockPresent, dismiss: mockDismiss }),
    useModal: () => ({ open: mockOpenModal, close: mockCloseModal })
  };
});

jest.mock('@/entities/community', () => {
  const actual = jest.requireActual('@/entities/community');
  return {
    ...actual,
    communityApi: { ...actual.communityApi, deletePost: jest.fn() }
  };
});

jest.mock('@/features/community/safety', () => ({
  useBlock: () => ({ block: mockBlock, unblock: jest.fn(), isPending: false })
}));

jest.mock('@/features/auth', () => ({
  useCurrentUser: () => ({ user: mockUser, isLoggedIn: !!mockUser, isLoading: false }),
  useLoginRequired: () => ({
    requireLogin: async (cb?: () => void) => {
      await cb?.();
      return true;
    },
    isLoggedIn: !!mockUser
  })
}));

jest.mock('@/shared/model', () => {
  const actual = jest.requireActual('@/shared/model');
  return { ...actual, useShare: () => ({ share: mockShare }) };
});

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() }
}));

type MenuProps = { data: { id: string; label: string }[]; onPress: (d: { id: string; label: string }) => void };
const extractMenu = (call: unknown[]): MenuProps => {
  const node = call[0] as ReactElement<MenuProps>;
  expect(isValidElement(node)).toBe(true);
  return node.props;
};

// 액션은 메뉴 dismiss 완료 후(onDismiss)에 실행됨 — 시트 닫힘을 시뮬레이트
const fireDismiss = () => {
  const opts = mockPresent.mock.calls[0][1] as { onDismiss?: () => void };
  opts.onDismiss?.();
};

const setup = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = { id: '1' };
});

describe('usePostMenu', () => {
  it('타인 글이면 메뉴 = [신고, 차단]', () => {
    mockUser = { id: '99' };
    const { wrapper } = setup();
    const { result } = renderHook(() => usePostMenu({ postId: '10', authorId: '1' }), {
      wrapper
    });

    act(() => result.current.openPostMenu());

    const { data } = extractMenu(mockPresent.mock.calls[0]);
    expect(data.map((d) => d.id)).toEqual(['REPORT', 'BLOCK']);
  });

  it('hideBlock 이면 타인 글도 메뉴 = [신고] 만 (차단 제외)', () => {
    mockUser = { id: '99' };
    const { wrapper } = setup();
    const { result } = renderHook(() => usePostMenu({ postId: '10', authorId: '1', hideBlock: true }), {
      wrapper
    });

    act(() => result.current.openPostMenu());

    const { data } = extractMenu(mockPresent.mock.calls[0]);
    expect(data.map((d) => d.id)).toEqual(['REPORT']);
  });

  it('탈퇴한 사용자(authorId=null)의 글이면 메뉴 = [신고] 만', () => {
    mockUser = { id: '99' };
    const { wrapper } = setup();
    const { result } = renderHook(() => usePostMenu({ postId: '10', authorId: null }), {
      wrapper
    });

    act(() => result.current.openPostMenu());

    const { data } = extractMenu(mockPresent.mock.calls[0]);
    expect(data.map((d) => d.id)).toEqual(['REPORT']);
  });

  it('본인 글이면 메뉴 = [수정, 삭제]', () => {
    mockUser = { id: '1' };
    const { wrapper } = setup();
    const { result } = renderHook(() => usePostMenu({ postId: '10', authorId: '1' }), {
      wrapper
    });

    act(() => result.current.openPostMenu());

    const { data } = extractMenu(mockPresent.mock.calls[0]);
    expect(data.map((d) => d.id)).toEqual(['EDIT', 'DELETE']);
  });

  it('EDIT 선택 시 수정 페이지로 push + 시트 dismiss', () => {
    mockUser = { id: '1' };
    const { wrapper } = setup();
    const { result } = renderHook(() => usePostMenu({ postId: '42', authorId: '1' }), {
      wrapper
    });

    act(() => result.current.openPostMenu());
    const { onPress } = extractMenu(mockPresent.mock.calls[0]);

    act(() => onPress({ id: 'EDIT', label: '수정하기' }));
    expect(mockDismiss).toHaveBeenCalled();
    act(() => fireDismiss());

    expect(router.push).toHaveBeenCalledWith('/(untabs)/community/42/edit');
  });

  it('로그인 정보가 없으면 본인 판정 false → [신고, 차단]', () => {
    mockUser = null;
    const { wrapper } = setup();
    const { result } = renderHook(() => usePostMenu({ postId: '10', authorId: '1' }), {
      wrapper
    });

    act(() => result.current.openPostMenu());

    const { data } = extractMenu(mockPresent.mock.calls[0]);
    expect(data.map((d) => d.id)).toEqual(['REPORT', 'BLOCK']);
  });

  it('sharePost 호출 시 share 가 호출됨', () => {
    mockUser = { id: '99' };
    const { wrapper } = setup();
    const { result } = renderHook(() => usePostMenu({ postId: '42', authorId: '1' }), {
      wrapper
    });

    act(() => result.current.sharePost());

    expect(mockShare).toHaveBeenCalledWith({ type: 'community', id: '42' });
  });

  it('REPORT 선택 시 신고 모달 라우트로 push + dismiss', async () => {
    mockUser = { id: '99' };
    const { wrapper } = setup();
    const { result } = renderHook(() => usePostMenu({ postId: '42', authorId: '1' }), {
      wrapper
    });

    act(() => result.current.openPostMenu());
    const { onPress } = extractMenu(mockPresent.mock.calls[0]);

    act(() => onPress({ id: 'REPORT', label: '신고하기' }));
    expect(mockDismiss).toHaveBeenCalled();
    await act(async () => {
      fireDismiss();
    });

    expect(router.push).toHaveBeenCalledWith({ pathname: '/report', params: { type: 'POST', id: '42' } });
  });

  it('BLOCK 선택 시 block(authorId) 호출 + dismiss', async () => {
    mockUser = { id: '99' };
    const { wrapper } = setup();
    const { result } = renderHook(() => usePostMenu({ postId: '42', authorId: '7' }), {
      wrapper
    });

    act(() => result.current.openPostMenu());
    const { onPress } = extractMenu(mockPresent.mock.calls[0]);

    act(() => onPress({ id: 'BLOCK', label: '차단하기' }));
    expect(mockDismiss).toHaveBeenCalled();
    await act(async () => {
      fireDismiss();
    });

    expect(mockBlock).toHaveBeenCalledWith('7');
  });

  it('DELETE 선택 시 confirm 모달 → 확인 시 deletePost 호출 + invalidate + router.back', async () => {
    mockUser = { id: '1' };
    (communityApi.deletePost as jest.Mock).mockResolvedValue(undefined);
    const { queryClient, wrapper } = setup();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => usePostMenu({ postId: '42', authorId: '1' }), {
      wrapper
    });

    act(() => result.current.openPostMenu());
    const { onPress } = extractMenu(mockPresent.mock.calls[0]);

    act(() => onPress({ id: 'DELETE', label: '삭제하기' }));
    act(() => fireDismiss());

    expect(mockOpenModal).toHaveBeenCalledTimes(1);
    const confirmNode = mockOpenModal.mock.calls[0][0] as ReactElement<{ onConfirm: () => void }>;
    expect(isValidElement(confirmNode)).toBe(true);

    await act(async () => {
      confirmNode.props.onConfirm();
    });

    await waitFor(() => expect(communityApi.deletePost).toHaveBeenCalledWith('42'));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: communityQueries.all() });
    expect(router.back).toHaveBeenCalled();
  });

  it('목록 카드에서 삭제하면 현재 화면에 머문다', async () => {
    mockUser = { id: '1' };
    (communityApi.deletePost as jest.Mock).mockResolvedValue(undefined);
    const { wrapper } = setup();
    const { result } = renderHook(() => usePostMenu({ postId: '42', authorId: '1', stayOnDelete: true }), {
      wrapper
    });

    act(() => result.current.openPostMenu());
    const { onPress } = extractMenu(mockPresent.mock.calls[0]);
    act(() => onPress({ id: 'DELETE', label: '삭제하기' }));
    act(() => fireDismiss());
    const confirmNode = mockOpenModal.mock.calls[0][0] as ReactElement<{ onConfirm: () => void }>;

    await act(async () => {
      confirmNode.props.onConfirm();
    });

    await waitFor(() => expect(communityApi.deletePost).toHaveBeenCalledWith('42'));
    expect(router.back).not.toHaveBeenCalled();
  });
});
