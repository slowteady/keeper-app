import { renderHook } from '@testing-library/react-native';

import { useCommunityAdoptFeed } from './useCommunityAdoptFeed';

describe('useCommunityAdoptFeed', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useCommunityAdoptFeed());

    expect(result.current).toHaveProperty('adoptList');
    expect(typeof result.current.goDetailPage).toBe('function');
    expect(Array.isArray(result.current.adoptList)).toBe(true);
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useCommunityAdoptFeed());

    expect(result.current).not.toHaveProperty('data');
    expect(result.current).not.toHaveProperty('actions');
  });
});
