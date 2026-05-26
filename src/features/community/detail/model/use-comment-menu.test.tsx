import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { commentApi, commentQueries } from '@/entities/comment';

import { useCommentMenu } from './use-comment-menu';

const mockPresent = jest.fn();
const mockDismiss = jest.fn();
const mockOpenModal = jest.fn();
const mockCloseModal = jest.fn();
const mockBlock = jest.fn();
const mockOnEdit = jest.fn();

let mockUser: { id: number } | null = { id: 1 };

jest.mock('@/shared/ui', () => {
  const actual = jest.requireActual('@/shared/ui');
  return {
    ...actual,
    useBottomSheet: () => ({ present: mockPresent, dismiss: mockDismiss }),
    useModal: () => ({ open: mockOpenModal, close: mockCloseModal })
  };
});

jest.mock('@/entities/comment', () => {
  const actual = jest.requireActual('@/entities/comment');
  return {
    ...actual,
    commentApi: { ...actual.commentApi, remove: jest.fn() }
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

type MenuProps = { data: { id: string; label: string }[]; onPress: (d: { id: string; label: string }) => void };
const extractMenu = (call: unknown[]): MenuProps => {
  const node = call[0] as ReactElement<MenuProps>;
  expect(isValidElement(node)).toBe(true);
  return node.props;
};

const setup = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
};

const baseTarget = { commentId: 7, authorId: 1, content: '본문' };

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = { id: 1 };
});

describe('useCommentMenu', () => {
  it('타인 댓글이면 메뉴 = [신고, 차단]', () => {
    mockUser = { id: 99 };
    const { wrapper } = setup();
    const { result } = renderHook(() => useCommentMenu({ onEdit: mockOnEdit }), { wrapper });

    act(() => result.current.openCommentMenu(baseTarget));

    const { data } = extractMenu(mockPresent.mock.calls[0]);
    expect(data.map((d) => d.id)).toEqual(['REPORT', 'BLOCK']);
  });

  it('탈퇴한 사용자(authorId=null)의 댓글이면 메뉴 = [신고] 만', () => {
    mockUser = { id: 99 };
    const { wrapper } = setup();
    const { result } = renderHook(() => useCommentMenu({ onEdit: mockOnEdit }), { wrapper });

    act(() => result.current.openCommentMenu({ commentId: 7, authorId: null, content: '본문' }));

    const { data } = extractMenu(mockPresent.mock.calls[0]);
    expect(data.map((d) => d.id)).toEqual(['REPORT']);
  });

  it('본인 댓글이면 메뉴 = [수정, 삭제]', () => {
    mockUser = { id: 1 };
    const { wrapper } = setup();
    const { result } = renderHook(() => useCommentMenu({ onEdit: mockOnEdit }), { wrapper });

    act(() => result.current.openCommentMenu(baseTarget));

    const { data } = extractMenu(mockPresent.mock.calls[0]);
    expect(data.map((d) => d.id)).toEqual(['EDIT', 'DELETE']);
  });

  it('EDIT 선택 시 onEdit({commentId, content}) 호출 + dismiss', () => {
    mockUser = { id: 1 };
    const { wrapper } = setup();
    const { result } = renderHook(() => useCommentMenu({ onEdit: mockOnEdit }), { wrapper });

    act(() => result.current.openCommentMenu({ commentId: 7, authorId: 1, content: '원본' }));
    const { onPress } = extractMenu(mockPresent.mock.calls[0]);

    act(() => onPress({ id: 'EDIT', label: '수정하기' }));

    expect(mockDismiss).toHaveBeenCalled();
    expect(mockOnEdit).toHaveBeenCalledWith({ commentId: 7, content: '원본' });
  });

  it('REPORT 선택 시 신고 모달 라우트로 push + dismiss', async () => {
    mockUser = { id: 99 };
    const { wrapper } = setup();
    const { result } = renderHook(() => useCommentMenu({ onEdit: mockOnEdit }), { wrapper });

    act(() => result.current.openCommentMenu(baseTarget));
    const { onPress } = extractMenu(mockPresent.mock.calls[0]);

    await act(async () => {
      await onPress({ id: 'REPORT', label: '신고하기' });
    });

    expect(mockDismiss).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith({ pathname: '/report', params: { type: 'COMMENT', id: 7 } });
  });

  it('BLOCK 선택 시 block(authorId) 호출 + dismiss', async () => {
    mockUser = { id: 99 };
    const { wrapper } = setup();
    const { result } = renderHook(() => useCommentMenu({ onEdit: mockOnEdit }), { wrapper });

    act(() => result.current.openCommentMenu({ commentId: 7, authorId: 5, content: '본문' }));
    const { onPress } = extractMenu(mockPresent.mock.calls[0]);

    await act(async () => {
      await onPress({ id: 'BLOCK', label: '차단하기' });
    });

    expect(mockDismiss).toHaveBeenCalled();
    expect(mockBlock).toHaveBeenCalledWith(5);
  });

  it('DELETE 선택 시 confirm 모달 → 확인 시 commentApi.remove + invalidate', async () => {
    mockUser = { id: 1 };
    (commentApi.remove as jest.Mock).mockResolvedValue(undefined);
    const { queryClient, wrapper } = setup();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCommentMenu({ onEdit: mockOnEdit }), { wrapper });

    act(() => result.current.openCommentMenu(baseTarget));
    const { onPress } = extractMenu(mockPresent.mock.calls[0]);

    act(() => onPress({ id: 'DELETE', label: '삭제하기' }));

    expect(mockOpenModal).toHaveBeenCalledTimes(1);
    const confirmNode = mockOpenModal.mock.calls[0][0] as ReactElement<{ onConfirm: () => void }>;
    expect(isValidElement(confirmNode)).toBe(true);

    await act(async () => {
      confirmNode.props.onConfirm();
    });

    await waitFor(() => expect(commentApi.remove).toHaveBeenCalledWith(7));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: commentQueries.all() });
  });
});
