import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { useLocationBottomSheet } from './use-location-bottom-sheet';

describe('useLocationBottomSheet', () => {
  const mockOnSelect = jest.fn();

  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useLocationBottomSheet(mockOnSelect), { wrapper: createWrapper() });

    // state
    expect(result.current).toHaveProperty('results');
    expect(result.current).toHaveProperty('keyword');
    // refs
    expect(result.current).toHaveProperty('ref');
    // flags
    expect(result.current).toHaveProperty('isPending');
    expect(result.current).toHaveProperty('hasNextPage');
    // actions
    expect(typeof result.current.openBottomSheet).toBe('function');
    expect(typeof result.current.setKeyword).toBe('function');
    expect(typeof result.current.fetchNextPage).toBe('function');
    expect(typeof result.current.getAddress).toBe('function');
    expect(typeof result.current.dismiss).toBe('function');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useLocationBottomSheet(mockOnSelect), { wrapper: createWrapper() });

    expect(result.current).not.toHaveProperty('state');
    expect(result.current).not.toHaveProperty('refs');
    expect(result.current).not.toHaveProperty('flags');
    expect(result.current).not.toHaveProperty('actions');
  });
});
