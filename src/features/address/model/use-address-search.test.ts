import { act, renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import * as mutationModule from './mutation';
import { useAddressSearch } from './use-address-search';

describe('useAddressSearch', () => {
  it('빈 문자열이면 geocode를 호출하지 않는다', () => {
    const mutate = jest.fn();
    jest
      .spyOn(mutationModule, 'useKakaoGeocodeMutation')
      .mockReturnValue({ mutate, isPending: false } as unknown as ReturnType<
        typeof mutationModule.useKakaoGeocodeMutation
      >);

    const { result } = renderHook(() => useAddressSearch(), { wrapper: createWrapper() });

    act(() => result.current.submitGeocode('   '));

    expect(mutate).not.toHaveBeenCalled();
  });

  it('검색어가 있으면 query 로 geocode 를 호출한다', () => {
    const mutate = jest.fn();
    jest
      .spyOn(mutationModule, 'useKakaoGeocodeMutation')
      .mockReturnValue({ mutate, isPending: false } as unknown as ReturnType<
        typeof mutationModule.useKakaoGeocodeMutation
      >);

    const { result } = renderHook(() => useAddressSearch(), { wrapper: createWrapper() });

    act(() => result.current.submitGeocode('강남구'));

    expect(mutate).toHaveBeenCalledWith({ query: '강남구' }, expect.any(Object));
  });
});
