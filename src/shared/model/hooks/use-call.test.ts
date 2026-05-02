import { act, renderHook } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { createWrapper } from '@/test/create-wrapper';

import { useCall } from './use-call';

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn()
}));

jest.mock('expo-linking', () => ({
  openURL: jest.fn()
}));

describe('useCall', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
    (Platform as any).isPad = false;
  });

  it('flat 객체를 반환한다', () => {
    const { result } = renderHook(() => useCall(), { wrapper: createWrapper() });

    expect(typeof result.current.copy).toBe('function');
    expect(typeof result.current.call).toBe('function');
    expect(result.current).not.toHaveProperty('actions');
  });

  it('copy 호출 시 클립보드에 복사한다', async () => {
    const { result } = renderHook(() => useCall(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.copy('010-1234-5678');
    });

    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('010-1234-5678');
  });

  it('call 호출 시 tel: URL을 연다', async () => {
    const { result } = renderHook(() => useCall(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.call('010-1234-5678');
    });

    expect(Linking.openURL).toHaveBeenCalledWith('tel:01012345678');
  });

  it('openURL 실패 시 복사로 폴백한다', async () => {
    (Linking.openURL as jest.Mock).mockRejectedValueOnce(new Error('fail'));

    const { result } = renderHook(() => useCall(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.call('010-1234-5678');
    });

    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('01012345678');
  });
});
