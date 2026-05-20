import { act, renderHook } from '@testing-library/react-native';

import { useShare } from './use-share';

const mockImpactAsync = jest.fn().mockResolvedValue(undefined);
const mockShare = jest.fn().mockResolvedValue({ action: 'sharedAction' });
const mockSetIsSharing = jest.fn();

jest.mock('expo-haptics', () => ({
  impactAsync: (...args: unknown[]) => mockImpactAsync(...args),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' }
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Share: { share: (...args: unknown[]) => mockShare(...args) },
  Alert: { alert: jest.fn() }
}));

jest.mock('../share/share-atom', () => ({
  useIsSharing: () => false,
  useSetIsSharing: () => mockSetIsSharing
}));

describe('useShare', () => {
  beforeEach(() => {
    mockImpactAsync.mockClear();
    mockShare.mockClear();
    mockSetIsSharing.mockClear();
  });

  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useShare());

    expect(result.current).toHaveProperty('share');
    expect(typeof result.current.share).toBe('function');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useShare());

    expect(result.current).not.toHaveProperty('actions');
  });

  it('share 호출 시 Light haptic 한 번 — 일회성 trigger 피드백', async () => {
    const { result } = renderHook(() => useShare());

    await act(async () => {
      await result.current.share({ title: '테스트', desc: '설명' });
    });

    expect(mockImpactAsync).toHaveBeenCalledTimes(1);
    expect(mockImpactAsync).toHaveBeenCalledWith('light');
  });

  it('share sheet 표시 전에 haptic 이 먼저 발생 — 사용자가 "눌렸나?" 의문 갖기 전에', async () => {
    const callOrder: string[] = [];
    mockImpactAsync.mockImplementationOnce(async () => {
      callOrder.push('haptic');
    });
    mockShare.mockImplementationOnce(async () => {
      callOrder.push('sheet');
      return { action: 'sharedAction' };
    });

    const { result } = renderHook(() => useShare());
    await act(async () => {
      await result.current.share({ title: 't', desc: 'd' });
    });

    expect(callOrder).toEqual(['haptic', 'sheet']);
  });
});
