import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/shared/test/createWrapper';

import { useShelter } from './use-shelter';

describe('useShelter', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useShelter({ id: '1' }), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('shelterData');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('hasCallNumber');
    expect(typeof result.current.executeRefresh).toBe('function');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useShelter({ id: '1' }), { wrapper: createWrapper() });

    expect(result.current).not.toHaveProperty('data');
    expect(result.current).not.toHaveProperty('flags');
    expect(result.current).not.toHaveProperty('actions');
  });
});
