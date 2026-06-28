import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { type ReactNode } from 'react';

import { authApi } from '@/shared/api/instance';

import { useNotificationPreferences } from './use-notification-preferences';

const mockedApi = authApi as jest.Mocked<typeof authApi>;

const ok = <T,>(data: T) => ({ data: { code: 'OK', message: '', data } }) as never;

const wrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe('useNotificationPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApi.get.mockResolvedValue(ok([{ category: 'COMMUNITY', enabled: true }]));
  });

  it('toggle 시 응답 전에 캐시를 낙관적으로 갱신한다', async () => {
    let resolvePatch: (v: unknown) => void = () => undefined;
    mockedApi.patch.mockReturnValue(
      new Promise((resolve) => {
        resolvePatch = resolve;
      }) as never
    );

    const { result } = renderHook(() => useNotificationPreferences(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isEnabled('COMMUNITY')).toBe(true));

    act(() => result.current.toggle('COMMUNITY', false));

    await waitFor(() => expect(result.current.isEnabled('COMMUNITY')).toBe(false));

    act(() => resolvePatch(ok({ category: 'COMMUNITY', enabled: false })));
  });

  it('mutation 실패 시 이전 값으로 롤백한다', async () => {
    mockedApi.patch.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useNotificationPreferences(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isEnabled('COMMUNITY')).toBe(true));

    act(() => result.current.toggle('COMMUNITY', false));

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.isEnabled('COMMUNITY')).toBe(true);
  });
});
