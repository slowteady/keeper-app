import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/shared/test/createWrapper';

import { useLikePost } from './useLikePost';

describe('useLikePost', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useLikePost(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('toggleLikePost');
    expect(result.current).toHaveProperty('toggleLikeComment');
    expect(typeof result.current.toggleLikePost).toBe('function');
    expect(typeof result.current.toggleLikeComment).toBe('function');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useLikePost(), { wrapper: createWrapper() });

    expect(result.current).not.toHaveProperty('actions');
  });
});
