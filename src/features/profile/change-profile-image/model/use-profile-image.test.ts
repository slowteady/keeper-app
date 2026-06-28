import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { useProfileImage } from './use-profile-image';

describe('useProfileImage', () => {
  it('returns flat object with changeProfileImage function', () => {
    const { result } = renderHook(() => useProfileImage(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('changeProfileImage');
    expect(typeof result.current.changeProfileImage).toBe('function');
  });
});
