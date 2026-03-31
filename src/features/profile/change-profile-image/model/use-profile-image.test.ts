import { renderHook } from '@testing-library/react-native';

import { useProfileImage } from './use-profile-image';

describe('useProfileImage', () => {
  it('returns flat object with changeProfileImage function', () => {
    const { result } = renderHook(() => useProfileImage());

    expect(result.current).toHaveProperty('changeProfileImage');
    expect(typeof result.current.changeProfileImage).toBe('function');
  });
});
