import { act, renderHook } from '@testing-library/react-native';

import { useShare } from './use-share';

const mockShare = jest.fn().mockResolvedValue({ action: 'sharedAction' });
const mockSetIsSharing = jest.fn();
const mockTrack = jest.fn();

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Share: { share: (...args: unknown[]) => mockShare(...args), sharedAction: 'sharedAction' },
  Alert: { alert: jest.fn() }
}));

jest.mock('../share/share-atom', () => ({
  useIsSharing: () => false,
  useSetIsSharing: () => mockSetIsSharing
}));

jest.mock('@/shared/lib', () => ({ pressHaptic: jest.fn() }));

jest.mock('@/shared/lib/analytics', () => ({
  ANALYTICS_EVENT: { contentShared: 'content_shared' },
  useAnalytics: () => ({ track: mockTrack })
}));

describe('useShare', () => {
  beforeEach(() => {
    mockShare.mockClear();
    mockSetIsSharing.mockClear();
    mockTrack.mockClear();
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

  it('공유 URL은 token 없이 type/id 의미형 경로를 사용하고 앱 유입 utm 을 붙인다', async () => {
    const { result } = renderHook(() => useShare());

    await act(async () => {
      await result.current.share({ type: 'community', id: 'post 1' });
    });

    expect(mockShare).toHaveBeenCalledWith({
      url: 'https://our-keeper.com/share/community/post%201?utm_source=app&utm_medium=share',
      title: 'keeper'
    });
  });

  it('앱 공유도 utm 을 붙인다', async () => {
    const { result } = renderHook(() => useShare());

    await act(async () => {
      await result.current.share({ type: 'app' });
    });

    expect(mockShare).toHaveBeenCalledWith({
      url: 'https://our-keeper.com?utm_source=app&utm_medium=share',
      title: 'keeper'
    });
  });

  it('공유 성공 시 platform 과 함께 content_shared 를 기록한다', async () => {
    const { result } = renderHook(() => useShare());

    await act(async () => {
      await result.current.share({ type: 'adopt', id: 7 });
    });

    expect(mockTrack).toHaveBeenCalledWith('content_shared', { type: 'adopt', id: '7', platform: 'ios' });
  });

  it('앱 공유는 id 없이 기록한다', async () => {
    const { result } = renderHook(() => useShare());

    await act(async () => {
      await result.current.share({ type: 'app' });
    });

    expect(mockTrack).toHaveBeenCalledWith('content_shared', { type: 'app', platform: 'ios' });
  });

  it('공유를 취소하면 기록하지 않는다', async () => {
    mockShare.mockResolvedValueOnce({ action: 'dismissedAction' });
    const { result } = renderHook(() => useShare());

    await act(async () => {
      await result.current.share({ type: 'adopt', id: 7 });
    });

    expect(mockTrack).not.toHaveBeenCalled();
  });
});
