import { act, renderHook } from '@testing-library/react-native';

import { useIsAuthenticated, useSetIsAuthenticated } from './auth-state';

describe('auth-state', () => {
  afterEach(() => {
    const { result } = renderHook(() => useSetIsAuthenticated());
    act(() => result.current(false));
  });

  it('초기값은 false', () => {
    const { result } = renderHook(() => useIsAuthenticated());

    expect(result.current[0]).toBe(false);
  });

  it('useSetIsAuthenticated 로 값을 변경하면 useIsAuthenticated 에 반영', () => {
    const setter = renderHook(() => useSetIsAuthenticated());
    const reader = renderHook(() => useIsAuthenticated());

    act(() => setter.result.current(true));

    expect(reader.result.current[0]).toBe(true);
  });

  it('useIsAuthenticated 의 setter 로도 값 변경 가능', () => {
    const { result } = renderHook(() => useIsAuthenticated());

    act(() => result.current[1](true));

    expect(result.current[0]).toBe(true);
  });
});
