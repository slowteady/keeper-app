import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { commentApi, commentQueries } from '@/entities/comment';

import { useCommentMenu } from './use-comment-menu';

const mockPresent = jest.fn();
const mockDismiss = jest.fn();
const mockOpenModal = jest.fn();
const mockCloseModal = jest.fn();
const mockOpenReportSheet = jest.fn();

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
  useReportSheet: () => ({ openReportSheet: mockOpenReportSheet, isPending: false })
}));

jest.mock('@/features/auth', () => ({
  useCurrentUser: () => ({ user: mockUser, isLoggedIn: !!mockUser, isLoading: false })
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

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = { id: 1 };
});

describe('useCommentMenu', () => {
  it('타인 댓글이면 메뉴에 [신고] 한 항목', () => {
    mockUser = { id: 99 };
    const { wrapper } = setup();
    const { result } = renderHook(() => useCommentMenu({ postId: 10 }), { wrapper });

    act(() => result.current.openCommentMenu({ commentId: 5, authorId: 1 }));

    const { data } = extractMenu(mockPresent.mock.calls[0]);
    expect(data.map((d) => d.id)).toEqual(['REPORT']);
  });

  it('본인 댓글이면 메뉴에 [삭제] 한 항목', () => {
    mockUser = { id: 1 };
    const { wrapper } = setup();
    const { result } = renderHook(() => useCommentMenu({ postId: 10 }), { wrapper });

    act(() => result.current.openCommentMenu({ commentId: 5, authorId: 1 }));

    const { data } = extractMenu(mockPresent.mock.calls[0]);
    expect(data.map((d) => d.id)).toEqual(['DELETE']);
  });

  it('REPORT 선택 시 openReportSheet 가 COMMENT/commentId 로 호출된다', () => {
    mockUser = { id: 99 };
    const { wrapper } = setup();
    const { result } = renderHook(() => useCommentMenu({ postId: 10 }), { wrapper });

    act(() => result.current.openCommentMenu({ commentId: 7, authorId: 1 }));
    const { onPress } = extractMenu(mockPresent.mock.calls[0]);

    act(() => onPress({ id: 'REPORT', label: '신고' }));

    // 같은 BottomSheet 컨텐츠 교체 — dismiss 호출하지 않는다
    expect(mockDismiss).not.toHaveBeenCalled();
    expect(mockOpenReportSheet).toHaveBeenCalledWith({ type: 'COMMENT', id: 7 });
  });

  it('DELETE 선택 시 confirm 모달 → 확인 시 commentApi.remove + invalidate comment list', async () => {
    mockUser = { id: 1 };
    (commentApi.remove as jest.Mock).mockResolvedValue(undefined);
    const { queryClient, wrapper } = setup();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCommentMenu({ postId: 10 }), { wrapper });

    act(() => result.current.openCommentMenu({ commentId: 7, authorId: 1 }));
    const { onPress } = extractMenu(mockPresent.mock.calls[0]);

    act(() => onPress({ id: 'DELETE', label: '삭제' }));

    expect(mockOpenModal).toHaveBeenCalledTimes(1);
    const confirmNode = mockOpenModal.mock.calls[0][0] as ReactElement<{ onConfirm: () => void }>;
    expect(isValidElement(confirmNode)).toBe(true);

    await act(async () => {
      confirmNode.props.onConfirm();
    });

    await waitFor(() => expect(commentApi.remove).toHaveBeenCalledWith(7));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [...commentQueries.all(), 'list', 10] });
  });
});
