import { act, renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { useAdoptFilter } from './use-adopt-filter';

const mockSetParams = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({})),
  useRouter: () => ({ setParams: mockSetParams })
}));

const { useLocalSearchParams } = require('expo-router');

describe('useAdoptFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
  });

  it('기본값을 반환한다', () => {
    const { result } = renderHook(() => useAdoptFilter(), { wrapper: createWrapper() });

    expect(result.current.selectedFilter).toBe('NEAR_DEADLINE');
    expect(result.current.selectedType).toBe('ALL');
    expect(result.current.selectedSearch).toBeUndefined();
  });

  it('URL 파라미터를 파싱한다', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ filter: 'NEW', type: 'DOG', search: '골든' });

    const { result } = renderHook(() => useAdoptFilter(), { wrapper: createWrapper() });

    expect(result.current.selectedFilter).toBe('NEW');
    expect(result.current.selectedType).toBe('DOG');
    expect(result.current.selectedSearch).toBe('골든');
  });

  it('잘못된 파라미터는 기본값으로 fallback한다', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ filter: 'INVALID', type: 'INVALID' });

    const { result } = renderHook(() => useAdoptFilter(), { wrapper: createWrapper() });

    expect(result.current.selectedFilter).toBe('NEAR_DEADLINE');
    expect(result.current.selectedType).toBe('ALL');
  });

  it('changeFilter 호출 시 router.setParams를 호출한다', () => {
    const { result } = renderHook(() => useAdoptFilter(), { wrapper: createWrapper() });

    act(() => result.current.changeFilter('NEW'));

    expect(mockSetParams).toHaveBeenCalledWith({ filter: 'NEW' });
  });

  it('changeType 호출 시 router.setParams를 호출한다', () => {
    const { result } = renderHook(() => useAdoptFilter(), { wrapper: createWrapper() });

    act(() => result.current.changeType('DOG'));

    expect(mockSetParams).toHaveBeenCalledWith({ type: 'DOG' });
  });

  it('changeSearch 호출 시 router.setParams를 호출한다', () => {
    const { result } = renderHook(() => useAdoptFilter(), { wrapper: createWrapper() });

    act(() => result.current.changeSearch('골든'));

    expect(mockSetParams).toHaveBeenCalledWith({ search: '골든' });
  });
});
