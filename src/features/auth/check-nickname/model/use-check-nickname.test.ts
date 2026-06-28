import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { useCheckNickname } from './use-check-nickname';

describe('useCheckNickname', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useCheckNickname(''), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('nickname');
    expect(result.current).toHaveProperty('nicknameStatus');
    expect(result.current).toHaveProperty('isChecking');
    expect(result.current).toHaveProperty('isComplete');
    expect(typeof result.current.changeNickname).toBe('function');
    expect(typeof result.current.clearNickname).toBe('function');
  });
});
