import { act, renderHook } from '@testing-library/react-native';

import { useDebounceFunc, useDebounceValue } from './use-debounce';

describe('useDebounceFunc', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('delay 후에 함수를 실행한다', () => {
    const fn = jest.fn();
    const { result } = renderHook(() => useDebounceFunc(fn, 300));

    act(() => {
      result.current('test');
    });

    expect(fn).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(fn).toHaveBeenCalledWith('test');
  });

  it('연속 호출 시 마지막 호출만 실행한다', () => {
    const fn = jest.fn();
    const { result } = renderHook(() => useDebounceFunc(fn, 300));

    act(() => {
      result.current('first');
      result.current('second');
      result.current('third');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('third');
  });

  it('언마운트 시 타이머가 정리된다', () => {
    const fn = jest.fn();
    const { result, unmount } = renderHook(() => useDebounceFunc(fn, 300));

    act(() => {
      result.current('test');
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(fn).not.toHaveBeenCalled();
  });
});

describe('useDebounceValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('delay 후에 값이 업데이트된다', () => {
    const { result, rerender } = renderHook(({ value }: { value: string }) => useDebounceValue(value, 300), {
      initialProps: { value: 'initial' }
    });

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });

    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });
});
