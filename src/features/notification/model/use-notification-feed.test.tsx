import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { type ReactNode } from 'react';

import { NotificationDto } from '@/entities/notification';
import { authApi } from '@/shared/api/instance';

import { useNotificationFeed } from './use-notification-feed';

const mockOpen = jest.fn();
const mockClose = jest.fn();
jest.mock('@/shared/ui', () => ({
  useModal: () => ({ open: mockOpen, close: mockClose }),
  ConfirmModal: (props: Record<string, unknown>) => props
}));

const mockedApi = authApi as jest.Mocked<typeof authApi>;
const mockedPush = router.push as jest.Mock;

const item = (over: Partial<NotificationDto>): NotificationDto => ({
  id: 'n1',
  type: 'INQUIRY_ANSWERED',
  channel: 'BOTH',
  title: 't',
  body: 'b',
  imageUrl: null,
  refType: 'inquiry',
  refId: 'i1',
  readAt: null,
  createdAt: '2026-06-23T00:00:00Z',
  ...over
});

const wrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe('useNotificationFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApi.get.mockResolvedValue({
      data: {
        code: 'OK',
        message: '',
        data: {
          items: [item({ id: 'n1', readAt: null }), item({ id: 'n2', readAt: '2026-06-23T01:00:00Z' })],
          total: 2,
          page: 1,
          size: 20,
          hasNext: false
        }
      }
    } as never);
    mockedApi.patch.mockResolvedValue({ data: {} } as never);
    mockedApi.delete.mockResolvedValue({ data: {} } as never);
  });

  it('목록을 로드한다', async () => {
    const { result } = renderHook(() => useNotificationFeed(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(result.current.total).toBe(2);
  });

  it('미읽음 항목 탭 → markRead(PATCH) + 딥링크 이동', async () => {
    const { result } = renderHook(() => useNotificationFeed(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    act(() => result.current.openItem(item({ id: 'n1', refType: 'inquiry', refId: 'i1', readAt: null })));

    await waitFor(() => expect(mockedApi.patch).toHaveBeenCalledWith('/notifications/n1/read'));
    expect(mockedPush).toHaveBeenCalledWith('/(untabs)/profile/inquiry/i1');
  });

  it('이미 읽은 항목 탭 → markRead 호출 안 함', async () => {
    const { result } = renderHook(() => useNotificationFeed(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    act(() => result.current.openItem(item({ id: 'n2', readAt: '2026-06-23T01:00:00Z' })));

    expect(mockedApi.patch).not.toHaveBeenCalled();
  });

  it('refType 없으면 라우팅 안 함', async () => {
    const { result } = renderHook(() => useNotificationFeed(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    act(() => result.current.openItem(item({ id: 'n3', refType: null, refId: null, readAt: null })));

    expect(mockedPush).not.toHaveBeenCalled();
  });

  it('선택모드 진입·토글·선택 삭제(DELETE)', async () => {
    const { result } = renderHook(() => useNotificationFeed(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    act(() => result.current.enterSelectMode());
    expect(result.current.selectMode).toBe(true);

    act(() => result.current.toggleSelect('n1'));
    act(() => result.current.toggleSelect('n2'));
    expect(result.current.selectedIds).toEqual(['n1', 'n2']);

    act(() => result.current.toggleSelect('n1'));
    expect(result.current.selectedIds).toEqual(['n2']);

    act(() => result.current.deleteSelected());
    await waitFor(() => expect(mockedApi.delete).toHaveBeenCalledWith('/notifications/n2'));
    await waitFor(() => expect(result.current.selectMode).toBe(false));
  });

  it('선택 0개면 삭제 호출 안 함', async () => {
    const { result } = renderHook(() => useNotificationFeed(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    act(() => result.current.enterSelectMode());
    act(() => result.current.deleteSelected());
    expect(mockedApi.delete).not.toHaveBeenCalled();
  });

  it('전체 삭제 → 확인 모달 열고 confirm 시 DELETE /notifications (선택 무관)', async () => {
    const { result } = renderHook(() => useNotificationFeed(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    act(() => result.current.deleteAll());
    expect(mockOpen).toHaveBeenCalledTimes(1);

    const modalProps = mockOpen.mock.calls[0][0].props as { onConfirm: () => void };
    act(() => modalProps.onConfirm());
    await waitFor(() => expect(mockedApi.delete).toHaveBeenCalledWith('/notifications'));
  });

  it('알림 0개면 전체 삭제 확인 모달 안 띄움', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { code: 'OK', message: '', data: { items: [], total: 0, page: 1, size: 20, hasNext: false } }
    } as never);
    const { result } = renderHook(() => useNotificationFeed(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.total).toBe(0));

    act(() => result.current.deleteAll());
    expect(mockOpen).not.toHaveBeenCalled();
  });
});
