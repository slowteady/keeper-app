import { act, renderHook } from '@testing-library/react-native';

import { useShare } from './use-share';

const mockShare = jest.fn().mockResolvedValue({ action: 'sharedAction' });
const mockSetIsSharing = jest.fn();

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Share: { share: (...args: unknown[]) => mockShare(...args) },
  Alert: { alert: jest.fn() }
}));

jest.mock('../share/share-atom', () => ({
  useIsSharing: () => false,
  useSetIsSharing: () => mockSetIsSharing
}));

jest.mock('@/shared/lib', () => ({ pressHaptic: jest.fn() }));

describe('useShare', () => {
  beforeEach(() => {
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

  it('공유 URL은 token 없이 type/id 의미형 경로를 사용한다', async () => {
    const { result } = renderHook(() => useShare());

    await act(async () => {
      await result.current.share({ type: 'community', id: 'post 1' });
    });

    expect(mockShare).toHaveBeenCalledWith({
      message: 'Keeper에서 확인해보세요',
      url: 'https://our-keeper.com/share/community/post%201',
      title: 'Keeper'
    });
  });
});
